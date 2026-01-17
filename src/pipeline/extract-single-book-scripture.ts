/**
 * Extract scripture references for a single book only.
 * Useful for targeted extraction when adding a new book.
 */

import { scriptureBooks } from "../config/scripture-books.js";
import type { EpisodeScripture } from "./extract-scripture.js";
import {
  buildBookRegex,
  findSpeakerLabelRanges,
  isInSpeakerLabel,
  isOverlapping,
  type MatchInfo,
  normalizeReference,
} from "./extract-scripture-helpers.js";
import type { EpisodeContext } from "./verify-tag-matches.js";
import { verifyScriptureMatches } from "./verify-scripture-matches.js";

export async function extractSingleBookScripture(
  transcript: string,
  bookName: string,
  options: {
    enableLlmVerification?: boolean;
    episodeContext?: EpisodeContext;
  } = {},
): Promise<EpisodeScripture | undefined> {
  const book = scriptureBooks.find(
    b =>
      b.canonical.toLowerCase() === bookName.toLowerCase() ||
      b.abbreviations.some(
        a => a.toLowerCase() === bookName.toLowerCase(),
      ) ||
      b.variants.some(v => v.toLowerCase() === bookName.toLowerCase()),
  );

  if (!book) {
    return undefined;
  }

  const { enableLlmVerification = false, episodeContext } = options;

  // Find speaker label regions to exclude
  const speakerLabelRanges = findSpeakerLabelRanges(transcript);

  // Track matched positions
  const matchedRanges: Array<{ start: number; end: number }> = [];
  const matches: MatchInfo[] = [];

  const regex = buildBookRegex(book);
  let match;

  while ((match = regex.exec(transcript)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    // Skip if overlaps with already-matched region
    if (isOverlapping(start, end, matchedRanges)) {
      continue;
    }

    // Skip if in speaker label
    if (isInSpeakerLabel(start, end, speakerLabelRanges)) {
      continue;
    }

    // Extract chapter and verse info
    const chapter = match[1];
    const verse = match[2];
    const endVerse = match[3];

    if (!chapter) continue;

    const reference = normalizeReference(book, chapter, verse, endVerse);

    matches.push({
      book,
      reference,
      start,
      end,
      rawText: match[0],
    });

    matchedRanges.push({ start, end });
  }

  if (matches.length === 0) {
    return undefined;
  }

  // Handle LLM verification if needed
  let verifiedMatches = matches;
  const needsVerification =
    enableLlmVerification && "llmVerify" in book && book.llmVerify;

  if (needsVerification) {
    const verifiedIndices = await verifyScriptureMatches(
      transcript,
      matches.map(m => ({ start: m.start, end: m.end, text: m.rawText })),
      book,
      episodeContext,
    );

    verifiedMatches = verifiedIndices
      .map(index => matches[index])
      .filter((m): m is MatchInfo => m !== undefined);

    if (verifiedMatches.length === 0) {
      return undefined;
    }
  }

  // Get unique references
  const uniqueReferences = [
    ...new Set(verifiedMatches.map(m => m.reference)),
  ].sort();

  return {
    book: book.canonical,
    references: uniqueReferences,
    mentions: verifiedMatches.length,
  };
}
