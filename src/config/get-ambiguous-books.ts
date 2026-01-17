import type { BookDefinition } from "./scripture-books.js";
import { scriptureBooks } from "./scripture-books.js";

/**
 * Get books that require LLM verification.
 * These are books with common names that might match unrelated words.
 */
export function getAmbiguousBooks(): BookDefinition[] {
  return scriptureBooks.filter(
    (book): book is BookDefinition & { llmVerify: true } =>
      "llmVerify" in book && book.llmVerify === true,
  );
}
