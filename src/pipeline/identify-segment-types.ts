/**
 * Identify segment types from transcript context after audio jingle detection.
 *
 * Flow:
 * 1. Parse transcript into lines
 * 2. For each segment with type='segment' (unidentified):
 *    a. Find transcript lines around the segment timestamp
 *    b. Try deterministic pattern matching
 *    c. If no match, collect for LLM batch
 * 3. Batch LLM call for unmatched segments
 * 4. Return updated segments with identified types
 */

import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";
import {
  SEGMENT_PATTERNS,
  type SegmentType,
} from "../config/segment-patterns.js";
import { segmentIdentificationPrompt } from "../prompts/segment-identification-prompt.js";
import {
  SegmentIdentificationSchema,
  type SegmentContext,
} from "../prompts/segment-identification.js";
import {
  parseTranscript,
  timestampToSeconds,
  type Segment,
  type TranscriptLine,
} from "./detect-segments.js";

/**
 * Configuration for context extraction.
 */
const CONTEXT_CONFIG = {
  linesBefore: 10, // More lines before (segment usually announced before jingle)
  linesAfter: 5, // Fewer lines after (occasionally repeated)
  timestampTolerance: 5, // Seconds tolerance when finding closest line
};

/**
 * Find the transcript line closest to a target timestamp.
 *
 * @param lines - Parsed transcript lines
 * @param targetSeconds - Target timestamp in seconds
 * @param tolerance - Maximum seconds difference to accept
 * @returns Index of closest line, or -1 if none within tolerance
 */
function findClosestLineIndex(
  lines: TranscriptLine[],
  targetSeconds: number,
  tolerance: number,
): number {
  let closestIndex = -1;
  let closestDiff = Number.POSITIVE_INFINITY;

  for (const [index, line] of lines.entries()) {
    const lineSeconds = timestampToSeconds(line.timestamp);
    const diff = Math.abs(lineSeconds - targetSeconds);

    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = index;
    }
  }

  // Return -1 if closest line is beyond tolerance
  if (closestDiff > tolerance) {
    return -1;
  }

  return closestIndex;
}

/**
 * Extract transcript lines before and after a target index separately.
 *
 * @param lines - Parsed transcript lines
 * @param targetIndex - Index of the target line (closest to jingle timestamp)
 * @param linesBefore - Number of lines to include before
 * @param linesAfter - Number of lines to include after
 * @returns Object with before, after, and combined lines
 */
function extractLinesAround(
  lines: TranscriptLine[],
  targetIndex: number,
  linesBefore: number,
  linesAfter: number,
): {
  before: TranscriptLine[];
  after: TranscriptLine[];
  all: TranscriptLine[];
} {
  const startIndex = Math.max(0, targetIndex - linesBefore);
  const endIndex = Math.min(lines.length, targetIndex + linesAfter + 1);

  return {
    before: lines.slice(startIndex, targetIndex),
    after: lines.slice(targetIndex, endIndex),
    all: lines.slice(startIndex, endIndex),
  };
}

/**
 * Format transcript lines as readable context text.
 */
function formatContextText(lines: TranscriptLine[]): string {
  return lines
    .map(line => `${line.timestamp} ${line.speaker}: ${line.text}`)
    .join("\n");
}

/**
 * Try to match segment type from context using deterministic patterns.
 *
 * @param contextText - Text content to search
 * @returns Matched segment type and pattern, or undefined if no match
 */
function matchSegmentTypeFromContext(
  contextText: string,
): { type: SegmentType; pattern: string } | undefined {
  // Check each segment type's patterns
  for (const [segmentType, patterns] of Object.entries(SEGMENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(contextText)) {
        return {
          type: segmentType as SegmentType,
          pattern: pattern.source,
        };
      }
    }
  }

  return undefined;
}

/**
 * Identify segment types using LLM for a batch of unmatched segments.
 *
 * @param contexts - Array of segment contexts to identify
 * @returns Map of segment index to identified type
 */
async function identifySegmentsWithLLM(
  contexts: SegmentContext[],
): Promise<Map<number, { type: SegmentType; confidence: number }>> {
  const results = new Map<number, { type: SegmentType; confidence: number }>();

  if (contexts.length === 0) {
    return results;
  }

  console.log(`  🤖 Identifying ${contexts.length} segment(s) with LLM...`);

  const prompt = segmentIdentificationPrompt(contexts);

  try {
    const response = await ai.models.generateContent({
      model: speakerIdModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: z.toJSONSchema(SegmentIdentificationSchema),
      },
    });

    const responseText = response.text;
    if (!responseText) {
      console.warn("  ⚠️ LLM returned empty response");
      return results;
    }

    const parsed = SegmentIdentificationSchema.parse(JSON.parse(responseText));

    for (const identification of parsed.identifications) {
      console.log(
        `  [${identification.index}] → ${identification.segmentType} (${identification.confidence}%) - ${identification.reasoning}`,
      );

      results.set(identification.index, {
        type: identification.segmentType as SegmentType,
        confidence: identification.confidence,
      });
    }
  } catch (error) {
    console.error("  ❌ LLM identification failed:", error);
  }

  return results;
}

