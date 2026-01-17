/**
 * Types and constants for segment detection.
 */

import type { SegmentType } from "../config/segment-patterns.js";

/**
 * Available detection methods.
 * Single source of truth for segment detection methods.
 */
export const DETECTION_METHODS = ["pattern", "llm", "manual", "audio"] as const;

/**
 * How a segment was detected.
 */
export type DetectionMethod = (typeof DETECTION_METHODS)[number];

/**
 * A detected segment in an episode.
 */
export interface Segment {
  type: SegmentType;
  startTimestamp: string; // "[HH:MM:SS.mmm]" format
  endTimestamp?: string; // undefined if segment extends to end of episode
  confidence: "auto" | "verified";
  detectionMethod: DetectionMethod;
  matchedPattern?: string; // The pattern that triggered detection (for debugging)
}

/**
 * A line from the transcript with parsed timestamp.
 */
export interface TranscriptLine {
  timestamp: string; // Original format: "[HH:MM:SS.mmm]"
  speaker: string;
  text: string;
  lineNumber: number;
}
