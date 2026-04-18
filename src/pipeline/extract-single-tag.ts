/**
 * Extract a single tag from transcript.
 * Used when adding a new tag to vocabulary - only processes that one tag.
 */

import type { TagDefinition } from "../config/tag-vocabulary.js";
import { tagVocabulary } from "../config/tag-vocabulary.js";
import type { EpisodeTag } from "../storage/processed-videos.js";
import { verifyTagMatches, type EpisodeContext } from "./verify-tag-matches.js";

/**
 * Extract mentions of a single tag from transcript.
 * More efficient than full extraction when you only need one tag.
 *
 * @param transcript - The transcript text to analyze
 * @param canonical - The canonical tag name to search for
 * @param enableLlmVerification - If true, use LLM to verify ambiguous matches
 * @param episodeContext - Optional episode information for logging
 * @returns EpisodeTag object with mention count, or undefined if no matches
 */
export async function extractSingleTag(
  transcript: string,
  canonical: string,
  enableLlmVerification = true,
  episodeContext?: EpisodeContext,
): Promise<EpisodeTag | undefined> {
  // Find tag definition
  const tagDef = tagVocabulary.find(t => t.canonical === canonical);
  if (!tagDef) {
    throw new Error(`Tag "${canonical}" not found in vocabulary`);
  }

  const needsVerification =
    enableLlmVerification && "llmVerify" in tagDef && tagDef.llmVerify;

  const searchTerms = [tagDef.canonical, ...tagDef.variations];

  // Sort by length (longest first) to handle overlaps
  searchTerms.sort((a, b) => b.length - a.length);

  // Escape special regex characters
  const escapeRegex = (string_: string): string => {
    return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  };

  // Find all speaker label regions to exclude from matching
  // Pattern: [HH:MM:SS.mmm] Speaker Name:
  const speakerLabelRanges: Array<{ start: number; end: number }> = [];
  const speakerLabelPattern = /\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+([^:]+):/g;
  let speakerMatch;
  while ((speakerMatch = speakerLabelPattern.exec(transcript)) !== null) {
    // Only exclude the speaker name portion (not the timestamp or colon)
    const fullMatch = speakerMatch[0]; // e.g., "[00:00:09.120] Aaron Adair:"
    const speakerName = speakerMatch[1]; // e.g., "Aaron Adair"
    if (!speakerName) continue; // Skip if no capture group match
    const speakerNameStart =
      speakerMatch.index + fullMatch.indexOf(speakerName);
    const speakerNameEnd = speakerNameStart + speakerName.length;
    speakerLabelRanges.push({ start: speakerNameStart, end: speakerNameEnd });
  }

  // Track matched positions to avoid double-counting
  const matchedRanges: Array<{ start: number; end: number }> = [];
  const matches: Array<{ start: number; end: number; text: string }> = [];

  const isOverlapping = (start: number, end: number): boolean => {
    return matchedRanges.some(
      range => !(end <= range.start || start >= range.end),
    );
  };

  // Check if a range falls within a speaker label
  const isInSpeakerLabel = (start: number, end: number): boolean => {
    return speakerLabelRanges.some(
      range => start >= range.start && end <= range.end,
    );
  };

  // Determine case sensitivity
  const caseSensitive = tagDef.caseSensitive ?? false;
  const flags = caseSensitive ? "g" : "gi";

  // Find all matches (canonical + variations)
  for (const searchTerm of searchTerms) {
    const pattern = new RegExp(
      String.raw`\b${escapeRegex(searchTerm)}\b`,
      flags,
    );
    let match;

    while ((match = pattern.exec(transcript)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (isOverlapping(start, end) || isInSpeakerLabel(start, end)) {
        continue;
      }

      matchedRanges.push({ start, end });
      matches.push({ start, end, text: match[0] });
    }
  }

  if (matches.length === 0) {
    return undefined;
  }

  let totalMentions = matches.length;

  if (needsVerification) {
    console.log(
      `    Verifying ${matches.length} matches for "${canonical}"...`,
    );
    const verifiedIndices = await verifyTagMatches(
      transcript,
      matches,
      tagDef as TagDefinition & { llmVerify: true },
      episodeContext,
    );
    totalMentions = verifiedIndices.length;
    console.log(`    ✓ ${verifiedIndices.length}/${matches.length} verified`);
  }

  if (totalMentions === 0) {
    return undefined;
  }

  return {
    tag: canonical,
    mentions: totalMentions,
  };
}
