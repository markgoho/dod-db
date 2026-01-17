import type {
  CorrectionCandidate,
  CorrectionTracker,
} from "./correction-tracker.js";

/**
 * Get pending candidates (not yet reviewed).
 */
export function getPendingCandidates(
  tracker: CorrectionTracker,
): CorrectionCandidate[] {
  return Object.values(tracker.candidates)
    .filter(c => c.status === "pending")
    .sort((a, b) => b.confidence - a.confidence);
}
