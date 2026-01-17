import type { BookDefinition } from "../config/scripture-books.js";

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
