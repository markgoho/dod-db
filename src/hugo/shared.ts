/**
 * Shared types and constants for Hugo episode generation.
 */

import type { SegmentType } from "../config/segment-patterns.js";

export const HUGO_CONTENT_DIR = "hugo/content/episodes";

/** Regular hosts - anyone else in speakers array is a guest */
export const HOSTS = new Set(["Dan McClellan", "Dan Beecher"]);

/** Canonical guest name aliases for Hugo taxonomy/frontmatter */
export const GUEST_NAME_ALIASES = new Map([
  ["David Burnett", "David A. Burnett"],
]);

/** Segment types to exclude from episode pages (generic/placeholder types) */
export const EXCLUDED_SEGMENT_TYPES = new Set<SegmentType>([
  "intro",
  "outro",
  "main-content",
  "segment",
  "advertisement",
]);

/**
 * Segment data for Hugo frontmatter.
 */
export interface SegmentData {
  type: string;
  label: string;
  startSeconds: number;
}

/**
 * Result of formatting segments for Hugo frontmatter.
 */
export interface FormattedSegments {
  segments: string[]; // Unique segment names for taxonomy
  segmentData: SegmentData[]; // All instances with timestamps
}

/**
 * Segment data as stored in ProcessedVideo (type is string from Zod).
 */
export interface StoredSegment {
  type: string;
  startTimestamp: string;
  endTimestamp?: string | null;
  confidence: "auto" | "verified";
  detectionMethod: string;
}
