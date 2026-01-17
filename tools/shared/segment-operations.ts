/**
 * Segment operations utilities for DoD Tools
 * Shared CRUD operations for managing episode segments
 */

import { formatSecondsToTimestamp, timestampToSeconds } from "./timestamp.js";
import type { EpisodeSegment } from "./types.js";

// Add a new segment at current audio time
export function addSegmentAtTime({
  segments,
  currentTime,
  audioDuration,
  defaultType = "main-content",
}: {
  segments: EpisodeSegment[];
  currentTime: number;
  audioDuration?: number;
  defaultType?: string;
}): { segments: EpisodeSegment[]; insertIndex: number } {
  const newSegment: EpisodeSegment = {
    type: defaultType,
    startTimestamp: formatSecondsToTimestamp(currentTime),

    endTimestamp: audioDuration
      ? formatSecondsToTimestamp(audioDuration)
      : null,
    confidence: "auto",
    detectionMethod: "manual",
  };

  const newSegments = [...segments, newSegment];

  // Sort by start time
  newSegments.sort(
    (a, b) =>
      timestampToSeconds(a.startTimestamp) -
      timestampToSeconds(b.startTimestamp),
  );

  // Find index of newly inserted segment
  const insertIndex = newSegments.indexOf(newSegment);

  return { segments: newSegments, insertIndex };
}

// Delete segment at index (optionally fill gaps)
export function deleteSegmentAtIndex({
  segments,
  index,
  fillGaps = false,
}: {
  segments: EpisodeSegment[];
  index: number;
  fillGaps?: boolean;
}): EpisodeSegment[] {
  if (index < 0 || index >= segments.length) return segments;

  const newSegments = [...segments];
  newSegments.splice(index, 1);

  if (
    fillGaps &&
    index < newSegments.length && // Extend previous segment to fill gap
    index > 0 &&
    newSegments[index]
  ) {
    newSegments[index - 1] = {
      ...newSegments[index - 1]!,
      endTimestamp: newSegments[index]!.startTimestamp,
    };
  }

  return newSegments;
}

// Update segment type
export function updateSegmentType({
  segments,
  index,
  type,
}: {
  segments: EpisodeSegment[];
  index: number;
  type: string;
}): EpisodeSegment[] {
  if (index < 0 || index >= segments.length) return segments;

  const newSegments = [...segments];
  newSegments[index] = {
    ...newSegments[index]!,
    type,
    confidence: "auto",
  };

  return newSegments;
}

// Update segment start timestamp
export function updateSegmentStart({
  segments,
  index,
  timestamp,
}: {
  segments: EpisodeSegment[];
  index: number;
  timestamp: string;
}): EpisodeSegment[] {
  if (index < 0 || index >= segments.length) return segments;

  const newSegments = [...segments];
  newSegments[index] = {
    ...newSegments[index]!,
    startTimestamp: timestamp,
    confidence: "auto",
  };

  return newSegments;
}

// Update segment end timestamp
export function updateSegmentEnd({
  segments,
  index,
  timestamp,
}: {
  segments: EpisodeSegment[];
  index: number;
  timestamp: string | undefined;
}): EpisodeSegment[] {
  if (index < 0 || index >= segments.length) return segments;

  const newSegments = [...segments];
  newSegments[index] = {
    ...newSegments[index]!,

    endTimestamp: timestamp ?? null,
    confidence: "auto",
  };

  return newSegments;
}

// Mark all segments as verified
export function markAllSegmentsVerified(
  segments: EpisodeSegment[],
): EpisodeSegment[] {
  return segments.map(seg => ({
    ...seg,
    confidence: "verified",
  }));
}

// Sort segments by start timestamp
export function sortSegmentsByTime(
  segments: EpisodeSegment[],
): EpisodeSegment[] {
  return [...segments].sort(
    (a, b) =>
      timestampToSeconds(a.startTimestamp) -
      timestampToSeconds(b.startTimestamp),
  );
}
