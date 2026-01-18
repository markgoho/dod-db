/**
 * Parse timestamp string "[HH:MM:SS.mmm]" or "HH:MM:SS.mmm" or "HH:MM:SS" into total seconds.
 * Handles both bracketed (from stored segments) and non-bracketed (from transcripts) formats.
 */
export function parseTimestampToSeconds(timestamp: string): number {
  const match = /^\[?(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\]?$/.exec(timestamp);
  if (!match) return 0;

  const hours = Number.parseInt(match[1] ?? "0", 10);
  const minutes = Number.parseInt(match[2] ?? "0", 10);
  const seconds = Number.parseInt(match[3] ?? "0", 10);
  const milliseconds = Number.parseInt(match[4] ?? "0", 10);

  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}
