import type { BookDefinition } from "./scripture-books.js";
import { scriptureBooks } from "./scripture-books.js";

/**
 * Get a book by canonical name, abbreviation, or variant (case-insensitive).
 *
 * @param name - Any valid name for the book (e.g., "Gen", "Genesis", "Song of Songs")
 * @returns Book definition if found, undefined otherwise
 *
 * @example
 * getBookByAnyName("Gen") // → Genesis book definition
 * getBookByAnyName("Song of Songs") // → Song of Solomon definition
 * getBookByAnyName("1Sam") // → 1 Samuel definition
 */
export function getBookByAnyName(name: string): BookDefinition | undefined {
  const lowerName = name.toLowerCase();

  return scriptureBooks.find(
    book =>
      book.canonical.toLowerCase() === lowerName ||
      book.abbreviations.some(abbr => abbr.toLowerCase() === lowerName) ||
      book.variants.some(variant => variant.toLowerCase() === lowerName),
  );
}
