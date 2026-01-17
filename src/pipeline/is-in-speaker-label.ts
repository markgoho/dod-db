/**
 * Check if a range falls within a speaker label.
 */
export function isInSpeakerLabel(
  start: number,
  end: number,
  speakerLabelRanges: Array<{ start: number; end: number }>,
): boolean {
  return speakerLabelRanges.some(
    range => start >= range.start && end <= range.end,
  );
}
