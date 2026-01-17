import type { BookDefinition } from "./scripture-books.js";
import { scriptureBooks } from "./scripture-books.js";

/**
 * Get a book by its canonical name (case-insensitive).
 *
 * @param name - Canonical book name (e.g., "Genesis", "1 Samuel")
 * @returns Book definition if found, undefined otherwise
 */
export function getBookByCanonical(name: string): BookDefinition | undefined {
  const lowerName = name.toLowerCase();
  return scriptureBooks.find(
    book => book.canonical.toLowerCase() === lowerName,
  );
}
