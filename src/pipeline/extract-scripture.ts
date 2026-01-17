/**
 * Scripture reference extraction from podcast transcripts.
 * Detects Bible references and normalizes them to canonical format.
 */

import type { BookDefinition } from "../config/scripture-books.js";
import { scriptureBooks } from "../config/scripture-books.js";
import type { EpisodeContext } from "./verify-tag-matches.js";
import { verifyScriptureMatches } from "./verify-scripture-matches.js";

/**
 * Scripture reference for an episode.
 */
export interface EpisodeScripture {
  /** Canonical book name (e.g., "Genesis", "1 Samuel") */
  book: string;
  /** Unique normalized references found in episode */
  references: string[];
  /** Total mention count across all references */
  mentions: number;
}

interface MatchInfo {
  book: BookDefinition;
  reference: string;
  start: number;
  end: number;
  rawText: string;
}

/**
 * Escape special regex characters in a string.
 */
function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Build all possible name patterns for a book (canonical, abbreviations, variants).
 * Handles numbered books specially (e.g., "1 Samuel", "1st Samuel", "I Samuel").
 */
function buildBookNamePatterns(book: BookDefinition): string[] {
  // Start with canonical name
  const patterns: string[] = [escapeRegex(book.canonical)];

  // Add abbreviations (with optional period)
  for (const abbreviation of book.abbreviations) {
    // Match with or without trailing period: "Gen" or "Gen."
    patterns.push(`${escapeRegex(abbreviation)}${String.raw`\.?`}`);
  }

  // Add variants
  for (const variant of book.variants) {
    patterns.push(escapeRegex(variant));
  }

  return patterns;
}

/**
 * Build regex pattern for detecting scripture references to a specific book.
 * Matches patterns like:
 * - "Genesis 1" (chapter only)
 * - "Genesis 1:25" (chapter:verse)
 * - "Genesis 1:1-10" (verse range)
 * - "Gen 1:25" (abbreviation)
 * - "Gen. 1:25" (abbreviation with period)
 */
function buildBookRegex(book: BookDefinition): RegExp {
  const namePatterns = buildBookNamePatterns(book);
  const namesGroup = `(?:${namePatterns.join("|")})`;

  // Pattern breakdown:
  // - Book name (canonical, abbreviation, or variant)
  // - Optional period (for abbreviations like "Gen.")
  // - Whitespace
  // - Chapter number (1-3 digits)
  // - Optional verse: colon + verse number
  // - Optional verse range: hyphen + end verse
  const pattern = String.raw`\b${namesGroup}\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?\b`;

  return new RegExp(pattern, "gi");
}

/**
 * Normalize a scripture reference to canonical format.
 * Examples:
 * - "Gen 1:25" → "Genesis 1:25"
 * - "Song of Songs 1:1" → "Song of Solomon 1:1"
 * - "1st Samuel 3" → "1 Samuel 3"
 */
function normalizeReference(
  book: BookDefinition,
  chapter: string,
  verse?: string,
  endVerse?: string,
): string {
  let reference = `${book.canonical} ${chapter}`;

  if (verse !== undefined) {
    reference += `:${verse}`;

    if (endVerse !== undefined) {
      reference += `-${endVerse}`;
    }
  }

  return reference;
}

/**
 * Find all speaker label regions to exclude from matching.
 * Pattern: [HH:MM:SS.mmm] Speaker Name:
 */
function findSpeakerLabelRanges(
  transcript: string,
): Array<{ start: number; end: number }> {
  const speakerLabelRanges: Array<{ start: number; end: number }> = [];
  const speakerLabelPattern = /\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+([^:]+):/g;

  let speakerMatch;
  while ((speakerMatch = speakerLabelPattern.exec(transcript)) !== null) {
    const fullMatch = speakerMatch[0];
    const speakerName = speakerMatch[1];
    if (!speakerName) continue;

    const speakerNameStart =
      speakerMatch.index + fullMatch.indexOf(speakerName);
    const speakerNameEnd = speakerNameStart + speakerName.length;
    speakerLabelRanges.push({ start: speakerNameStart, end: speakerNameEnd });
  }

  return speakerLabelRanges;
}

/**
 * Check if a range overlaps with any already-matched range.
 */
function isOverlapping(
  start: number,
  end: number,
  matchedRanges: Array<{ start: number; end: number }>,
): boolean {
  return matchedRanges.some(
    range => !(end <= range.start || start >= range.end),
  );
}

