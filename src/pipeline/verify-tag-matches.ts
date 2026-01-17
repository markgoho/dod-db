/**
 * LLM-based verification of tag matches using context.
 * Used for ambiguous tags where regex matching needs additional validation.
 */

import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";
import type { TagDefinition } from "../config/tag-vocabulary.js";

interface MatchContext {
  index: number;
  matchedText: string;
  contextBefore: string;
  contextAfter: string;
}

export interface EpisodeContext {
  episodeNumber?: number;
  videoId: string;
  title: string;
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

// Box formatting constants
const BOX_WIDTH = 80; // Total width including borders
const BOX_BORDER_WIDTH = 2; // Left and right borders (│ + │)
const BOX_PADDING_PER_SIDE = 1; // Space padding inside borders on each side
const BOX_TOTAL_PADDING = BOX_PADDING_PER_SIDE * 2; // Total horizontal padding (left + right spaces)
const BOX_CONTENT_WIDTH = BOX_WIDTH - BOX_BORDER_WIDTH; // 78 (space between borders)
const BOX_INNER_WIDTH = BOX_CONTENT_WIDTH - BOX_TOTAL_PADDING; // 76 (usable width with padding)
const LINE_SUFFIX_WIDTH = BOX_PADDING_PER_SIDE + 1; // Width of " │" (space + border)
const CONTEXT_PREFIX = "│   Context: "; // First context line prefix
const CONTEXT_PREFIX_WIDTH = 13; // Length of "│   Context: "
const CONTEXT_INDENT = "│             "; // Context continuation line indent
const CONTEXT_INDENT_WIDTH = 14; // Length of "│             "
const CONTEXT_MAX_WIDTH = 64; // Max width for wrapped context text

/**
 * Strip ANSI color codes from text to get visible length.
 *
 * @param text - Text potentially containing ANSI color codes
 * @returns Text with ANSI codes removed
 */
function stripAnsiCodes(text: string): string {
  // eslint-disable-next-line no-control-regex -- ANSI escape sequences contain control characters
  return text.replaceAll(/\u001B\[\d+m/g, "");
}

/**
 * Calculate the actual terminal display width of a string.
 * Accounts for ANSI codes (width 0) and emoji/wide characters (width 2).
 *
 * @param text - Text to measure
 * @returns Terminal display width in character cells
 */
function getTerminalWidth(text: string): number {
  // Strip ANSI codes first
  const stripped = stripAnsiCodes(text);

  let width = 0;
  for (const char of stripped) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;

    // Emoji and other wide characters (simplified check)
    // Most emoji are in these ranges:
    // 0x1F300-0x1F9FF (Miscellaneous Symbols and Pictographs, Emoticons, etc.)
    // 0x2600-0x26FF (Miscellaneous Symbols)
    // 0x2700-0x27BF (Dingbats)
    const isWideCharacter =
      (code >= 0x1_F3_00 && code <= 0x1_F9_FF) ||
      (code >= 0x26_00 && code <= 0x26_FF) ||
      (code >= 0x27_00 && code <= 0x27_BF);

    width += isWideCharacter ? 2 : 1;
  }

  return width;
}

/**
 * Wrap text to fit within specified width, preserving ANSI color codes.
 *
 * @param text - Text to wrap (may contain ANSI color codes)
 * @param maxWidth - Maximum width in visible characters
 * @returns Array of wrapped lines
 */
function wrapText(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = "";
  let visibleLength = 0;

  // Split by words to wrap intelligently
  const words = text.split(" ");

  for (const word of words) {
    const wordLength = getTerminalWidth(word);

    // Check if adding this word would exceed max width
    if (visibleLength + wordLength + (currentLine ? 1 : 0) > maxWidth) {
      // Push current line if it has content
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
        visibleLength = 0;
      }

      // If word itself is too long, just add it anyway
      if (wordLength > maxWidth) {
        lines.push(word);
        continue;
      }
    }

    // Add word to current line
    if (currentLine) {
      currentLine += " " + word;
      visibleLength += 1 + wordLength;
    } else {
      currentLine = word;
      visibleLength = wordLength;
    }
  }

