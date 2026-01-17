import { z } from "zod";
import type { SegmentType } from "../config/segment-patterns.js";
import {
  DETECTION_METHODS,
  type DetectionMethod,
} from "../pipeline/detect-segments.js";

/**
 * Tag on an episode with mention count.
 * Distinct from TagDefinition in tag-vocabulary.ts.
 */
export interface EpisodeTag {
  tag: string; // Canonical tag name: "Moses", "Septuagint"
  mentions: number; // Count of mentions in this episode
}

/**
 * Zod schema for EpisodeTag validation.
 */
export const EpisodeTagSchema = z.object({
  tag: z.string(),
  mentions: z.number().int().positive(),
});

/**
 * Scripture reference for an episode with mention count.
 */
export interface EpisodeScripture {
  book: string; // Canonical book name: "Genesis", "1 Samuel"
  references: string[]; // Unique normalized references: ["Genesis 1:1", "Genesis 2:4"]
  mentions: number; // Total mention count across all references
}

/**
 * Zod schema for EpisodeScripture validation.
 */
export const EpisodeScriptureSchema = z.object({
  book: z.string(),
  references: z.array(z.string()),
  mentions: z.number().int().positive(),
});

/**
 * A detected segment in an episode.
 */
export interface EpisodeSegment {
  type: SegmentType;
  startTimestamp: string; // "[HH:MM:SS.mmm]" format
  endTimestamp?: string | null; // undefined/null if segment extends to end
  confidence: "auto" | "verified";
  detectionMethod: DetectionMethod;
}

/**
 * Zod schema for EpisodeSegment validation.
 */
export const EpisodeSegmentSchema = z.object({
  type: z.string(),
  startTimestamp: z.string(),
  endTimestamp: z.string().nullish(), // Allow null or undefined - data may have explicit null values
  confidence: z.enum(["auto", "verified"]),
  detectionMethod: z.enum(DETECTION_METHODS),
});

/**
 * Zod schema for VideoChapter validation.
 */
export const VideoChapterSchema = z.object({
  title: z.string(),
  startTime: z.number(),
});

export const ProcessedVideoSchema = z.object({
  videoId: z.string().describe("YouTube video ID"),
  title: z.string().describe("Video title"),
  publishedAt: z.string().describe("ISO 8601 publication date"),
  processedAt: z.string().describe("ISO 8601 processing timestamp"),
  transcriptPath: z.string().describe("Path to the transcript file"),
  episodeNumber: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Sequential episode number based on publishedAt"),
  tags: z
    .array(EpisodeTagSchema)
    .optional()
    .describe("Extracted tags with mention counts"),
  segments: z
    .array(EpisodeSegmentSchema)
    .optional()
    .describe("Detected audio segments"),
  speakers: z
    .array(z.string())
    .optional()
    .describe(
      'Array of speaker names in order of appearance (e.g., ["Dan McClellan", "Dan Beecher"])',
    ),
  chapters: z
    .array(VideoChapterSchema)
    .optional()
    .describe("YouTube chapters defined by the video uploader"),
  scriptures: z
    .array(EpisodeScriptureSchema)
    .optional()
    .describe("Detected scripture references with mention counts"),
});

export type ProcessedVideo = z.infer<typeof ProcessedVideoSchema>;
