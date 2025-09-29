import { z } from 'genkit';

export const SpeakerLabelsSchema = z.object({
  'Speaker A': z.string(),
  'Speaker B': z.string(),
  'Speaker C': z.string().optional(),
});

type SpeakerLabels = z.infer<typeof SpeakerLabelsSchema>;

export function addSpeakerLabels(
  speakerLabels: SpeakerLabels,
  transcript: string,
) {
  return transcript
    .replace(/Speaker A/g, speakerLabels['Speaker A'])
    .replace(/Speaker B/g, speakerLabels['Speaker B']);
}
