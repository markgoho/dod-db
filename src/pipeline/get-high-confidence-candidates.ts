import type {
  CorrectionCandidate,
  CorrectionTracker,
} from "./correction-tracker.js";

/**
 * Get high-confidence candidates (score >= threshold).
 */
export function getHighConfidenceCandidates(
  tracker: CorrectionTracker,
  threshold = 50,
): CorrectionCandidate[] {
  return Object.values(tracker.candidates)
    .filter(c => c.confidence >= threshold)
    .sort((a, b) => b.confidence - a.confidence);
}
