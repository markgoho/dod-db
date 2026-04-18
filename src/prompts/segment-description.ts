/**
 * Schemas and types for segment description generation.
 */

import type { SegmentType } from "../config/segment-patterns.js";

export interface SegmentDescriptionResult {
  topicLabel: string;
  summary: string;
  confidence: number;
  reasoning: string;
}

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
