import { speakerIdModel } from '../config/models.js';
import { ai } from '../genkit.js';
import {
  addSpeakerLabels,
  SpeakerLabelsSchema,
  speakerLabelPrompt,
} from '../prompts/speaker-labels.js';

export async function identifySpeakers(
  transcript: string,
): Promise<{ transcript: string; speakers: Record<string, string> }> {
  const { output } = await ai.generate({
    prompt: speakerLabelPrompt(transcript),
    model: speakerIdModel,
    output: {
      schema: SpeakerLabelsSchema,
    },
  });

  if (output === null) {
    throw new Error('Speaker identification response was null or empty');
  }

  const transcriptWithNames = addSpeakerLabels(output, transcript);

  return {
    transcript: transcriptWithNames,
    speakers: output,
  };
}
