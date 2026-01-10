export function correctionPrompt(transcript: string) {
  return `You are an expert in Bible scholarship. Please review the following podcast transcript and correct any domain-specific terms, names, places, or theological concepts that may have been transcribed incorrectly. When you make a correction, please wrap the corrected word or phrase in double asterisks (**).

IMPORTANT: Preserve the exact formatting of the transcript, including all line breaks. Each timestamped utterance should remain on its own line.

Only return the fully corrected transcript. Do not add any commentary or explanation before or after the transcript.

Transcript to correct:
---
${transcript}
---`;
}
