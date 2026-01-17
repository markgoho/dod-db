/**
 * Shared helper functions for scripture extraction.
 */

import type { BookDefinition } from "../config/scripture-books.js";

export interface MatchInfo {
  book: BookDefinition;
  reference: string;
  start: number;
  end: number;
  rawText: string;
}

/**
 * Escape special regex characters in a string.
 */
export function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Build all possible name patterns for a book (canonical, abbreviations, variants).
 * Handles numbered books specially (e.g., "1 Samuel", "1st Samuel", "I Samuel").
 */
export function buildBookNamePatterns(book: BookDefinition): string[] {
  // Start with canonical name
  const patterns: string[] = [escapeRegex(book.canonical)];

  // Add abbreviations (with optional period)
  for (const abbreviation of book.abbreviations) {
    // Match with or without trailing period: "Gen" or "Gen."
    patterns.push(`${escapeRegex(abbreviation)}${String.raw`\.?`}`);
  }

  // Add variants
  for (const variant of book.variants) {
    patterns.push(escapeRegex(variant));
  }

  return patterns;
}

/**
 * Build regex pattern for detecting scripture references to a specific book.
 * Matches patterns like:
 * - "Genesis 1" (chapter only)
 * - "Genesis 1:25" (chapter:verse)
 * - "Genesis 1:1-10" (verse range)
 * - "Gen 1:25" (abbreviation)
 * - "Gen. 1:25" (abbreviation with period)
 */
export function buildBookRegex(book: BookDefinition): RegExp {
  const namePatterns = buildBookNamePatterns(book);
  const namesGroup = `(?:${namePatterns.join("|")})`;

  // Pattern breakdown:
  // - Book name (canonical, abbreviation, or variant)
  // - Optional period (for abbreviations like "Gen.")
  // - Whitespace
  // - Chapter number (1-3 digits)
  // - Optional verse: colon + verse number
  // - Optional verse range: hyphen + end verse
  const pattern = String.raw`\b${namesGroup}\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?\b`;

  return new RegExp(pattern, "gi");
}

/**
 * Normalize a scripture reference to canonical format.
 * Examples:
 * - "Gen 1:25" → "Genesis 1:25"
 * - "Song of Songs 1:1" → "Song of Solomon 1:1"
 * - "1st Samuel 3" → "1 Samuel 3"
 */
export function normalizeReference(
  book: BookDefinition,
  chapter: string,
  verse?: string,
  endVerse?: string,
): string {
  let reference = `${book.canonical} ${chapter}`;

  if (verse !== undefined) {
    reference += `:${verse}`;

    if (endVerse !== undefined) {
      reference += `-${endVerse}`;
    }
  }

  return reference;
}

/**
 * Find all speaker label regions to exclude from matching.
 * Pattern: [HH:MM:SS.mmm] Speaker Name:
 */
export function findSpeakerLabelRanges(
  transcript: string,
): Array<{ start: number; end: number }> {
  const speakerLabelRanges: Array<{ start: number; end: number }> = [];
  const speakerLabelPattern = /\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+([^:]+):/g;

  let speakerMatch;
  while ((speakerMatch = speakerLabelPattern.exec(transcript)) !== null) {
    const fullMatch = speakerMatch[0];
    const speakerName = speakerMatch[1];
    if (!speakerName) continue;

    const speakerNameStart =
      speakerMatch.index + fullMatch.indexOf(speakerName);
    const speakerNameEnd = speakerNameStart + speakerName.length;
    speakerLabelRanges.push({ start: speakerNameStart, end: speakerNameEnd });
  }

  return speakerLabelRanges;
}

/**
 * Check if a range overlaps with any already-matched range.
 */
export function isOverlapping(
  start: number,
  end: number,
  matchedRanges: Array<{ start: number; end: number }>,
): boolean {
  return matchedRanges.some(
    range => !(end <= range.start || start >= range.end),
  );
}

/**
 * Check if a range falls within a speaker label.
 */
export function isInSpeakerLabel(
  start: number,
  end: number,
  speakerLabelRanges: Array<{ start: number; end: number }>,
): boolean {
  return speakerLabelRanges.some(
    range => start >= range.start && end <= range.end,
  );
}

/**
 * Resolve overlapping matches by keeping the longest match at each position.
 * When two matches overlap, keep the one with more characters.
 */
export function resolveOverlaps(matches: MatchInfo[]): MatchInfo[] {
  if (matches.length === 0) return [];

  // Sort by start position, then by length (longest first)
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start); // Longer match first
  });

  const resolved: MatchInfo[] = [];
  let lastEnd = -1;

  for (const match of sorted) {
    // If this match starts before the last match ended, check if it's longer
    if (match.start < lastEnd) {
      // This overlaps with the previous match
      // We already added the longer one (sorted by length), so skip
      continue;
    }

    resolved.push(match);
    lastEnd = match.end;
  }

  return resolved;
}
