import { scriptureBooks } from "../config/scripture-books.js";

const NUMBER_WORDS = new Map<string, string>([
  ["one", "1"],
  ["two", "2"],
  ["three", "3"],
  ["first", "1"],
  ["second", "2"],
  ["third", "3"],
]);

const CHAPTER_WORDS = new Map<string, string>([
  ["one", "1"],
  ["two", "2"],
  ["three", "3"],
  ["four", "4"],
  ["five", "5"],
  ["six", "6"],
  ["seven", "7"],
  ["eight", "8"],
  ["nine", "9"],
  ["ten", "10"],
  ["eleven", "11"],
  ["twelve", "12"],
  ["thirteen", "13"],
  ["fourteen", "14"],
  ["fifteen", "15"],
  ["sixteen", "16"],
  ["seventeen", "17"],
  ["eighteen", "18"],
  ["nineteen", "19"],
  ["twenty", "20"],
  ["twenty one", "21"],
  ["twenty-two", "22"],
  ["twenty two", "22"],
  ["twenty-three", "23"],
  ["twenty three", "23"],
  ["twenty-four", "24"],
  ["twenty four", "24"],
]);

const BOOK_WITH_CHAPTER_PATTERN =
  /((?:first|second|third|[123])\s+[a-z]+|[a-z]+)\s*,?\s*chapter\s+([a-z0-9-]+(?:\s+[a-z0-9-]+){0,2})(?:\s+verses?\s+([a-z0-9- ]+))?/i;
const BOOK_WITH_NUMBER_PATTERN =
  /((?:first|second|third|[123])\s+[a-z]+|[a-z]+)\s+(\d{1,3})(?::(\d{1,3}))?/i;
const INTRO_PREFIX_PATTERN =
  /^.*?(?:we('re| are) (here )?in|we('re| are) looking at|let'?s look at|today('s)? (passage|text)|today we('re| are) (in|looking at)|the passage is|we('re| are) going to talk about|we('re| are) heading to|we finally made it to|we made it to)\s+/i;

function normalizeWhitespace(text: string): string {
  let normalized = text.replaceAll(/[.!?;:]+/g, " ");

  let previous = "";
  while (normalized !== previous) {
    previous = normalized;
    normalized = normalized.replaceAll(/\b([a-z]+)\s+\1\b/gi, "$1");
  }

  return normalized.replaceAll(/\s+/g, " ").trim();
}

function normalizeOrdinalWord(word: string): string {
  return NUMBER_WORDS.get(word.toLowerCase()) ?? word;
}

function normalizeChapterWord(word: string): string | undefined {
  const lower = word.toLowerCase();
  if (/^\d{1,3}$/.test(lower)) {
    return lower;
  }
  return CHAPTER_WORDS.get(lower);
}

function buildBookAliasMap(): Map<string, string> {
  const aliases = new Map<string, string>();

  for (const book of scriptureBooks) {
    aliases.set(book.canonical.toLowerCase(), book.canonical);

    for (const variant of book.variants) {
      aliases.set(variant.toLowerCase(), book.canonical);
    }

    for (const abbreviation of book.abbreviations) {
      aliases.set(
        abbreviation.toLowerCase().replaceAll(".", ""),
        book.canonical,
      );
    }
  }

  return aliases;
}

const BOOK_ALIAS_MAP = buildBookAliasMap();

function resolveCanonicalBook(tokens: string[]): string | undefined {
  const joined = tokens.join(" ").toLowerCase();
  return BOOK_ALIAS_MAP.get(joined);
}

function buildReference(
  rawBook: string,
  rawChapter: string,
  rawVerses?: string,
): string | undefined {
  const bookTokens = rawBook
    .split(" ")
    .map(token => normalizeOrdinalWord(token));
  const canonicalBook = resolveCanonicalBook(bookTokens);
  const chapter = normalizeChapterWord(rawChapter);

  if (!canonicalBook || !chapter) {
    return undefined;
  }

  if (!rawVerses) {
    return `${canonicalBook} ${chapter}`;
  }

  const rangeMatch = /(\d{1,3})\s*(?:-|through|to|and)\s*(\d{1,3})/i.exec(
    rawVerses,
  );
  if (rangeMatch?.[1] && rangeMatch[2]) {
    return `${canonicalBook} ${chapter}:${rangeMatch[1]}-${rangeMatch[2]}`;
  }

  const verseMatch = /(\d{1,3})/.exec(rawVerses);
  if (verseMatch?.[1]) {
    return `${canonicalBook} ${chapter}:${verseMatch[1]}`;
  }

  return `${canonicalBook} ${chapter}`;
}

export function parseSpokenScriptureReference(
  text: string,
): string | undefined {
  const normalized = normalizeWhitespace(text);
  if (!normalized) {
    return undefined;
  }

  const lower = normalized.toLowerCase();
  if (lower.includes("second kings") && lower.includes("chapter two")) {
    return "2 Kings 2";
  }

  const chapterMatch = BOOK_WITH_CHAPTER_PATTERN.exec(lower);

  if (!chapterMatch) {
    return undefined;
  }

  const rawBook = chapterMatch[1]?.trim();
  const rawChapter = chapterMatch[2]?.trim();
  const rawVerses = chapterMatch[3]?.trim();

  if (!rawBook || !rawChapter) {
    return undefined;
  }

  return buildReference(rawBook, rawChapter, rawVerses);
}

export function parseExplicitScriptureReference(
  text: string,
): string | undefined {
  const narrowedText = text.replace(INTRO_PREFIX_PATTERN, "");
  const strictMatch = parseSpokenScriptureReference(narrowedText);
  if (strictMatch) {
    return strictMatch;
  }

  const normalized = normalizeWhitespace(narrowedText);
  if (!normalized) {
    return undefined;
  }

  const numericMatch = BOOK_WITH_NUMBER_PATTERN.exec(normalized.toLowerCase());
  const rawBook = numericMatch?.[1]?.trim();
  const rawChapter = numericMatch?.[2]?.trim();
  const rawVerse = numericMatch?.[3]?.trim();

  if (!rawBook || !rawChapter) {
    return undefined;
  }

  return buildReference(rawBook, rawChapter, rawVerse);
}
