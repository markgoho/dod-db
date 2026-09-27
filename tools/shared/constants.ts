/**
 * Shared constants for DoD Tools
 */

import type { TagCategory } from "../../src/config/tag-vocabulary.js";

// API base URL (tools-server.ts runs on port 3001 on the same host as the UI,
// so the tools also work from other devices on the network)
export const API_BASE_URL = `http://${location.hostname}:3001`;

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
