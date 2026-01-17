/**
 * Types and constants for correction tracking.
 */

import * as path from "node:path";

export interface CorrectionCandidate {
  original: string;
  corrected: string;
  category: "capitalization" | "spelling" | "proper-noun" | "biblical-term";
  totalOccurrences: number;
  episodeCount: number;
  episodes: string[]; // Episode IDs where this correction appeared
  examples: string[]; // Raw text example contexts (up to 3)
  correctedExamples?: string[]; // Corrected text examples (parallel to examples)
  timestamps?: string[]; // Timestamps for examples (e.g., ["00:28:53", "00:45:37"])
  episodeIds?: string[]; // Episode ID for each timestamp (parallel array to timestamps)
  confidence: number; // 0-100 score
  firstSeen: string; // ISO date
  lastSeen: string; // ISO date
  status: "pending" | "approved" | "rejected"; // Review status
  reviewedAt?: string; // ISO date when reviewed
  reviewedBy?: string; // Who reviewed it (optional)
}

export interface CorrectionTracker {
  candidates: Record<string, CorrectionCandidate>; // key: "original→corrected"
  lastUpdated: string;
}

export const TRACKER_PATH = path.join(
  process.cwd(),
  "data",
  "correction-candidates.json",
);
