/**
 * Find all scripture references in text.
 */

import type { BookDefinition } from "../config/scripture-books.js";
import { scriptureBooks } from "../config/scripture-books.js";
import type { ScriptureMatch } from "./wrap-scripture-references.js";

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Build all possible name patterns for a book (canonical, abbreviations, variants).
 * Handles numbered books specially (e.g., "1 Samuel", "1st Samuel", "I Samuel").
 */
function buildBookNamePatterns(book: BookDefinition): string[] {
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
function buildBookRegex(book: BookDefinition): RegExp {
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
 * - "Gen 1:25" -> "Genesis 1:25"
 * - "Song of Songs 1:1" -> "Song of Solomon 1:1"
 * - "1st Samuel 3" -> "1 Samuel 3"
 */
function normalizeReference(
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
 * Resolve overlapping matches by keeping the longest match at each position.
 * When two matches overlap, keep the one with more characters.
 */
function resolveOverlaps(matches: ScriptureMatch[]): ScriptureMatch[] {
  if (matches.length === 0) return [];

  // Sort by length descending (longest matches first)
  const sortedByLength = [...matches].sort((a, b) => {
    return b.end - b.start - (a.end - a.start);
  });

  const selected: ScriptureMatch[] = [];

  for (const match of sortedByLength) {
    // Check if this match overlaps with any already selected match
    const overlapsWithSelected = selected.some(
      s => !(match.end <= s.start || match.start >= s.end),
    );

    if (!overlapsWithSelected) {
      selected.push(match);
    }
  }

  // Sort by start position for correct ordering
  return selected.sort((a, b) => a.start - b.start);
}

/**
 * Check if the first character of the matched text is uppercase.
 * This helps filter out false positives like "is" matching Isaiah.
 */
function startsWithUppercase(text: string): boolean {
  const firstChar = text[0];
  return firstChar !== undefined && firstChar === firstChar.toUpperCase();
}

/**
 * Find all scripture references in the given text.
 * Returns matches with their positions for downstream processing.
 */
export function findScriptureMatches(text: string): ScriptureMatch[] {
  const allMatches: ScriptureMatch[] = [];

  // Process each book and collect all potential matches
  for (const book of scriptureBooks) {
    const regex = buildBookRegex(book);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Skip matches that start with lowercase (avoids "is 1" matching Isaiah)
      // Book names and abbreviations should be capitalized
      if (!startsWithUppercase(match[0])) {
        continue;
      }

      // Extract chapter and verse info
      const chapter = match[1];
      const verse = match[2];
      const endVerse = match[3];

      if (!chapter) continue;

      const normalizedReference = normalizeReference(
        book,
        chapter,
        verse,
        endVerse,
      );

      allMatches.push({
        start,
        end,
        originalText: match[0],
        normalizedReference,
        book: book.canonical,
      });
    }
  }

  // Resolve overlapping matches (keep longest match at each position)
  return resolveOverlaps(allMatches);
}