  // Push remaining line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

/**
 * Extract text content from a transcript line, removing timestamp and speaker label.
 *
 * @param line - Transcript line in format "[HH:MM:SS.mmm] Speaker Name: text"
 * @returns Just the text content after the speaker label
 */
function extractTextFromLine(line: string): string {
  // Match [timestamp] Speaker: text
  const match = /^\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+[^:]+:\s*(.*)$/.exec(
    line,
  );
  return match?.[1] ?? line; // Return text after colon, or full line if no match
}

/**
 * Extract context around a match position using word-based window.
 * Extracts 30 words before and after the match (excluding timestamps/speaker labels).
 *
 * @param transcript - Full transcript text
 * @param start - Start position of match
 * @param end - End position of match
 * @param contextWords - Number of words to include before/after (default: 30)
 * @returns Context before and after the match
 */
function extractContext(
  transcript: string,
  start: number,
  end: number,
  contextWords = 30,
): { before: string; after: string } {
  // Get a generous character window around the match
  const windowSize = 2000; // Enough to get 30+ words in most cases
  const beforeChunk = transcript.slice(Math.max(0, start - windowSize), start);
  const afterChunk = transcript.slice(
    end,
    Math.min(transcript.length, end + windowSize),
  );

  // Extract text content from lines (remove timestamps/speaker labels)
  const beforeLines = beforeChunk
    .split("\n")
    .map(line => extractTextFromLine(line));
  const afterLines = afterChunk
    .split("\n")
    .map(line => extractTextFromLine(line));

  // Join and split into words
  const beforeText = beforeLines.join(" ").trim();
  const afterText = afterLines.join(" ").trim();

  const beforeWords = beforeText.split(/\s+/).filter(w => w.length > 0);
  const afterWords = afterText.split(/\s+/).filter(w => w.length > 0);

  // Take last N words before, first N words after
  const contextBefore = beforeWords.slice(-contextWords).join(" ");
  const contextAfter = afterWords.slice(0, contextWords).join(" ");

  return {
    before: contextBefore,
    after: contextAfter,
  };
}

/**
 * Verify tag matches using LLM context analysis.
 * Makes a single batched API call to verify all matches at once.
 *
 * @param transcript - Full transcript text
 * @param matches - Array of match positions from regex
 * @param tag - Tag definition with description for LLM context
 * @param episodeContext - Optional episode information for logging
 * @returns Array of indices (into matches array) that are valid matches
 */
export async function verifyTagMatches(
  transcript: string,
  matches: Array<{ start: number; end: number; text: string }>,
  tag: TagDefinition & { llmVerify: true },
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
  const prompt = buildVerificationPrompt(tag, contexts);

  try {
    const response = await ai.models.generateContent({
      model: speakerIdModel, // gemini-2.0-flash (fast, cheap)
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(VerificationResultSchema),
      },
    });

    const responseText = response.text;
    if (!responseText) {
      console.warn(
        `  ⚠ Verification returned empty response for "${tag.canonical}"`,
      );
      return [];
    }

    const result = VerificationResultSchema.parse(JSON.parse(responseText));

    // Log detailed results for debugging
    const boxTop = `╭${"─".repeat(BOX_CONTENT_WIDTH)}╮`;
    const boxBottom = `╰${"─".repeat(BOX_CONTENT_WIDTH)}╯`;
    const divider = `├${"─".repeat(BOX_CONTENT_WIDTH)}┤`;

    console.log(`\n${boxTop}`);

    // Format header line
    const headerText = `📋 LLM Verification Results for "${tag.canonical}"`;
    // Total: │ + space + headerWidth + padding + space + │ = 80
    const headerPadding =
      BOX_WIDTH -
      (1 + BOX_PADDING_PER_SIDE) -
      getTerminalWidth(headerText) -
      LINE_SUFFIX_WIDTH;
    console.log(`│ ${headerText}${" ".repeat(Math.max(0, headerPadding))} │`);

    // Log episode context if available
    if (episodeContext) {
      const episodeLabel = episodeContext.episodeNumber
        ? `Episode ${episodeContext.episodeNumber}`
        : episodeContext.videoId;
      const episodeText = `📺 ${episodeLabel} - ${episodeContext.title}`;

      // Wrap episode title if too long
      const episodeWidth = getTerminalWidth(episodeText);
      if (episodeWidth > BOX_INNER_WIDTH) {
        const episodeLines = wrapText(episodeText, BOX_INNER_WIDTH - 1);
        for (const line of episodeLines) {
          const padding =
            BOX_WIDTH -
            (1 + BOX_PADDING_PER_SIDE) -
            getTerminalWidth(line) -
            LINE_SUFFIX_WIDTH;
          console.log(`│ ${line}${" ".repeat(Math.max(0, padding))} │`);
        }
      } else {
        const episodePadding =
          BOX_WIDTH -
          (1 + BOX_PADDING_PER_SIDE) -
          episodeWidth -
          LINE_SUFFIX_WIDTH;
        console.log(
          `│ ${episodeText}${" ".repeat(Math.max(0, episodePadding))} │`,
        );
      }
    }

    console.log(divider);

    let acceptedCount = 0;
    let rejectedCount = 0;

    for (const verification of result.verifications) {
      const match = matches[verification.index];
      if (!match) continue;

      const context = contexts[verification.index];
      if (!context) continue;

      const symbol = verification.isMatch ? "✓" : "✗";
      const statusColor = verification.isMatch ? "\u001B[32m" : "\u001B[31m"; // green : red
      const reset = "\u001B[0m";
      const highlightColor = "\u001B[33m"; // yellow for match highlight

      console.log(`│${" ".repeat(BOX_CONTENT_WIDTH)}│`);

      // Format match line
      const matchText = `${statusColor}${symbol}${reset} Match [${verification.index}]: "${match.text}"`;
      const matchWidth = getTerminalWidth(matchText);
      // Total: │ + space + text + padding + space + │ = 80
      const matchPadding =
        BOX_WIDTH - (1 + BOX_PADDING_PER_SIDE) - matchWidth - LINE_SUFFIX_WIDTH;
      console.log(`│ ${matchText}${" ".repeat(Math.max(0, matchPadding))} │`);

      // Format reasoning (may wrap to multiple lines)
      const reasoningPrefix = `${statusColor}Reasoning:${reset}`;
      const reasoningText = `${reasoningPrefix} ${verification.reasoning}`;
      const reasoningLines = wrapText(reasoningText, BOX_INNER_WIDTH - 1);

      for (const [index, line] of reasoningLines.entries()) {
        const lineWidth = getTerminalWidth(line);
        const prefix = index === 0 ? "│   " : "│     ";
        const prefixLength = prefix.length; // 4 or 6
        // Total: prefix + line + padding + space + │ = 80
        const padding =
          BOX_WIDTH - prefixLength - lineWidth - LINE_SUFFIX_WIDTH;
        console.log(`${prefix}${line}${" ".repeat(Math.max(0, padding))} │`);
      }

      console.log(`│${" ".repeat(BOX_CONTENT_WIDTH)}│`);

      // Show the surrounding context with the match highlighted in yellow
      const combinedContext = `${context.contextBefore} ${highlightColor}${context.matchedText}${reset} ${context.contextAfter}`;

      // Wrap context text to fit in box
      const contextLines = wrapText(combinedContext, CONTEXT_MAX_WIDTH);

      for (const [index, line] of contextLines.entries()) {
        const lineWidth = getTerminalWidth(line);
        if (index === 0) {
          // First line with "Context: " prefix
          // Total: CONTEXT_PREFIX + line + padding + space + │ = 80
          const padding =
            BOX_WIDTH - CONTEXT_PREFIX_WIDTH - lineWidth - LINE_SUFFIX_WIDTH;
          console.log(
            `${CONTEXT_PREFIX}${line}${" ".repeat(Math.max(0, padding))} │`,
          );
        } else {
          // Continuation lines with indentation
          // Total: CONTEXT_INDENT + line + padding + space + │ = 80
          const padding =
            BOX_WIDTH - CONTEXT_INDENT_WIDTH - lineWidth - LINE_SUFFIX_WIDTH;
          console.log(
            `${CONTEXT_INDENT}${line}${" ".repeat(Math.max(0, padding))} │`,
          );
        }
      }

      if (verification.isMatch) {
        acceptedCount++;
      } else {
        rejectedCount++;
      }

      // Add separator between matches (except after last one)
      if (verification.index < result.verifications.length - 1) {
        console.log(`│${" ".repeat(BOX_CONTENT_WIDTH)}│`);
        console.log(`│ ${"-".repeat(BOX_INNER_WIDTH)} │`);
      }
    }

    console.log(divider);
    const greenColor = "\u001B[32m";
    const redColor = "\u001B[31m";
    const resetColor = "\u001B[0m";
    const summaryText = `Summary: ${greenColor}${acceptedCount} accepted${resetColor}, ${redColor}${rejectedCount} rejected${resetColor}`;
    const summaryWidth = getTerminalWidth(summaryText);
    // Total: │ + space + text + padding + space + │ = 80
    const summaryPadding =
      BOX_WIDTH - (1 + BOX_PADDING_PER_SIDE) - summaryWidth - LINE_SUFFIX_WIDTH;
    console.log(`│ ${summaryText}${" ".repeat(Math.max(0, summaryPadding))} │`);
    console.log(`${boxBottom}\n`);

    // Return only the indices of accepted matches
    return result.verifications.filter(v => v.isMatch).map(v => v.index);
  } catch (error) {
    // Check if it's a rate limit error (429)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      errorMessage.includes("429") ||
      errorMessage.includes("RESOURCE_EXHAUSTED")
    ) {
      console.error(
        `  ⚠️  Rate limit hit for "${tag.canonical}" - waiting 60s before retry...`,
      );
      // Wait 60 seconds and retry once
      await new Promise(resolve => setTimeout(resolve, 60_000));
      try {
        console.log(`  🔄 Retrying verification for "${tag.canonical}"...`);
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
            `  ⚠ Retry returned empty response for "${tag.canonical}"`,
          );
          return [];
        }

