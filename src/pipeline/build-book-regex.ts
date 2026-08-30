import type { BookDefinition } from "../config/scripture-books.js";
import { buildBookNamePatterns } from "./build-book-name-patterns.js";
import { bareNumberWordPattern } from "./number-words.js";

/**
 * Build regex pattern for detecting scripture references to a specific book.
 * Matches patterns like:
 * - "Genesis 1" (chapter only)
 * - "Genesis 1:25" (chapter:verse)
 * - "Genesis 1:1-10" (verse range)
 * - "Gen 1:25" (abbreviation)
 * - "Gen. 1:25" (abbreviation with period)
 * - "Acts chapter 7" (spoken chapter form)
 * - "Acts chapter 7 verse 43" (spoken chapter + verse)
 * - "Acts chapter 7, verses 42-43" (spoken chapter + verse range)
 * - "Genesis six" (spelled-out chapter number)
 * - "2 Maccabees, chapter six" (comma + spelled-out chapter number)
 */
export function buildBookRegex(book: BookDefinition): RegExp {
  const namePatterns = buildBookNamePatterns(book);
  const namesGroup = `(?:${namePatterns.join("|")})`;
  const chapterWord = String.raw`(?:,?\s+chapter)?`;
  // "one" only counts as a chapter number right after the word "chapter" —
  // bare it collides with ordinary English ("the Mark one", "Psalms one
  // after the other"). Other spelled-out numbers are safe standalone.
  const number = String.raw`(?:\d{1,3}|${bareNumberWordPattern}|(?<=chapter\s+)one)`;
  const verseSeparator = String.raw`(?::|,?\s+verses?\s+)`;
  const rangeSeparator = String.raw`(?:\s*-\s*|\s+(?:to|through)\s+)`;
  const pattern = String.raw`\b${namesGroup}${chapterWord}\s+(${number})(?:${verseSeparator}(${number})(?:${rangeSeparator}(${number}))?)?\b`;
  return new RegExp(pattern, "gi");
}

export function buildBookWholeRegex(book: BookDefinition): RegExp {
  const namePatterns = buildBookNamePatterns(book).map(
    pattern => `(?:${pattern})`,
  );
  const prefixedNamePatterns = namePatterns.map(
    pattern =>
      String.raw`(?:[Tt]he\s+)?(?:[Bb]ook|[Gg]ospel)\s+of\s+${pattern}`,
  );
  const standalonePatterns = namePatterns.filter(pattern => /\s/.test(pattern));
  const allPatterns = [...prefixedNamePatterns, ...standalonePatterns];
  const pattern = String.raw`\b(?:${allPatterns.join("|")})\b(?!\s+\d)`;
  return new RegExp(pattern, "gi");
}
