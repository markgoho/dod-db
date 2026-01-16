/**
 * Shared utilities for collapsing consecutive speaker lines in transcripts.
 * Used by both the collapse-speaker-lines script and the transcribe pipeline.
 */

// Maximum duration (in seconds) for a single collapsed line
// After 60 seconds, start a new line even if same speaker (for auto-scroll)
export const MAX_DURATION_SECONDS = 60;

// Maximum duration in milliseconds (for AssemblyAI timestamps)
export const MAX_DURATION_MS = MAX_DURATION_SECONDS * 1000;

/**
 * Parse timestamp string "HH:MM:SS.mmm" or "HH:MM:SS" into total seconds
 */
export function parseTimestampToSeconds(timestamp: string): number {
	const match = /^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/.exec(timestamp);
	if (!match) return 0;

	const hours = Number.parseInt(match[1] ?? '0', 10);
	const minutes = Number.parseInt(match[2] ?? '0', 10);
	const seconds = Number.parseInt(match[3] ?? '0', 10);
	const milliseconds = Number.parseInt(match[4] ?? '0', 10);

	return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

/**
 * Check if a new timestamp can be appended to the current group
 * based on speaker and time constraints.
 *
 * @param currentSpeaker - Speaker of current group
 * @param currentTimestampSeconds - Start timestamp of current group (in seconds)
 * @param newSpeaker - Speaker of new line
 * @param newTimestampSeconds - Timestamp of new line (in seconds)
 * @returns true if can append, false if should start new group
 */
export function canAppendToGroup({
	currentSpeaker,
	currentTimestampSeconds,
	newSpeaker,
	newTimestampSeconds,
}: {
	currentSpeaker: string;
	currentTimestampSeconds: number;
	newSpeaker: string;
	newTimestampSeconds: number;
}): boolean {
	return (
		currentSpeaker === newSpeaker &&
		newTimestampSeconds - currentTimestampSeconds <= MAX_DURATION_SECONDS
	);
}
