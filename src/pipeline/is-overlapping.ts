/**
 * Check if a range overlaps with any already-matched range.
 */
export function isOverlapping(
  start: number,
  end: number,
  matchedRanges: Array<{ start: number; end: number }>,
): boolean {
  return matchedRanges.some(
    range => !(end <= range.start || start >= range.end),
  );
}
