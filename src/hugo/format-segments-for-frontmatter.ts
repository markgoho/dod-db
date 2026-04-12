import {
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import { parseTimestampToSeconds } from "../utils/parse-timestamp-to-seconds.js";
import type { FormattedSegments, StoredSegment } from "./shared.js";
import { EXCLUDED_SEGMENT_TYPES } from "./shared.js";

/**
 * Format segments for Hugo frontmatter.
 * - Filters: only verified segments, excludes generic types
 * - Sorts by timestamp (chronological order)
 * - Indexes multi-instance segments: "Chapter and Verse (1)", "(2)"
 *
 * @returns Object with segments (unique names for taxonomy) and segmentData (all instances)
 */
export function formatSegmentsForFrontmatter(
  segments: StoredSegment[] | undefined,
): FormattedSegments {
  if (!segments || segments.length === 0) {
    return { segments: [], segmentData: [] };
  }

  // Filter: only verified, exclude generic types
  const filtered = segments.filter(
    segment =>
      segment.confidence === "verified" &&
      !EXCLUDED_SEGMENT_TYPES.has(segment.type as SegmentType),
  );

  if (filtered.length === 0) {
    return { segments: [], segmentData: [] };
  }

  // Sort by timestamp (chronological order)
  const sorted = [...filtered].sort((a, b) => {
    const aSeconds = parseTimestampToSeconds(a.startTimestamp);
    const bSeconds = parseTimestampToSeconds(b.startTimestamp);
    return aSeconds - bSeconds;
  });

  // Count instances of each segment type for indexing
  const typeCounts = new Map<string, number>();
  const typeInstanceCounts = new Map<string, number>();

  // First pass: count total instances per type
  for (const segment of sorted) {
    const count = typeCounts.get(segment.type) ?? 0;
    typeCounts.set(segment.type, count + 1);
  }

  // Second pass: create labeled segment data
  const segmentData = [];
  const uniqueSegmentNames = new Set<string>();

  for (const segment of sorted) {
    const segmentType = segment.type as SegmentType;
    const label = SEGMENT_LABELS[segmentType];
    const instanceNumber = (typeInstanceCounts.get(segment.type) ?? 0) + 1;
    typeInstanceCounts.set(segment.type, instanceNumber);

    const startSeconds = parseTimestampToSeconds(segment.startTimestamp);

    segmentData.push({
      type: segment.type,
      anchor: `${segment.type}-${instanceNumber}`,
      label,
      topicLabel: segment.topicLabel,
      summary: segment.summary,
      startSeconds,
    });

    uniqueSegmentNames.add(label);
  }

  return {
    segments: [...uniqueSegmentNames],
    segmentData,
  };
}
