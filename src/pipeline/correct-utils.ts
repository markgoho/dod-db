import type { CorrectionRule } from "../config/corrections.js";

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * Apply deterministic corrections to a transcript.
 * Uses case-insensitive whole-word matching.
 *
 * @param text - The transcript text to correct
 * @param rules - Array of correction rules to apply
 * @returns Corrected text and count of replacements made
 */
export function applyDeterministicCorrections(
  text: string,
  rules: CorrectionRule[],
): { correctedText: string; count: number } {
  let correctedText = text;
  let count = 0;

  for (const [variations, correction] of rules) {
    for (const variation of variations) {
      // Case-insensitive whole-word replacement
      const pattern = new RegExp(
        String.raw`\b${escapeRegex(variation)}\b`,
        "gi",
      );
      const matches = correctedText.match(pattern);
      if (matches) {
        correctedText = correctedText.replaceAll(pattern, correction);
        count += matches.length;
      }
    }
  }

  return { correctedText, count };
}

/**
 * Find the last timestamp in text and return its position.
 * Used to find where chunk 1 content ends for matching in chunk 2.
 */
function findLastTimestamp(
  text: string,
): { timestamp: string; position: number } | undefined {
  // Find all timestamps in the text
  const timestampPattern = /\[([0-9]{1,2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]{3})?)\]/g;
  let lastMatch: RegExpExecArray | undefined;
  let match: RegExpExecArray | null;

  // RegExp.exec() returns null (not undefined) when no match found
  while ((match = timestampPattern.exec(text)) !== null) {
    lastMatch = match;
  }

  if (lastMatch && lastMatch[1]) {
    return {
      timestamp: lastMatch[1],
      position: lastMatch.index,
    };
  }
  return undefined;
}

/**
 * Find the position in chunk where a timestamp line starts.
 * Returns the position of the newline before the timestamp (or 0 if at start).
 */
function findTimestampLineStart(
  chunk: string,
  timestamp: string,
): number | undefined {
  // Look for the timestamp at the start of a line
  const pattern = new RegExp(
    String.raw`(^|\n)(\[${timestamp.replace(".", String.raw`\.`)}\])`,
    "g",
  );
  const match = pattern.exec(chunk);

  if (match) {
    // Return position right after the newline (or 0 if at start)
    return match[1] === "\n" ? match.index + 1 : match.index;
  }
  return undefined;
}

/**
 * Check if text ends with a complete line (ends with newline or is empty).
 */
function endsWithCompleteLine(text: string): boolean {
  return text.length === 0 || text.endsWith("\n");
}

/**
 * Remove the last incomplete line from text and return both parts.
 */
function splitAtLastCompleteLine(text: string): {
  complete: string;
  incomplete: string;
} {
  const lastNewline = text.lastIndexOf("\n");
  if (lastNewline === -1) {
    return { complete: "", incomplete: text };
  }
  return {
    complete: text.slice(0, lastNewline + 1),
    incomplete: text.slice(lastNewline + 1),
  };
}

/**
 * Deduplicate overlapping text from corrected chunks.
 * Uses timestamp-aware joining to prevent merged lines and data loss.
 *
 * Strategy:
 * 1. If chunk ends mid-line, find that line's timestamp
 * 2. Look for that timestamp in the next chunk's overlap region
 * 3. Use the next chunk's complete version of that line
 *
 * This handles LLM corrections that change character counts in overlap regions.
 *
 * @param correctedChunks - Array of corrected chunk texts
 * @param overlapSize - Approximate number of overlap characters (used as fallback hint)
 * @returns Deduplicated concatenated text
 */
export function deduplicateChunks(
  correctedChunks: string[],
  overlapSize: number,
): string {
  if (correctedChunks.length === 0) return "";
  if (correctedChunks.length === 1) return correctedChunks[0] ?? "";

  // Start with the first chunk
  let result = correctedChunks[0] ?? "";

  // Process subsequent chunks
  for (let index = 1; index < correctedChunks.length; index++) {
    const chunk = correctedChunks[index];
    if (!chunk) continue;

    let trimStart: number | undefined; // undefined means not found yet
    let resultTrimEnd = result.length; // How much of result to keep

    // Check if result ends with incomplete line
    if (endsWithCompleteLine(result)) {
      // Result ends with complete line - find last timestamp and match in chunk
      const lastTs = findLastTimestamp(result);

      if (lastTs) {
        const tsInChunk = findTimestampLineStart(chunk, lastTs.timestamp);

        if (tsInChunk !== undefined) {
          // Found the timestamp - start from the NEXT line (skip the duplicate)
          const afterTs = chunk.slice(tsInChunk);
          const nextLineStart = afterTs.indexOf("\n");
          trimStart =
            nextLineStart === -1 ? chunk.length : tsInChunk + nextLineStart + 1;
        }
      }
    } else {
      const { complete, incomplete } = splitAtLastCompleteLine(result);

      // Find the timestamp of the incomplete line
      const incompleteTs = findLastTimestamp(incomplete);

      if (incompleteTs) {
        // Look for this timestamp in the new chunk
        const tsInChunk = findTimestampLineStart(chunk, incompleteTs.timestamp);

        if (tsInChunk !== undefined) {
          // Found it! Remove incomplete line from result, start chunk from this timestamp
          resultTrimEnd = complete.length;
          trimStart = tsInChunk;
        }
      }

      // If we couldn't find the timestamp, try matching the last complete line's timestamp
      if (trimStart === undefined && complete.length > 0) {
        const lastCompleteTs = findLastTimestamp(complete);
        if (lastCompleteTs) {
          const tsInChunk = findTimestampLineStart(
            chunk,
            lastCompleteTs.timestamp,
          );
          if (tsInChunk !== undefined) {
            resultTrimEnd = complete.length;
            // Skip to AFTER this line in chunk (it's already in result)
            const afterTs = chunk.slice(tsInChunk);
            const nextLineStart = afterTs.indexOf("\n");
            trimStart =
              nextLineStart === -1
                ? chunk.length
                : tsInChunk + nextLineStart + 1;
          }
        }
      }
    }

    // Fallback: if we couldn't find matching timestamps, use approximate overlap
    if (trimStart === undefined) {
      // Look for the first timestamp line after approximately half the overlap
      const searchStart = Math.max(0, Math.floor(overlapSize * 0.5));
      const searchRegion = chunk.slice(
        searchStart,
        Math.min(chunk.length, overlapSize * 2),
      );

      // Find first newline followed by a timestamp
      const tsPattern = /\n(\[[0-9]{1,2}:[0-9]{2}:[0-9]{2})/;
      const match = tsPattern.exec(searchRegion);

      if (match?.index === undefined) {
        // Last resort: find any newline after overlap point
        const afterOverlap = chunk.slice(overlapSize);
        const newlinePos = afterOverlap.indexOf("\n");
        trimStart =
          newlinePos === -1 ? overlapSize : overlapSize + newlinePos + 1;
      } else {
        trimStart = searchStart + match.index + 1;
      }
    }

    // Apply trims
    result = result.slice(0, resultTrimEnd);
    const trimmed = chunk.slice(trimStart ?? 0);

    // Ensure proper line separation
    if (result.length > 0 && !result.endsWith("\n") && trimmed.length > 0) {
      result += "\n";
    }

    result += trimmed;
  }

  return result;
}