/**
 * Check if a range falls within a speaker label.
 */
function isInSpeakerLabel(
  start: number,
  end: number,
  speakerLabelRanges: Array<{ start: number; end: number }>,
): boolean {
  return speakerLabelRanges.some(
    range => start >= range.start && end <= range.end,
  );
}

/**
 * Resolve overlapping matches by keeping the longest match at each position.
 * When two matches overlap, keep the one with more characters.
 */
function resolveOverlaps(matches: MatchInfo[]): MatchInfo[] {
  if (matches.length === 0) return [];

  // Sort by start position, then by length (longest first)
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return (b.end - b.start) - (a.end - a.start); // Longer match first
  });

  const resolved: MatchInfo[] = [];
  let lastEnd = -1;

  for (const match of sorted) {
    // If this match starts before the last match ended, check if it's longer
    if (match.start < lastEnd) {
      // This overlaps with the previous match
      // We already added the longer one (sorted by length), so skip
      continue;
    }

    resolved.push(match);
    lastEnd = match.end;
  }

  return resolved;
}

/**
 * Extract scripture references from a transcript.
 *
 * @param transcript - The transcript text to analyze
 * @param options - Optional configuration
 * @param options.enableLlmVerification - If true, use LLM to verify ambiguous books
 * @param options.episodeContext - Optional episode information for logging
 * @returns Array of scripture references by book with mention counts
 */
