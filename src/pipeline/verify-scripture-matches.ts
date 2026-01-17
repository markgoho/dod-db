/**
 * LLM-based verification of scripture matches using context.
 * Used for ambiguous book names (Job, Mark, Acts, Ruth, James, Judges)
 * where the text might refer to a person's name or common word instead of a Bible book.
 */

import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";
import type { BookDefinition } from "../config/scripture-books.js";
import type { EpisodeContext } from "./verify-tag-matches.js";

interface MatchContext {
  index: number;
  matchedText: string;
  contextBefore: string;
  contextAfter: string;
}

const VerificationResultSchema = z.object({
  verifications: z.array(
    z.object({
      index: z.number(),
      isMatch: z.boolean(),
      reasoning: z.string(),
    }),
  ),
});

/**
 * Extract text content from a transcript line, removing timestamp and speaker label.
 */
function extractTextFromLine(line: string): string {
  const match = /^\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+[^:]+:\s*(.*)$/.exec(
    line,
  );
  return match?.[1] ?? line;
}

/**
 * Extract context around a match position using word-based window.
 */
function extractContext(
  transcript: string,
  start: number,
  end: number,
  contextWords = 30,
): { before: string; after: string } {
  const windowSize = 2000;
  const beforeChunk = transcript.slice(Math.max(0, start - windowSize), start);
  const afterChunk = transcript.slice(
    end,
    Math.min(transcript.length, end + windowSize),
  );

  const beforeLines = beforeChunk
    .split("\n")
    .map(line => extractTextFromLine(line));
  const afterLines = afterChunk
    .split("\n")
    .map(line => extractTextFromLine(line));

  const beforeText = beforeLines.join(" ").trim();
  const afterText = afterLines.join(" ").trim();

  const beforeWords = beforeText.split(/\s+/).filter(word => word.length > 0);
  const afterWords = afterText.split(/\s+/).filter(word => word.length > 0);

  const contextBefore = beforeWords.slice(-contextWords).join(" ");
  const contextAfter = afterWords.slice(0, contextWords).join(" ");

  return {
    before: contextBefore,
    after: contextAfter,
  };
}

/**
 * Verify scripture matches using LLM context analysis.
 * Makes a single batched API call to verify all matches at once.
 *
 * @param transcript - Full transcript text
 * @param matches - Array of match positions from regex
 * @param book - Book definition with description for LLM context
 * @param episodeContext - Optional episode information for logging
 * @returns Array of indices (into matches array) that are valid matches
 */
