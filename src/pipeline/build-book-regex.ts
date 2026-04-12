import type { BookDefinition } from "../config/scripture-books.js";
import { buildBookNamePatterns } from "./build-book-name-patterns.js";

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
  const pattern = String.raw`\b${namesGroup}\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?\b`;
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
  const pattern = String.raw`\b(?:${prefixedNamePatterns.join("|")})\b(?!\s+\d)`;
  return new RegExp(pattern, "gi");
}