/**
 * Identify segment types from transcript context.
 *
 * @param segments - Segments from audio detection (with type='segment')
 * @param transcript - Full transcript text
 * @returns Updated segments with identified types
 */
export async function identifySegmentTypes(
  segments: Segment[],
  transcript: string,
): Promise<Segment[]> {
  if (segments.length === 0) {
    return segments;
  }

  console.log(
    `\n📍 Identifying types for ${segments.length} detected segment(s)...`,
  );

  // Parse transcript into lines
  const lines = parseTranscript(transcript);
  if (lines.length === 0) {
    console.warn("  ⚠️ No transcript lines found, skipping identification");
    return segments;
  }

  // Track segments that need LLM identification
  const llmContexts: SegmentContext[] = [];
  const llmSegmentIndices: number[] = [];

  // Process each segment
  const updatedSegments = segments.map((segment, segmentIndex) => {
    // Skip segments that already have a type (not 'segment')
    if (segment.type !== "segment") {
      console.log(
        `  [${segmentIndex}] ${segment.startTimestamp} - Already identified as "${segment.type}"`,
      );
      return segment;
    }

    // Convert segment timestamp to seconds
    const targetSeconds = timestampToSeconds(segment.startTimestamp);

    // Find closest transcript line
    const closestLineIndex = findClosestLineIndex(
      lines,
      targetSeconds,
      CONTEXT_CONFIG.timestampTolerance,
    );

    if (closestLineIndex === -1) {
      console.log(
        `  [${segmentIndex}] ${segment.startTimestamp} - No transcript line found within tolerance`,
      );
      return segment;
    }

    // Extract context lines (before and after the jingle separately)
    const { before, after, all } = extractLinesAround(
      lines,
      closestLineIndex,
      CONTEXT_CONFIG.linesBefore,
      CONTEXT_CONFIG.linesAfter,
    );

    // Try pattern matching AFTER the jingle first (higher priority)
    // The segment name is more likely to be announced right after the jingle plays
    const afterContext = formatContextText(after);
    const afterMatch = matchSegmentTypeFromContext(afterContext);

    if (afterMatch) {
      console.log(
        `  [${segmentIndex}] ${segment.startTimestamp} → "${afterMatch.type}" (pattern-after: ${afterMatch.pattern})`,
      );
      return {
        ...segment,
        type: afterMatch.type,
        detectionMethod: "pattern" as const,
        matchedPattern: `after:${afterMatch.pattern}`,
      };
    }

    // Fall back to checking BEFORE the jingle
    const beforeContext = formatContextText(before);
    const beforeMatch = matchSegmentTypeFromContext(beforeContext);

    if (beforeMatch) {
      console.log(
        `  [${segmentIndex}] ${segment.startTimestamp} → "${beforeMatch.type}" (pattern-before: ${beforeMatch.pattern})`,
      );
      return {
        ...segment,
        type: beforeMatch.type,
        detectionMethod: "pattern" as const,
        matchedPattern: `before:${beforeMatch.pattern}`,
      };
    }

    // No pattern match - collect for LLM batch (send full context)
    const fullContextText = formatContextText(all);
    llmContexts.push({
      index: segmentIndex,
      timestamp: segment.startTimestamp,
      contextText: fullContextText,
    });
    llmSegmentIndices.push(segmentIndex);

    // Return unchanged for now (will be updated after LLM call)
    return segment;
  });

  // If there are segments needing LLM identification, batch process them
  if (llmContexts.length > 0) {
    const llmResults = await identifySegmentsWithLLM(llmContexts);

    // Update segments with LLM results
    for (const [segmentIndex, result] of llmResults) {
      const segment = updatedSegments[segmentIndex];
      if (segment && result.type !== "segment") {
        updatedSegments[segmentIndex] = {
          ...segment,
          type: result.type,
          detectionMethod: "llm" as const,
          matchedPattern: `llm-identification-${result.confidence}%`,
        };
      }
    }
  }

  // Summary
  const identifiedCount = updatedSegments.filter(
    s => s.type !== "segment",
  ).length;
  const patternCount = updatedSegments.filter(
    s => s.detectionMethod === "pattern",
  ).length;
  const llmCount = updatedSegments.filter(
    s => s.detectionMethod === "llm",
  ).length;
  const unidentifiedCount = updatedSegments.filter(
    s => s.type === "segment",
  ).length;

  console.log(
    `\n✅ Segment identification complete: ${identifiedCount}/${segments.length} identified`,
  );
  console.log(
    `   Pattern matches: ${patternCount}, LLM: ${llmCount}, Unidentified: ${unidentifiedCount}`,
  );

  return updatedSegments;
}
