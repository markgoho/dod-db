/**
 * Find all speaker label regions to exclude from matching.
 * Pattern: [HH:MM:SS.mmm] Speaker Name:
 */
export function findSpeakerLabelRanges(
  transcript: string,
): Array<{ start: number; end: number }> {
  const speakerLabelRanges: Array<{ start: number; end: number }> = [];
  const speakerLabelPattern = /\[\d{2}:\d{2}:\d{2}(?:\.\d{3})?\]\s+([^:]+):/g;

  let speakerMatch;
  while ((speakerMatch = speakerLabelPattern.exec(transcript)) !== null) {
    const fullMatch = speakerMatch[0];
    const speakerName = speakerMatch[1];
    if (!speakerName) continue;

    const speakerNameStart =
      speakerMatch.index + fullMatch.indexOf(speakerName);
    const speakerNameEnd = speakerNameStart + speakerName.length;
    speakerLabelRanges.push({ start: speakerNameStart, end: speakerNameEnd });
  }

  return speakerLabelRanges;
}
