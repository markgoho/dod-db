/**
 * Convert seconds to timestamp string "[HH:MM:SS.mmm]".
 */
export function secondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = hours.toString().padStart(2, "0");
  const m = minutes.toString().padStart(2, "0");
  const s = Math.floor(seconds).toString().padStart(2, "0");
  const ms = Math.round((seconds % 1) * 1000)
    .toString()
    .padStart(3, "0");

  return `[${h}:${m}:${s}.${ms}]`;
}
