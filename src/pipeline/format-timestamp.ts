/**
 * Format timestamp for display (remove milliseconds).
 */
export function formatTimestamp(timestamp: string): string {
  // "[00:01:23.456]" -> "00:01:23"
  return timestamp.replace(/\.\d{3}/, "").replaceAll(/[[\]]/g, "");
}
