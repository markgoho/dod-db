/**
 * Scripture reference extraction from podcast transcripts.
 * Detects Bible references and normalizes them to canonical format.
 */

import type { BookDefinition } from "../config/scripture-books.js";
import { scriptureBooks } from "../config/scripture-books.js";
import { verifyScriptureMatches } from "./verify-scripture-matches.js";
import type { EpisodeContext } from "./verify-tag-matches.js";

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
 */
function buildBookNamePatterns(book: BookDefinition): string[] {
  const patterns: string[] = [escapeRegex(book.canonical)];

  for (const abbreviation of book.abbreviations) {
    patterns.push(`${escapeRegex(abbreviation)}${String.raw`\.?`}`);
  }

  for (const variant of book.variants) {
    patterns.push(escapeRegex(variant));
  }

  return patterns;
}

/**
 * Build regex pattern for detecting scripture references to a specific book.
 */
function buildBookRegex(book: BookDefinition): RegExp {
  const namePatterns = buildBookNamePatterns(book);
  const namesGroup = `(?:${namePatterns.join("|")})`;
  const pattern = String.raw`\b${namesGroup}\s+(\d{1,3})(?::(\d{1,3})(?:-(\d{1,3}))?)?\b`;
  return new RegExp(pattern, "gi");
}

/**
 * Normalize a scripture reference to canonical format.
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
 */
function resolveOverlaps(matches: MatchInfo[]): MatchInfo[] {
  if (matches.length === 0) return [];

  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - b.start - (a.end - a.start);
  });

  const resolved: MatchInfo[] = [];
  let lastEnd = -1;

  for (const match of sorted) {
    if (match.start < lastEnd) {
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

  const speakerLabelRanges = findSpeakerLabelRanges(transcript);
  const allMatches: MatchInfo[] = [];

  for (const book of scriptureBooks) {
    const regex = buildBookRegex(book);
    let match;

    while ((match = regex.exec(transcript)) !== null) {
      const start = match.index;
      const end = start + match[0].length;

      if (isInSpeakerLabel(start, end, speakerLabelRanges)) {
        continue;
      }

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

  const resolvedMatches = resolveOverlaps(allMatches);
  const bookMatches = new Map<string, MatchInfo[]>();
  const matchesNeedingVerification = new Map<string, MatchInfo[]>();

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

  const results: EpisodeScripture[] = [];

  for (const [canonical, matches] of bookMatches) {
    const uniqueReferences = [...new Set(matches.map(m => m.reference))].sort(
      (a, b) => {
        const parseReference = (
          reference: string,
        ): { chapter: number; verse: number } => {
          const parts = reference.split(" ").slice(1).join(" ");
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

  results.sort((a, b) => b.mentions - a.mentions);

  return results;
}
