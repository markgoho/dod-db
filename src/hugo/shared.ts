/**
 * Shared utilities, types, and constants for Hugo episode generation.
 */

import {
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";

export const HUGO_CONTENT_DIR = "hugo/content/episodes";

/** Regular hosts - anyone else in speakers array is a guest */
export const HOSTS = new Set(["Dan McClellan", "Dan Beecher"]);

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
  endTimestamp?: string;
  confidence: "auto" | "verified";
  detectionMethod: string;
}

/**
 * Parse a timestamp string "[HH:MM:SS.mmm]" or "[HH:MM:SS]" to total seconds.
 */
export function parseTimestampToSeconds(timestamp: string): number {
  // Remove brackets
  const clean = timestamp.replaceAll(/^\[|\]$/g, "");
  const parts = clean.split(":");
  const hours = Number.parseInt(parts[0] ?? "0", 10);
  const minutes = Number.parseInt(parts[1] ?? "0", 10);
  const secondsPart = parts[2] ?? "0";

  // Handle milliseconds
  const [seconds, milliseconds] = secondsPart.split(".");
  const totalSeconds =
    hours * 3600 +
    minutes * 60 +
    Number.parseInt(seconds ?? "0", 10) +
    (milliseconds ? Number.parseInt(milliseconds, 10) / 1000 : 0);

  return totalSeconds;
}

/**
 * Extract guest speakers (non-hosts) from the speakers array.
 * Returns guest names in the order they appear.
 */
export function getGuestSpeakers(speakers: string[] | undefined): string[] {
  if (!speakers) return [];
  return speakers.filter(speaker => !HOSTS.has(speaker));
}

/**
 * Convert a title to a URL-safe slug.
 * Examples:
 * - "The End(s) of Monotheism" -> "the-ends-of-monotheism"
 * - "God's Wife" -> "gods-wife"
 * - "Ehrmageddon!" -> "ehrmageddon"
 */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replaceAll(/[()'"!?]/g, "") // Remove punctuation
    .replaceAll(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replaceAll(/-+/g, "-") // Collapse multiple hyphens
    .replaceAll(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Parse a transcript line into its components.
 * Expected format: [HH:MM:SS.mmm] or [HH:MM:SS] Speaker Name: Text content
 */
export function parseTranscriptLine(line: string):
  | {
      timestamp: string;
      totalSeconds: number;
      speaker: string;
      text: string;
    }
  | undefined {
  const pattern =
    /^\[(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\]\s*([^:]+):\s*(.+)$/;
  const match = pattern.exec(line);

  if (!match) {
    return undefined;
  }

  const hours = match[1] ?? "00";
  const minutes = match[2] ?? "00";
  const seconds = match[3] ?? "00";
  const milliseconds = match[4] ?? "000";
  const speaker = match[5]?.trim() ?? "";
  const text = match[6]?.trim() ?? "";

  // Calculate total seconds with millisecond precision
  const totalSeconds =
    Number.parseInt(hours, 10) * 3600 +
    Number.parseInt(minutes, 10) * 60 +
    Number.parseInt(seconds, 10) +
    Number.parseInt(milliseconds, 10) / 1000;

  const timestamp = `${hours}:${minutes}:${seconds}`;

  return { timestamp, totalSeconds, speaker, text };
}

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
  const segmentData: SegmentData[] = [];
  const uniqueSegmentNames = new Set<string>();

  for (const segment of sorted) {
    const segmentType = segment.type as SegmentType;
    const label = SEGMENT_LABELS[segmentType];
    const totalInstances = typeCounts.get(segment.type) ?? 1;
    const instanceNumber = (typeInstanceCounts.get(segment.type) ?? 0) + 1;
    typeInstanceCounts.set(segment.type, instanceNumber);

    // Add index only if multiple instances exist
    const displayLabel =
      totalInstances > 1 ? `${label} (${instanceNumber})` : label;

    const startSeconds = parseTimestampToSeconds(segment.startTimestamp);

    segmentData.push({
      type: segment.type,
      label: displayLabel,
      startSeconds,
    });

    // Track unique segment names for taxonomy (without instance numbers)
    uniqueSegmentNames.add(label);
  }

  return {
    segments: [...uniqueSegmentNames],
    segmentData,
  };
}
