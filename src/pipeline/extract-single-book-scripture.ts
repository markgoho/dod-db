/**
 * Extract scripture references for a single book only.
 * Useful for targeted extraction when adding a new book.
 */

import type { BookDefinition } from "../config/scripture-books.js";
import { scriptureBooks } from "../config/scripture-books.js";
import { buildBookRegex } from "./build-book-regex.js";
import type { EpisodeScripture } from "./extract-scripture.js";
import { findSpeakerLabelRanges } from "./find-speaker-label-ranges.js";
import { isInSpeakerLabel } from "./is-in-speaker-label.js";
import { normalizeReference } from "./normalize-reference.js";
import { verifyScriptureMatches } from "./verify-scripture-matches.js";
import type { EpisodeContext } from "./verify-tag-matches.js";

interface MatchInfo {
  book: BookDefinition;
  reference: string;
  start: number;
  end: number;
  rawText: string;
}

/**
 * Check if a range overlaps with any already-matched range.
 * (Private helper - only used by this function)
 */
function isOverlapping(
  start: number,
  end: number,
  matchedRanges: Array<{ start: number; end: number }>,
): boolean {
  return matchedRanges.some(
    range => !(end <= range.start || start >= range.end),
  );
}

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
      b.abbreviations.some(a => a.toLowerCase() === bookName.toLowerCase()) ||
      b.variants.some(v => v.toLowerCase() === bookName.toLowerCase()),
  );

  if (!book) {
    return undefined;
  }

  const { enableLlmVerification = false, episodeContext } = options;

  const speakerLabelRanges = findSpeakerLabelRanges(transcript);
  const matchedRanges: Array<{ start: number; end: number }> = [];
  const matches: MatchInfo[] = [];

  const regex = buildBookRegex(book);
  let match;

  while ((match = regex.exec(transcript)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    if (isOverlapping(start, end, matchedRanges)) {
      continue;
    }

    if (isInSpeakerLabel(start, end, speakerLabelRanges)) {
      continue;
    }

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

  const uniqueReferences = [
    ...new Set(verifiedMatches.map(m => m.reference)),
  ].sort();

  return {
    book: book.canonical,
    references: uniqueReferences,
    mentions: verifiedMatches.length,
  };
}
