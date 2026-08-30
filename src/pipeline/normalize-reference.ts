import type { BookDefinition } from "../config/scripture-books.js";
import { numberWordToDigits } from "./number-words.js";

/**
 * Normalize a scripture reference to canonical format.
 * Examples:
 * - "Gen 1:25" → "Genesis 1:25"
 * - "Song of Songs 1:1" → "Song of Solomon 1:1"
 * - "1st Samuel 3" → "1 Samuel 3"
 * - "2 Maccabees chapter six" → "2 Maccabees 6"
 */
export function normalizeReference(
  book: BookDefinition,
  chapter?: string,
  verse?: string,
  endVerse?: string,
): string {
  if (chapter === undefined) {
    return book.canonical;
  }

  let reference = `${book.canonical} ${numberWordToDigits(chapter)}`;

  if (verse !== undefined) {
    reference += `:${numberWordToDigits(verse)}`;

    if (endVerse !== undefined) {
      reference += `-${numberWordToDigits(endVerse)}`;
    }
  }

  return reference;
}
