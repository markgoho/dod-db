import type { BookDefinition } from "../config/scripture-books.js";
import { escapeRegex } from "./escape-regex.js";

/**
 * Build all possible name patterns for a book (canonical, abbreviations, variants).
 * Handles numbered books specially (e.g., "1 Samuel", "1st Samuel", "I Samuel").
 */
export function buildBookNamePatterns(book: BookDefinition): string[] {
  const patterns: string[] = [escapeRegex(book.canonical)];

  for (const abbreviation of book.abbreviations) {
    patterns.push(`${escapeRegex(abbreviation)}${String.raw`\.?`}`);
  }

  for (const variant of book.variants) {
    patterns.push(escapeRegex(variant));
  }

  return patterns;
}
