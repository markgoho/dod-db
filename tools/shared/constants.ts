/**
 * Shared constants for DoD Tools
 */

import type { TagCategory } from "../../src/config/tag-vocabulary.js";

// API base URL (tools-server.ts runs on port 3001)
export const API_BASE_URL = "http://localhost:3001";

// Category labels mapping (used across tools)
export const CATEGORY_LABELS: Record<TagCategory, string> = {
  character: "Character",
  person: "Person",
  place: "Place",
  people: "People",
  literature: "Literature",
  theology: "Theology",
  scholarship: "Scholarship",
  religion: "Religion",
  event: "Event",
  miscellaneous: "Miscellaneous",
};