export async function verifyScriptureMatches(
  transcript: string,
  matches: Array<{ start: number; end: number; text: string }>,
  book: BookDefinition & { llmVerify: true },
  episodeContext?: EpisodeContext,
): Promise<number[]> {
  if (matches.length === 0) {
    return [];
  }

  // Extract context for each match
  const contexts: MatchContext[] = matches.map((match, index) => {
    const { before, after } = extractContext(
      transcript,
      match.start,
      match.end,
    );
    return {
      index,
      matchedText: match.text,
      contextBefore: before,
      contextAfter: after,
    };
  });

  // Build verification prompt
  const prompt = buildVerificationPrompt(book, contexts);

  try {
    const response = await ai.models.generateContent({
      model: speakerIdModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(VerificationResultSchema),
      },
    });

    const responseText = response.text;
    if (!responseText) {
      console.warn(
        `  ⚠ Scripture verification returned empty response for "${book.canonical}"`,
      );
      return [];
    }

    const result = VerificationResultSchema.parse(JSON.parse(responseText));

    // Log results
    const acceptedCount = result.verifications.filter(
      verification => verification.isMatch,
    ).length;
    const rejectedCount = result.verifications.length - acceptedCount;

    if (episodeContext) {
      const episodeLabel = episodeContext.episodeNumber
        ? `Episode ${episodeContext.episodeNumber}`
        : episodeContext.videoId;
      console.log(
        `      ${episodeLabel}: ${acceptedCount} accepted, ${rejectedCount} rejected for "${book.canonical}"`,
      );
    }

    // Return only the indices of accepted matches
    return result.verifications
      .filter(verification => verification.isMatch)
      .map(verification => verification.index);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle rate limit errors
    if (
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED")
    ) {
      console.error(
        `  ⚠️  Rate limit hit for "${book.canonical}" - waiting 60s before retry...`,
      );
      await new Promise(resolve => setTimeout(resolve, 60_000));

      try {
        console.log(
          `  🔄 Retrying scripture verification for "${book.canonical}"...`,
        );
        const retryResponse = await ai.models.generateContent({
          model: speakerIdModel,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: z.toJSONSchema(VerificationResultSchema),
          },
        });

        const retryResponseText = retryResponse.text;
        if (!retryResponseText) {
          console.warn(
            `  ⚠ Retry returned empty response for "${book.canonical}"`,
          );
          return [];
        }

        const retryResult = VerificationResultSchema.parse(
          JSON.parse(retryResponseText),
        );
        const verifiedIndices = retryResult.verifications
          .filter(verification => verification.isMatch)
          .map(verification => verification.index);

        console.log(
          `  ✅ Retry successful: ${verifiedIndices.length}/${matches.length} verified`,
        );
        return verifiedIndices;
      } catch (retryError) {
        console.error(`  ❌ Retry failed for "${book.canonical}":`, retryError);
        return [];
      }
    }

    console.error(
      `  ⚠ Scripture verification failed for "${book.canonical}":`,
      error,
    );
    // On error, accept no matches rather than all (conservative)
    return [];
  }
}

/**
 * Build LLM prompt for scripture reference verification.
 */
function buildVerificationPrompt(
  book: BookDefinition & { llmVerify: true },
  contexts: MatchContext[],
): string {
  return `You are a strict scripture reference verification system. Your job is to identify which text mentions are actual Bible scripture references.

TARGET BOOK:
Name: "${book.canonical}"
Testament: ${book.testament === "old" ? "Old Testament" : "New Testament"}
Description: ${book.description}

TASK:
Below are ${contexts.length} potential scripture references. For each, determine if it's an actual Bible reference or a false positive (person's name, common word usage, etc.).

CONTEXTS:
${contexts
  .map(
    context =>
      `[${context.index}] "${context.contextBefore} **${context.matchedText}** ${context.contextAfter}"`,
  )
  .join("\n")}

STRICT RULES FOR ACCEPTANCE:
- ACCEPT: Clear scripture citations like "in ${book.canonical} 3:16", "the book of ${book.canonical}", "${book.canonical} chapter 5"
- ACCEPT: References discussing biblical content from the book
- REJECT: Modern person names (e.g., "Mark Johnson", "Ruth Smith", "James Brown")
- REJECT: Common word usage not referring to the Bible (e.g., "job interview", "acts of kindness", "judges panel")
- REJECT: If lowercase "job", "mark", "acts", "ruth", "james", "judges" - likely not a scripture reference
- REJECT: If you're uncertain - be conservative

KEY INDICATORS OF REAL SCRIPTURE REFERENCES:
- Followed by chapter/verse numbers
- In context of biblical discussion, theology, or religious text
- Capitalized book name
- Phrases like "in the book of", "according to", "as written in"

OUTPUT:
For EACH of the ${contexts.length} contexts above, return a verification object with:
- "index": the context number [0-${contexts.length - 1}]
- "isMatch": true if it's a definite scripture reference, false otherwise
- "reasoning": brief explanation (1-2 sentences) of why you accepted or rejected it

Example format:
{
  "verifications": [
    {"index": 0, "isMatch": true, "reasoning": "Clear scripture citation with chapter and verse, discussing biblical content."},
    {"index": 1, "isMatch": false, "reasoning": "This is a person's name (Mark Johnson), not a Bible book reference."},
    {"index": 2, "isMatch": true, "reasoning": "Reference to Job chapter 3, discussing the biblical narrative of suffering."}
  ]
}`;
}
