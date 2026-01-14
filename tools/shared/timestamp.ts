/**
 * Timestamp utilities for DoD Tools
 */

// Convert timestamp string to seconds
export function timestampToSeconds(timestamp: string): number {
  const clean = timestamp.replaceAll(/[[\]]/g, '');
  const parts = clean.split(':');
  const hours = Number.parseInt(parts[0] ?? '0', 10);
  const minutes = Number.parseInt(parts[1] ?? '0', 10);
  const seconds = Number.parseFloat(parts[2] ?? '0');
  return hours * 3600 + minutes * 60 + seconds;
}

// Convert seconds to timestamp string
export function secondsToTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Format timestamp (remove brackets and milliseconds)
export function formatTimestamp(timestamp: string): string {
  return timestamp.replaceAll(/[[\]]/g, '').replace(/\.\d{3}$/, '');
}

// Parse timestamp string (validate and format)
export function parseTimestamp(string_: string): string | undefined {
  const match = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(string_.trim());
  if (!match || !match[1] || !match[2] || !match[3]) return undefined;
  return `[${match[1].padStart(2, '0')}:${match[2]}:${match[3]}.000]`;
}

// Convert seconds to full timestamp format with brackets
export function formatSecondsToTimestamp(sec: number): string {
  return `[${secondsToTimestamp(sec)}.000]`;
}
