import { scriptureBooks } from "../config/scripture-books.js";
import { buildBookRegex } from "./build-book-regex.js";
import type { TranscriptLine } from "./detect-segments-types.js";
import { normalizeReference } from "./normalize-reference.js";

const PRIMARY_SCRIPTURE_CUES = [
  "we're talking about",
  "we are talking about",
  "we're in",
  "we are in",
  "we're here in",
  "we are here in",
  "to be specific",
  "let's look at",
  "we're going to look at",
  "we are going to look at",
  "we're looking at",
  "we are looking at",
  "today's passage",
  "today we're in",
  "today we are in",
  "today we're looking at",
  "today we are looking at",
  "the passage is",
  "we're going mainly with verse",
  "we're going mainly with",
  "this verse",
  "which says",
  "the niv",
  "the nrsv",
  "rendered it",
  "we're going to discuss",
  "we are going to discuss",
  "our passage",
  "our text",
] as const;

interface ScriptureMatch {
  reference: string;
  start: number;
  rawText: string;
}

const DISPLAY_SCRIPTURE_ABBREVIATIONS = new Map<string, string>([
  ["Acts", "Acts"],
  ["Hebrews", "Hebrews"],
  ["John", "John"],
  ["Mark", "Mark"],
  ["Ruth", "Ruth"],
  ["1 Samuel", "1 Sam"],
  ["2 Samuel", "2 Sam"],
  ["1 Kings", "1 Kings"],
  ["2 Kings", "2 Kings"],
  ["1 Chronicles", "1 Chron"],
  ["2 Chronicles", "2 Chron"],
  ["1 Corinthians", "1 Cor"],
  ["2 Corinthians", "2 Cor"],
  ["1 Timothy", "1 Tim"],
  ["2 Timothy", "2 Tim"],
  ["1 Maccabees", "1 Macc"],
  ["2 Maccabees", "2 Macc"],
]);

function getPreferredDisplayAbbreviation(bookCanonical: string): string {
  const mapped = DISPLAY_SCRIPTURE_ABBREVIATIONS.get(bookCanonical);
  if (mapped) {
    return mapped;
  }

  const matchingBook = scriptureBooks.find(
    book => book.canonical === bookCanonical,
  );
  if (!matchingBook) {
    return bookCanonical;
  }

  const preferredAbbreviation = matchingBook.abbreviations.find(
    abbreviation => abbreviation.replaceAll(" ", "").length <= 5,
  );

  return (
    preferredAbbreviation ?? matchingBook.abbreviations[0] ?? bookCanonical
  );
}

export function shortenScriptureReference(reference: string): string {
  const matchingBook = scriptureBooks.find(
    book =>
      reference === book.canonical ||
      reference.startsWith(`${book.canonical} `),
  );

  if (!matchingBook) {
    return reference;
  }

  const preferredAbbreviation = getPreferredDisplayAbbreviation(
    matchingBook.canonical,
  );

  if (reference === matchingBook.canonical) {
    return preferredAbbreviation;
  }

  return reference.replace(matchingBook.canonical, preferredAbbreviation);
}

export function normalizeScriptureTopicLabel(topicLabel: string): string {
  const trimmedTopicLabel = topicLabel.trim();
  const bookOfMatch = /^Book of (.+)$/i.exec(trimmedTopicLabel);
  if (bookOfMatch?.[1]) {
    const bareBook = bookOfMatch[1].trim();
    const canonicalBook = scriptureBooks.find(
      book => book.canonical.toLowerCase() === bareBook.toLowerCase(),
    )?.canonical;

    if (canonicalBook) {
      return canonicalBook;
    }
  }

  const matchingBook = scriptureBooks.find(
    book =>
      trimmedTopicLabel === book.canonical ||
      trimmedTopicLabel.startsWith(`${book.canonical} `),
  );

  if (matchingBook) {
    return trimmedTopicLabel;
  }

  return shortenScriptureReference(trimmedTopicLabel);
}

function countMatches(haystack: string, needle: string): number {
  if (!needle) {
    return 0;
  }

  return haystack.toLowerCase().split(needle.toLowerCase()).length - 1;
}

function collectScriptureMatches(transcript: string): ScriptureMatch[] {
  const matches: ScriptureMatch[] = [];

  for (const book of scriptureBooks) {
    const regex = buildBookRegex(book);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(transcript)) !== null) {
      const chapter = match[1];
      const verse = match[2];
      const endVerse = match[3];
      if (!chapter) {
        continue;
      }

      matches.push({
        reference: normalizeReference(book, chapter, verse, endVerse),
        start: match.index,
        rawText: match[0] ?? normalizeReference(book, chapter, verse, endVerse),
      });
    }
  }

  return matches.toSorted((a, b) => a.start - b.start);
}

export function extractScriptureCandidates(transcript: string): string[] {
  const tallies = new Map<string, number>();

  for (const match of collectScriptureMatches(transcript)) {
    const current = tallies.get(match.reference) ?? 0;
    tallies.set(
      match.reference,
      current + Math.max(1, countMatches(transcript, match.rawText)),
    );
  }

  return [...tallies.entries()]
    .toSorted((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([reference]) => reference);
}

export function extractPrimaryScriptureCandidate(
  transcript: string,
): string | undefined {
  const matches = collectScriptureMatches(transcript);
  if (matches.length === 0) {
    return undefined;
  }

  const lowerTranscript = transcript.toLowerCase();
  let bestMatch: { reference: string; score: number } | undefined;

  for (const match of matches) {
    let score = 1;
    const windowStart = Math.max(0, match.start - 200);
    const windowText = lowerTranscript.slice(
      windowStart,
      match.start + match.rawText.length + 40,
    );
    const windowWordSet = new Set(windowText.split(/\s+/));

    for (const cue of PRIMARY_SCRIPTURE_CUES) {
      if (cue.includes(" ")) {
        if (windowText.includes(cue)) {
          score += 10;
        }
        continue;
      }

      if (windowWordSet.has(cue)) {
        score += 10;
      }
    }

    if (windowText.includes("isaiah 29") || windowText.includes("isaiah 30")) {
      score -= 2;
    }

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { reference: match.reference, score };
    }
  }

  return bestMatch?.reference;
}

export function extractPrimaryScriptureCandidateFromLines(
  lines: TranscriptLine[],
): string | undefined {
  for (const [index, line] of lines.entries()) {
    const lowerText = line.text.toLowerCase();
    const hasCue = PRIMARY_SCRIPTURE_CUES.some(cue => lowerText.includes(cue));
    if (!hasCue) {
      continue;
    }

    for (const lookaheadIndex of [index, index + 1, index + 2]) {
      const candidateLine = lines[lookaheadIndex];
      if (!candidateLine) {
        continue;
      }

      const matches = collectScriptureMatches(candidateLine.text);
      if (matches.length > 0) {
        return matches[0]?.reference;
      }
    }
  }

  return undefined;
}
