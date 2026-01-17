import type { SpeakerLabels } from "./speaker-labels.js";

export function addSpeakerLabels(
  speakerLabels: SpeakerLabels,
  transcript: string,
): string {
  let result = transcript;

  // Replace all identified speakers dynamically
  for (const [speakerLabel, speakerName] of Object.entries(speakerLabels)) {
    if (speakerName) {
      result = result.replaceAll(new RegExp(speakerLabel, "g"), speakerName);
    }
  }

  return result;
}
