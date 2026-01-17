import type { SegmentType } from "../config/segment-patterns.js";
import type { Segment } from "./detect-segments-types.js";

/**
 * Get detection statistics for a set of segments.
 */
export function getSegmentStats(segments: Segment[]): {
  total: number;
  byType: Record<SegmentType, number>;
  autoDetected: number;
  verified: number;
} {
  const byType: Record<string, number> = {};
  let autoDetected = 0;
  let verified = 0;

  for (const segment of segments) {
    byType[segment.type] = (byType[segment.type] || 0) + 1;
    if (segment.confidence === "auto") {
      autoDetected++;
    } else {
      verified++;
    }
  }

  return {
    total: segments.length,
    byType: byType as Record<SegmentType, number>,
    autoDetected,
    verified,
  };
}