export async function extractScripture(
  transcript: string,
  options: {
    enableLlmVerification?: boolean;
    episodeContext?: EpisodeContext;
  } = {},
): Promise<EpisodeScripture[]> {
  const { enableLlmVerification = false, episodeContext } = options;

  // Find speaker label regions to exclude
  const speakerLabelRanges = findSpeakerLabelRanges(transcript);

  // Collect ALL matches from ALL books first
  const allMatches: MatchInfo[] = [];

  // Process each book and collect all potential matches
  for (const book of scriptureBooks) {
    const regex = buildBookRegex(book);
    let match;

    while ((match = regex.exec(transcript)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      // Skip if in speaker label
      if (isInSpeakerLabel(start, end, speakerLabelRanges)) {
        continue;
      }

      // Extract chapter and verse info
      const chapter = match[1];
      const verse = match[2];
      const endVerse = match[3];

      if (!chapter) continue;

      const reference = normalizeReference(book, chapter, verse, endVerse);

      allMatches.push({
        book,
        reference,
        start,
        end,
        rawText: match[0],
      });
    }
  }

  // Resolve overlapping matches (keep longest match at each position)
  const resolvedMatches = resolveOverlaps(allMatches);

  // Track matches by book
  const bookMatches = new Map<string, MatchInfo[]>();

  // Track matches needing LLM verification
  const matchesNeedingVerification = new Map<string, MatchInfo[]>();

  // Categorize resolved matches
  for (const matchInfo of resolvedMatches) {
    const needsVerification =
      enableLlmVerification &&
      "llmVerify" in matchInfo.book &&
      matchInfo.book.llmVerify;

    if (needsVerification) {
      if (!matchesNeedingVerification.has(matchInfo.book.canonical)) {
        matchesNeedingVerification.set(matchInfo.book.canonical, []);
      }
      matchesNeedingVerification.get(matchInfo.book.canonical)!.push(matchInfo);
    } else {
      if (!bookMatches.has(matchInfo.book.canonical)) {
        bookMatches.set(matchInfo.book.canonical, []);
      }
      bookMatches.get(matchInfo.book.canonical)!.push(matchInfo);
    }
  }

  // Verify matches for books that need LLM verification
  if (enableLlmVerification && matchesNeedingVerification.size > 0) {
    console.log(
      `  Scripture LLM verification needed for ${matchesNeedingVerification.size} book(s)`,
    );

    for (const [canonical, matches] of matchesNeedingVerification) {
      const book = scriptureBooks.find(b => b.canonical === canonical);
      if (!book || !("llmVerify" in book) || !book.llmVerify) {
        continue;
      }

      console.log(
        `    Verifying ${matches.length} matches for "${canonical}"...`,
      );

      const verifiedIndices = await verifyScriptureMatches(
        transcript,
        matches.map(m => ({ start: m.start, end: m.end, text: m.rawText })),
        book,
        episodeContext,
      );

      // Add only verified matches
      if (verifiedIndices.length > 0) {
        const verifiedMatches = verifiedIndices
          .map(index => matches[index])
          .filter((m): m is MatchInfo => m !== undefined);

        if (!bookMatches.has(canonical)) {
          bookMatches.set(canonical, []);
        }
        bookMatches.get(canonical)!.push(...verifiedMatches);
      }

      console.log(`    ✓ ${verifiedIndices.length}/${matches.length} verified`);
    }
  }

  // Convert to EpisodeScripture array
  const results: EpisodeScripture[] = [];

  for (const [canonical, matches] of bookMatches) {
    // Get unique references
    const uniqueReferences = [...new Set(matches.map(m => m.reference))].sort(
      (a, b) => {
        // Sort by chapter then verse
        const parseReference = (
          reference: string,
        ): { chapter: number; verse: number } => {
          const parts = reference.split(" ").slice(1).join(" "); // Remove book name
          const [chapterPart] = parts.split(":");
          const chapter = Number.parseInt(chapterPart ?? "0", 10);
          const versePart = parts.includes(":") ? parts.split(":")[1] : "0";
          const verse = Number.parseInt(
            (versePart ?? "0").split("-")[0] ?? "0",
            10,
          );
          return { chapter, verse };
        };

        const referenceA = parseReference(a);
        const referenceB = parseReference(b);

        if (referenceA.chapter !== referenceB.chapter) {
          return referenceA.chapter - referenceB.chapter;
        }
        return referenceA.verse - referenceB.verse;
      },
    );

    results.push({
      book: canonical,
      references: uniqueReferences,
      mentions: matches.length,
    });
  }

  // Sort by mention count (descending)
  results.sort((a, b) => b.mentions - a.mentions);

  return results;
}

/**
 * Extract scripture references for a single book only.
 * Useful for targeted extraction when adding a new book.
 */
export async function extractSingleBookScripture(
  transcript: string,
  bookName: string,
  options: {
    enableLlmVerification?: boolean;
    episodeContext?: EpisodeContext;
  } = {},
): Promise<EpisodeScripture | undefined> {
  const book = scriptureBooks.find(
    b =>
      b.canonical.toLowerCase() === bookName.toLowerCase() ||
      b.abbreviations.some(
        a => a.toLowerCase() === bookName.toLowerCase(),
      ) ||
      b.variants.some(v => v.toLowerCase() === bookName.toLowerCase()),
  );

  if (!book) {
    return undefined;
  }

  const { enableLlmVerification = false, episodeContext } = options;

  // Find speaker label regions to exclude
  const speakerLabelRanges = findSpeakerLabelRanges(transcript);

  // Track matched positions
  const matchedRanges: Array<{ start: number; end: number }> = [];
  const matches: MatchInfo[] = [];

  const regex = buildBookRegex(book);
  let match;

  while ((match = regex.exec(transcript)) !== null) {
    const start = match.index;
    const end = start + match[0].length;

    // Skip if overlaps with already-matched region
    if (isOverlapping(start, end, matchedRanges)) {
      continue;
    }

    // Skip if in speaker label
    if (isInSpeakerLabel(start, end, speakerLabelRanges)) {
      continue;
    }

    // Extract chapter and verse info
    const chapter = match[1];
    const verse = match[2];
    const endVerse = match[3];

    if (!chapter) continue;

    const reference = normalizeReference(book, chapter, verse, endVerse);

    matches.push({
      book,
      reference,
      start,
      end,
      rawText: match[0],
    });

    matchedRanges.push({ start, end });
  }

  if (matches.length === 0) {
    return undefined;
  }

  // Handle LLM verification if needed
  let verifiedMatches = matches;
  const needsVerification =
    enableLlmVerification && "llmVerify" in book && book.llmVerify;

  if (needsVerification) {
    const verifiedIndices = await verifyScriptureMatches(
      transcript,
      matches.map(m => ({ start: m.start, end: m.end, text: m.rawText })),
      book,
      episodeContext,
    );

    verifiedMatches = verifiedIndices
      .map(index => matches[index])
      .filter((m): m is MatchInfo => m !== undefined);

    if (verifiedMatches.length === 0) {
      return undefined;
    }
  }

  // Get unique references
  const uniqueReferences = [
    ...new Set(verifiedMatches.map(m => m.reference)),
  ].sort();

  return {
    book: book.canonical,
    references: uniqueReferences,
    mentions: verifiedMatches.length,
  };
}
