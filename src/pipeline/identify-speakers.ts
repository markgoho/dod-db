import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";
import { addSpeakerLabels } from "../prompts/add-speaker-labels.js";
import { speakerLabelPrompt } from "../prompts/speaker-label-prompt.js";
import {
  SpeakerLabelsSchema,
  type SpeakerLabels,
} from "../prompts/speaker-labels.js";
import { checkHostMapping } from "./check-host-mapping.js";

export async function identifySpeakers(
  transcript: string,
  metadata?: { title?: string; description?: string },
): Promise<{
  transcript: string;
  speakers: SpeakerLabels;
  /** Swaps and suspicions from the host-mapping guard, for the run output. */
  speakerIdFlags: string[];
}> {
  const response = await ai.models.generateContent({
    model: speakerIdModel,
    contents: speakerLabelPrompt(transcript, metadata),
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(SpeakerLabelsSchema),
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("Speaker identification response was null or empty");
  }

  const output = SpeakerLabelsSchema.parse(JSON.parse(responseText));
  const { speakers, flags } = checkHostMapping(transcript, output);
  for (const flag of flags) {
    console.warn(`⚠️ Speaker ID: ${flag}`);
  }

  return {
    transcript: addSpeakerLabels(speakers, transcript),
    speakers,
    speakerIdFlags: flags,
  };
}
