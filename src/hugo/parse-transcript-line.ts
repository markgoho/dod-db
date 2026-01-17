/**
 * Parse a transcript line into its components.
 * Expected format: [HH:MM:SS.mmm] or [HH:MM:SS] Speaker Name: Text content
 */
export function parseTranscriptLine(line: string):
  | {
      timestamp: string;
      totalSeconds: number;
      speaker: string;
      text: string;
    }
  | undefined {
  const pattern =
    /^\[(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\]\s*([^:]+):\s*(.+)$/;
  const match = pattern.exec(line);

  if (!match) {
    return undefined;
  }

  const hours = match[1] ?? "00";
  const minutes = match[2] ?? "00";
  const seconds = match[3] ?? "00";
  const milliseconds = match[4] ?? "000";
  const speaker = match[5]?.trim() ?? "";
  const text = match[6]?.trim() ?? "";

  // Calculate total seconds with millisecond precision
  const totalSeconds =
    Number.parseInt(hours, 10) * 3600 +
    Number.parseInt(minutes, 10) * 60 +
    Number.parseInt(seconds, 10) +
    Number.parseInt(milliseconds, 10) / 1000;

  const timestamp = `${hours}:${minutes}:${seconds}`;

  return { timestamp, totalSeconds, speaker, text };
}
