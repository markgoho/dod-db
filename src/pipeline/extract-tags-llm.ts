/**
 * LLM-based tag discovery for terms not in vocabulary.
 * Asks Gemini which subjects the episode discusses, then verifies each
 * suggestion against the transcript and the vocabulary in code.
 */

import { z } from "zod";
import { ai } from "../ai.js";
import { tagDiscoveryModel } from "../config/models.js";
import type { TagCategory, TagDefinition } from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import {
  TagDiscoverySchema,
  tagExtractionPrompt,
} from "../prompts/tag-extraction.js";
import type { EpisodeTag } from "../storage/processed-videos.js";
import { isScriptureTag } from "../utils/is-scripture-tag.js";
import { addTagToVocabulary } from "./add-tag-to-vocabulary.js";
import { tagExists } from "./tag-exists.js";
import { updateTagInVocabulary } from "./update-tag-in-vocabulary.js";

function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Count verbatim mentions of a term and its variations, longest first,
 * without double-counting overlapping matches.
 */
export function countMentions(
  transcript: string,
  terms: string[],
  caseSensitive = false,
): number {
  const matched: Array<{ start: number; end: number }> = [];
  const unique = [...new Set(terms.filter(t => t.trim().length > 0))];
  for (const term of unique.toSorted((a, b) => b.length - a.length)) {
    const pattern = new RegExp(
      String.raw`\b${escapeRegex(term)}\b`,
      caseSensitive ? "g" : "gi",
    );
    for (const match of transcript.matchAll(pattern)) {
      const start = match.index;
      const end = start + match[0].length;
      if (matched.some(r => start < r.end && end > r.start)) continue;
      matched.push({ start, end });
    }
  }
  return matched.length;
}

/**
 * Drop variations that repeat the canonical name or each other when case is
 * ignored. Matching is case-insensitive, so those entries add nothing.
 */
export function dedupeVariations(
  canonical: string,
  variations: string[] = [],
): string[] {
  const seen = new Set([canonical.trim().toLowerCase()]);
  const result: string[] = [];
  for (const variation of variations) {
    const key = variation.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    result.push(variation.trim());
  }
  return result;
}

function indexTerms(tags: TagDefinition[]): Map<string, TagDefinition> {
  const index = new Map<string, TagDefinition>();
  for (const tag of tags) {
    for (const term of [tag.canonical, ...tag.variations]) {
      index.set(term.toLowerCase(), tag);
    }
  }
  return index;
}

/**
 * Use LLM to discover subjects of this episode that are not accepted tags yet.
 * New subjects are added as 'proposed'. Pending proposals that recur in this
 * episode get the episode appended to their `episodes` list.
 *
 * @param transcript - The transcript text to analyze
 * @param existingTags - Tags already found by deterministic matching
 * @param allowedCategories - If provided, only discover tags in these categories
 * @param episodeNumber - If provided, recorded on new and recurring proposals
 * @param vocabulary - Vocabulary to check against (defaults to the live vocabulary)
 * @returns Array of newly proposed tags with verbatim mention counts
 */
export async function extractTagsLlm(
  transcript: string,
  existingTags: EpisodeTag[],
  allowedCategories?: TagCategory[],
  episodeNumber?: number,
  vocabulary: TagDefinition[] = tagVocabulary,
): Promise<EpisodeTag[]> {
  const byStatus = (status: TagDefinition["status"]) =>
    vocabulary.filter(t => t.status === status);
  const accepted = byStatus("accepted");
  const proposed = byStatus("proposed");
  const rejected = byStatus("rejected");

  const knownTerms = indexTerms([...accepted, ...rejected]);
  for (const t of existingTags) {
    knownTerms.set(t.tag.toLowerCase(), { canonical: t.tag } as TagDefinition);
  }
  const proposedTerms = indexTerms(proposed);

  try {
    const startTime = Date.now();
    console.log(
      `    → Sending ${transcript.length.toLocaleString()} chars to ${tagDiscoveryModel}...`,
    );

    const response = await ai.models.generateContent({
      model: tagDiscoveryModel,
      contents: tagExtractionPrompt(
        transcript,
        {
          accepted: accepted.map(t => t.canonical),
          proposed: proposed.map(t => t.canonical),
          rejected: rejected.map(t => t.canonical),
        },
        allowedCategories,
      ),
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(TagDiscoverySchema),
      },
    });

    console.log(`    ← LLM responded in ${Date.now() - startTime}ms`);

    const responseText = response.text;
    if (!responseText) {
      console.warn("  ⚠ Tag discovery returned empty response");
      return [];
    }

    const output = TagDiscoverySchema.parse(JSON.parse(responseText));
    const discovered: EpisodeTag[] = [];

    for (const t of output.tags) {
      const variations = dedupeVariations(t.tag, t.variations);
      const terms = [t.tag, ...variations];

      if (isScriptureTag(t.tag)) {
        console.log(
          `    Filtering out "${t.tag}" (scripture handled separately)`,
        );
        continue;
      }
      if (
        allowedCategories &&
        !allowedCategories.includes(t.category as TagCategory)
      ) {
        console.log(
          `    Filtering out "${t.tag}" (category "${t.category}" not in allowed list)`,
        );
        continue;
      }

      const pending = terms
        .map(term => proposedTerms.get(term.toLowerCase()))
        .find(Boolean);
      if (pending) {
        await recordRecurrence(pending, episodeNumber);
        continue;
      }

      const known = terms
        .map(term => knownTerms.get(term.toLowerCase()))
        .find(Boolean);
      if (known) {
        console.log(
          `    Filtering out "${t.tag}" (already in vocabulary as "${known.canonical}")`,
        );
        continue;
      }

      const mentions = countMentions(transcript, terms, t.caseSensitive);
      if (mentions === 0) {
        console.log(
          `    Filtering out "${t.tag}" (no verbatim match in transcript)`,
        );
        continue;
      }

      console.log(`    + "${t.tag}" (${mentions} mentions) — ${t.reason}`);
      discovered.push({ tag: t.tag, mentions });

      if (tagExists(t.tag)) {
        console.log(`    "${t.tag}" already exists in vocabulary`);
        continue;
      }

      try {
        await addTagToVocabulary({
          canonical: t.tag,
          variations,
          category: t.category as TagCategory,
          status: "proposed",
          description: t.description,
          caseSensitive: t.caseSensitive,
          addedInEpisode: episodeNumber,
          episodes: episodeNumber === undefined ? undefined : [episodeNumber],
        });
      } catch (error) {
        console.error(`    Failed to add "${t.tag}" to vocabulary:`, error);
      }
    }

    return discovered;
  } catch (error) {
    console.error("  ⚠ Tag discovery failed:", error);
    return [];
  }
}

async function recordRecurrence(
  tag: TagDefinition,
  episodeNumber: number | undefined,
): Promise<void> {
  const episodes = new Set(tag.episodes ?? []);
  if (tag.addedInEpisode !== undefined) episodes.add(tag.addedInEpisode);
  if (episodeNumber === undefined) {
    console.log(`    ↻ "${tag.canonical}" pending review (no episode number)`);
    return;
  }
  if (episodes.has(episodeNumber)) {
    console.log(`    ↻ "${tag.canonical}" pending review (already recorded)`);
    return;
  }
  episodes.add(episodeNumber);
  console.log(
    `    ↻ "${tag.canonical}" pending review, now seen in ${episodes.size} episode(s)`,
  );
  try {
    await updateTagInVocabulary(tag.canonical, { episodes: [...episodes] });
  } catch (error) {
    console.error(
      `    Failed to record recurrence for "${tag.canonical}":`,
      error,
    );
  }
}
