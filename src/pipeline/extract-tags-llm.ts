/**
 * LLM-based tag discovery for terms not in vocabulary.
 * Uses Gemini AI to discover new high-value tags (5+ mentions).
 */

import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";
import type { TagCategory } from "../config/tag-vocabulary.js";
import {
  getAllSearchableTerms,
  tagVocabulary,
} from "../config/tag-vocabulary.js";
import {
  TagDiscoverySchema,
  tagExtractionPrompt,
} from "../prompts/tag-extraction.js";
import type { EpisodeTag } from "../storage/processed-videos.js";
import { isScriptureTag } from "../utils/is-scripture-tag.js";
import { addTagToVocabulary } from "./add-tag-to-vocabulary.js";
import { tagExists } from "./tag-exists.js";

/**
 * Use LLM to discover new tags not in vocabulary.
 * Only extracts tags with 5+ mentions to minimize noise.
 *
 * @param transcript - The transcript text to analyze
 * @param existingTags - Tags already found by deterministic matching (to exclude from LLM search)
 * @param allowedCategories - If provided, only discover tags in these categories
 * @param episodeNumber - If provided, newly added tags will be marked with this episode number
 * @returns Array of newly discovered tags
 */
export async function extractTagsLlm(
  transcript: string,
  existingTags: EpisodeTag[],
  allowedCategories?: TagCategory[],
  episodeNumber?: number,
): Promise<EpisodeTag[]> {
  // Build comprehensive exclusion set from vocabulary (canonical + all variations)
  const vocabularyTerms = getAllSearchableTerms(tagVocabulary);
  const allKnownTerms = new Set<string>();
  for (const term of vocabularyTerms.keys()) {
    allKnownTerms.add(term.toLowerCase());
  }

  // Also add existing tags (in case deterministic found something)
  for (const t of existingTags) {
    allKnownTerms.add(t.tag.toLowerCase());
  }

  try {
    const startTime = Date.now();
    const transcriptLength = transcript.length;
    console.log(
      `    → Sending ${transcriptLength.toLocaleString()} chars to Gemini 2.0 Flash...`,
    );

    const response = await ai.models.generateContent({
      model: speakerIdModel, // gemini-2.0-flash (fast, cheap)
      contents: tagExtractionPrompt(
        transcript,
        [...allKnownTerms],
        allowedCategories,
      ),
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(TagDiscoverySchema),
      },
    });

    const elapsed = Date.now() - startTime;
    console.log(`    ← LLM responded in ${elapsed}ms`);

    const responseText = response.text;
    if (!responseText) {
      console.warn("  ⚠ Tag discovery returned empty response");
      return [];
    }

    const output = TagDiscoverySchema.parse(JSON.parse(responseText));

    // Filter to only tags with 3+ mentions AND not in vocabulary AND in allowed categories
    // (double-check in case LLM still returns a vocabulary term or wrong category)
    const validTags = output.tags.filter(t => {
      if (t.mentions < 3) return false;
      if (isScriptureTag(t.tag)) {
        console.log(
          `    Filtering out "${t.tag}" (scripture handled separately)`,
        );
        return false;
      }
      if (allKnownTerms.has(t.tag.toLowerCase())) {
        console.log(`    Filtering out "${t.tag}" (already in vocabulary)`);
        return false;
      }
      if (
        allowedCategories &&
        !allowedCategories.includes(t.category as TagCategory)
      ) {
        console.log(
          `    Filtering out "${t.tag}" (category "${t.category}" not in allowed list)`,
        );
        return false;
      }
      return true;
    });

    // Auto-add discovered tags to vocabulary with 'proposed' status
    for (const tag of validTags) {
      // Check if already added (e.g., from a previous run)
      if (tagExists(tag.tag)) {
        console.log(`    "${tag.tag}" already exists in vocabulary`);
        continue;
      }

      try {
        await addTagToVocabulary({
          canonical: tag.tag,
          variations: tag.variations ?? [],
          category: tag.category as TagCategory,
          status: "proposed",
          description: tag.description,
          caseSensitive: tag.caseSensitive,
          addedInEpisode: episodeNumber,
        });
      } catch (error) {
        console.error(`    Failed to add "${tag.tag}" to vocabulary:`, error);
      }
    }

    return validTags.map(t => ({
      tag: t.tag,
      mentions: t.mentions,
    }));
  } catch (error) {
    console.error("  ⚠ Tag discovery failed:", error);
    return [];
  }
}
