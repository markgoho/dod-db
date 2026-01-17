/**
 * Shared constants for collapsing consecutive speaker lines in transcripts.
 */

// Maximum duration (in seconds) for a single collapsed line
// After 60 seconds, start a new line even if same speaker (for auto-scroll)
export const MAX_DURATION_SECONDS = 60;

// Maximum duration in milliseconds (for AssemblyAI timestamps)
export const MAX_DURATION_MS = MAX_DURATION_SECONDS * 1000;
