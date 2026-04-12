import type { TranscriptLine } from "./detect-segments-types.js";
import { timestampToSeconds } from "./detect-segments.js";

/**
 * Parse a transcript into structured lines.
 */
export function parseTranscript(transcript: string): TranscriptLine[] {
  const lines = transcript.split("\n");
  const parsed: TranscriptLine[] = [];

  // Pattern: [HH:MM:SS] or [HH:MM:SS.mmm] Speaker Name: text
  // Milliseconds are optional
  const linePattern =
    /^\s*\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\]\s*([^:]+):\s*(.*)$/;

  for (const [index, rawLine] of lines.entries()) {
    if (!rawLine) continue;
    const line = rawLine.trim();
    if (!line) continue;

    const match = linePattern.exec(line);
    if (match && match[1] && match[2] && match[3]) {
      // Normalize timestamp to always include milliseconds
      let timestamp = match[1];
      if (!timestamp.includes(".")) {
        timestamp += ".000";
      }
      parsed.push({
        timestamp: `[${timestamp}]`,
        speaker: match[2].trim(),
        text: match[3].trim(),
        lineNumber: index + 1,
      });
    }
  }

  return parsed;
}

export function findClosestTranscriptLineIndex(
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

  if (closestDiff > tolerance) {
    return -1;
  }

  return closestIndex;
}

export function findNearestTranscriptLineIndex(
  lines: TranscriptLine[],
  targetSeconds: number,
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

  return closestIndex;
}

export function extractTranscriptLinesAround(
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

export function formatTranscriptContext(lines: TranscriptLine[]): string {
  return lines
    .map(line => `${line.timestamp} ${line.speaker}: ${line.text}`)
    .join("\n");
}
