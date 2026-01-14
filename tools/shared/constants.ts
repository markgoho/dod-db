/**
 * Shared constants for DoD Tools
 */

// API base URL (tools-server.ts runs on port 3001)
export const API_BASE_URL = 'http://localhost:3001';

// Category labels mapping (used across tools)
export const CATEGORY_LABELS: Record<string, string> = {
  character: 'Character',
  person: 'People',
  place: 'Place',
  people: 'People Groups',
  literature: 'Literature',
  theology: 'Theology',
  scholarship: 'Scholarship',
  religion: 'Religion',
};
