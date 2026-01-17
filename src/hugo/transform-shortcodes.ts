/**
 * Transform transcript content into Hugo shortcode format.
 */

import { parseTranscriptLine } from "./shared.js";

/**
 * Transform transcript content into Hugo shortcode format.
 * Each line becomes a {{< line >}}...{{< /line >}} shortcode.
 */
export function transformToShortcodes(content: string): string {
  const lines = content.split("\n");
  const shortcodeLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      continue;
    }

    // Only wrap lines that match the transcript pattern
    const parsed = parseTranscriptLine(trimmed);
    if (parsed) {
      // Reconstruct the line with full millisecond precision
      const msString = String(
        Math.round((parsed.totalSeconds % 1) * 1000),
      ).padStart(3, "0");
      const fullTimestamp = `[${parsed.timestamp}.${msString}]`;
      shortcodeLines.push(
        `{{< line >}}${fullTimestamp} ${parsed.speaker}: ${parsed.text}{{< /line >}}`,
      );
    }
  }

  return shortcodeLines.join("\n");
}
