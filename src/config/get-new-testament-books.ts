import type { BookDefinition } from "./scripture-books.js";
import { scriptureBooks } from "./scripture-books.js";

/**
 * Get all New Testament books.
 * Returns books in their defined order.
 */
export function getNewTestamentBooks(): BookDefinition[] {
  return scriptureBooks.filter(book => book.testament === "new");
}
