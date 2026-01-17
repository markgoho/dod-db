import type { BookDefinition } from "./scripture-books.js";
import { scriptureBooks } from "./scripture-books.js";

/**
 * Get all Old Testament books.
 * Returns books in their defined order.
 */
export function getOldTestamentBooks(): BookDefinition[] {
  return scriptureBooks.filter(book => book.testament === "old");
}