        const retryResult = VerificationResultSchema.parse(
          JSON.parse(retryResponseText),
        );
        const verifiedIndices = retryResult.verifications
          .filter(v => v.isMatch)
          .map(v => v.index);

        console.log(
          `  ✅ Retry successful: ${verifiedIndices.length}/${matches.length} verified`,
        );
        return verifiedIndices;
      } catch (retryError) {
        console.error(`  ❌ Retry failed for "${tag.canonical}":`, retryError);
        return [];
      }
    }

    console.error(`  ⚠ Verification failed for "${tag.canonical}":`, error);
    // On error, accept no matches rather than all (conservative)
    return [];
  }
}

/**
 * Build LLM prompt for context verification.
 *
 * @param tag - Tag definition with description
 * @param contexts - Array of match contexts to verify
 * @returns Formatted prompt string
 */
function buildVerificationPrompt(
  tag: TagDefinition & { llmVerify: true },
  contexts: MatchContext[],
): string {
  const variationsText =
    tag.variations.length > 0
      ? `Also known as: ${tag.variations.join(", ")}`
      : "";

  return `You are a strict entity verification system. Your job is to identify which text mentions refer to a SPECIFIC historical/biblical entity.

TARGET ENTITY:
Name: "${tag.canonical}"
Category: ${tag.category}
Description: ${tag.description}
${variationsText}

TASK:
Below are ${contexts.length} potential matches. For each, determine if it refers to the SPECIFIC entity described above, NOT any other person/thing with the same name.

CONTEXTS:
${contexts
  .map(
    context =>
      `[${context.index}] "${context.contextBefore} **${context.matchedText}** ${context.contextAfter}"`,
  )
  .join("\n")}

STRICT RULES:
- ONLY include matches that clearly refer to ${tag.canonical} as described: ${tag.description}
- REJECT modern people (e.g., mentions of technology, contemporary events, modern locations)
- REJECT if context suggests a different person with the same name
- REJECT if you're uncertain - be conservative
- When in doubt, exclude it

OUTPUT:
For EACH of the ${contexts.length} contexts above, return a verification object with:
- "index": the context number [0-${contexts.length - 1}]
- "isMatch": true if it's a definite match for ${tag.canonical}, false otherwise
- "reasoning": brief explanation (1-2 sentences) of why you accepted or rejected it

Example format:
{
  "verifications": [
    {"index": 0, "isMatch": true, "reasoning": "Context mentions Persian Empire and dates to 550 BC, clearly referring to Cyrus the Great."},
    {"index": 1, "isMatch": false, "reasoning": "Appears in modern discussion without historical context, likely a person's name today."},
    {"index": 2, "isMatch": true, "reasoning": "Biblical reference to the king who freed the Israelites, matches the historical figure."}
  ]
}`;
}
