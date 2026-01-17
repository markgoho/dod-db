/**
 * Find all scripture references in text.
 */

import { scriptureBooks } from "../config/scripture-books.js";
import { buildBookRegex } from "../pipeline/build-book-regex.js";
import { normalizeReference } from "../pipeline/normalize-reference.js";
import { resolveOverlaps } from "../pipeline/resolve-overlaps.js";
import type { ScriptureMatch } from "./wrap-scripture-references.js";

/**
 * Check if the first character of the matched text is uppercase.
 * This helps filter out false positives like "is" matching Isaiah.
 */
function startsWithUppercase(text: string): boolean {
  const firstChar = text[0];
  return firstChar !== undefined && firstChar === firstChar.toUpperCase();
}

/**
 * Find all scripture references in the given text.
 * Returns matches with their positions for downstream processing.
 */
export function findScriptureMatches(text: string): ScriptureMatch[] {
  const allMatches: ScriptureMatch[] = [];

  for (const book of scriptureBooks) {
    const regex = buildBookRegex(book);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (!startsWithUppercase(match[0])) {
        continue;
      }

      const chapter = match[1];
      const verse = match[2];
      const endVerse = match[3];

      if (!chapter) continue;

      const normalizedReference = normalizeReference(
        book,
        chapter,
        verse,
        endVerse,
      );

      allMatches.push({
        start,
        end,
        originalText: match[0],
        normalizedReference,
        book: book.canonical,
      });
    }
  }

  return resolveOverlaps(allMatches);
}
