/**
 * Segment utilities for DoD Tools
 */

import { timestampToSeconds } from "./timestamp.js";
import type { EpisodeSegment } from "./types.js";

// Get segment duration in seconds
export function getSegmentDuration(
  segment: EpisodeSegment,
  totalDuration?: number,
): number {
  const start = timestampToSeconds(segment.startTimestamp);
  const end = segment.endTimestamp
    ? timestampToSeconds(segment.endTimestamp)
    : totalDuration || start + 300; // Default 5 minutes if no end
  return end - start;
}

// Get total duration from segments array
export function getTotalDuration(segments: EpisodeSegment[]): number {
  if (segments.length === 0) return 3600; // Default 1 hour
  let max = 0;
  for (const seg of segments) {
    const end = seg.endTimestamp
      ? timestampToSeconds(seg.endTimestamp)
      : timestampToSeconds(seg.startTimestamp) + 300;
    if (end > max) max = end;
  }
  return max;
}
