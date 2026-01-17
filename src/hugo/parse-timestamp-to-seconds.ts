/**
 * Parse a timestamp string "[HH:MM:SS.mmm]" or "[HH:MM:SS]" to total seconds.
 */
export function parseTimestampToSeconds(timestamp: string): number {
  // Remove brackets
  const clean = timestamp.replaceAll(/^\[|\]$/g, "");
  const parts = clean.split(":");
  const hours = Number.parseInt(parts[0] ?? "0", 10);
  const minutes = Number.parseInt(parts[1] ?? "0", 10);
  const secondsPart = parts[2] ?? "0";

  // Handle milliseconds
  const [seconds, milliseconds] = secondsPart.split(".");
  const totalSeconds =
    hours * 3600 +
    minutes * 60 +
    Number.parseInt(seconds ?? "0", 10) +
    (milliseconds ? Number.parseInt(milliseconds, 10) / 1000 : 0);

  return totalSeconds;
}
