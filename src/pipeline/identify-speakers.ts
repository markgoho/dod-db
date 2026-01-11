import { z } from 'zod';
import { speakerIdModel } from '../config/models.js';
import { ai } from '../ai.js';
import {
  addSpeakerLabels,
  SpeakerLabelsSchema,
  speakerLabelPrompt,
  type SpeakerLabels,
} from '../prompts/speaker-labels.js';

export async function identifySpeakers(
  transcript: string,
  metadata?: { title?: string; description?: string },
): Promise<{ transcript: string; speakers: Record<string, string> }> {
  const response = await ai.models.generateContent({
    model: speakerIdModel,
    contents: speakerLabelPrompt(transcript, metadata),
    config: {
      responseMimeType: 'application/json',
      responseSchema: z.toJSONSchema(SpeakerLabelsSchema),
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Speaker identification response was null or empty');
  }

  const output = SpeakerLabelsSchema.parse(
    JSON.parse(responseText),
  ) as SpeakerLabels;
  const transcriptWithNames = addSpeakerLabels(output, transcript);

  return {
    transcript: transcriptWithNames,
    speakers: output,
  };
}
