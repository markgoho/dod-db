/**
 * Find all scripture references in text.
 */

import { scriptureBooks } from "../config/scripture-books.js";
import {
  buildBookRegex,
  buildBookWholeRegex,
} from "../pipeline/build-book-regex.js";
import { normalizeReference } from "../pipeline/normalize-reference.js";
import { resolveOverlaps } from "../pipeline/resolve-overlaps.js";
import type { ScriptureMatch } from "./wrap-scripture-references.js";

const LEADING_BOOK_PHRASE = /^(?:the\s+)?(?:book|gospel)\s+of\s+/i;

function firstAlphabeticCharacter(text: string): string | undefined {
  return [...text].find(character => /[A-Za-z]/.test(character));
}

/**
 * Check if the first alphabetic character of the matched text is uppercase.
 * This helps filter out false positives like "is" matching Isaiah.
 */
function startsWithUppercase(text: string): boolean {
  // Skip an ordinal prefix ("1st", "2nd") so its suffix isn't read as the
  // book name's first letter.
  const firstChar = firstAlphabeticCharacter(
    text.replace(/^\d+(?:st|nd|rd|th)\s+/i, ""),
  );
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
      // "Gospel of John, chapter 19": link "John, chapter 19" and leave the
      // "Gospel of" wording as spoken, since the link displays "John 19".
      const prefix = LEADING_BOOK_PHRASE.exec(match[0])?.[0] ?? "";
      const start = match.index + prefix.length;
      const end = match.index + match[0].length;
      const matchedText = match[0].slice(prefix.length);

      if (!startsWithUppercase(matchedText)) {
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
        originalText: matchedText,
        normalizedReference,
        book: book.canonical,
      });
    }

    const wholeBookRegex = buildBookWholeRegex(book);
    let wholeBookMatch;

    while ((wholeBookMatch = wholeBookRegex.exec(text)) !== null) {
      const start = wholeBookMatch.index;
      const end = start + wholeBookMatch[0].length;

      allMatches.push({
        start,
        end,
        originalText: wholeBookMatch[0],
        normalizedReference: normalizeReference(book),
        book: book.canonical,
      });
    }
  }

  return resolveOverlaps(allMatches);
}
