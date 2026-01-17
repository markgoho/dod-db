import type { TranscriptLine } from "./detect-segments-types.js";

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
