/**
 * Schemas and types for segment identification.
 */

import { z } from "zod";
import type { SegmentType } from "../config/segment-patterns.js";

/**
 * Schema for a single segment identification result.
 */
const SegmentIdentificationResultSchema = z.object({
  index: z.number().describe("The index of the segment being identified"),
  segmentType: z.string().describe("The identified segment type slug"),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence percentage (0-100)"),
  reasoning: z
    .string()
    .describe("Brief explanation of why this type was chosen"),
});

/**
 * Schema for the full LLM response.
 */
export const SegmentIdentificationSchema = z.object({
  identifications: z.array(SegmentIdentificationResultSchema),
});

export type SegmentIdentificationResult = z.infer<
  typeof SegmentIdentificationSchema
>;

/**
 * Context for a segment that needs identification.
 */
export interface SegmentContext {
  index: number;
  timestamp: string;
  contextText: string;
}

/**
 * Segment types that are excluded from LLM identification.
 * These are either structural (intro/outro) or placeholders.
 */
type ExcludedSegmentTypes =
  | "segment"
  | "intro"
  | "outro"
  | "main-content"
  | "advertisement";

/**
 * Segment types that can be identified by the LLM.
 */
export type IdentifiableSegmentType = Exclude<
  SegmentType,
  ExcludedSegmentTypes
>;
