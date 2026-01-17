import type { CorrectionTracker } from "./correction-tracker.js";

/**
 * Reject a candidate and mark as reviewed.
 */
export function rejectCandidate(
  tracker: CorrectionTracker,
  key: string,
  reviewedBy?: string,
): void {
  const candidate = tracker.candidates[key];
  if (candidate) {
    candidate.status = "rejected";
    candidate.reviewedAt = new Date().toISOString();
    if (reviewedBy) {
      candidate.reviewedBy = reviewedBy;
    }
  }
}
