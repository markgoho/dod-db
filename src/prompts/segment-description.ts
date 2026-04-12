/**
 * Schemas and types for segment description generation.
 */

import { z } from "zod";
import type { SegmentType } from "../config/segment-patterns.js";

const SegmentDescriptionResultSchema = z.object({
  topicLabel: z
    .string()
    .describe("A 1-2 word topic label for this specific segment instance"),
  summary: z
    .string()
    .describe("A 5-10 word summary of what this segment discusses"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence percentage (0-100)"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this description fits"),
});

export const SegmentDescriptionSchema = z.object({
  description: SegmentDescriptionResultSchema,
});

export type SegmentDescriptionResult = z.infer<
  typeof SegmentDescriptionResultSchema
>;

export interface SegmentDescriptionContext {
  episodeTitle: string;
  segmentType: SegmentType;
  segmentLabel: string;
  segmentDescription: string;
  timestamp: string;
  contextText: string;
  scriptureCandidates: string[];
  primaryScriptureCandidate?: string;
}
