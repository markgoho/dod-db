/**
 * Convert timestamp string to seconds for comparison.
 */
export function timestampToSeconds(timestamp: string): number {
  // Remove brackets: "[00:01:23.456]" -> "00:01:23.456"
  const clean = timestamp.replaceAll(/[[\]]/g, "");
  const parts = clean.split(":");
  const hours = Number.parseInt(parts[0] ?? "0", 10);
  const minutes = Number.parseInt(parts[1] ?? "0", 10);
  const seconds = Number.parseFloat(parts[2] ?? "0");
  return hours * 3600 + minutes * 60 + seconds;
}
