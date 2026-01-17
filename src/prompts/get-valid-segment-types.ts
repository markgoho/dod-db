import { SEGMENT_LABELS } from "../config/segment-patterns.js";

/**
 * Get the list of valid segment type slugs for validation.
 */
export function getValidSegmentTypes(): string[] {
  return Object.keys(SEGMENT_LABELS);
}
