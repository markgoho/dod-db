import { MAX_DURATION_SECONDS } from "./collapse-transcript-constants.js";

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
