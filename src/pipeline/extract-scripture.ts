/**
 * Scripture reference extraction from podcast transcripts.
 * Detects Bible references and normalizes them to canonical format.
 */

import { scriptureBooks } from "../config/scripture-books.js";
import {
  buildBookRegex,
  findSpeakerLabelRanges,
  isInSpeakerLabel,
  type MatchInfo,
  normalizeReference,
  resolveOverlaps,
} from "./extract-scripture-helpers.js";
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
