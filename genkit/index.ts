import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { correctionPrompt } from '../prompts/correction-prompt.js';
import { speakerLabelPrompt } from '../prompts/speaker-label-prompts.js';
import {
  addSpeakerLabels,
  SpeakerLabelsSchema,
} from '../tools/functions/add-speaker-labels.js';
import { transcribe } from '../tools/functions/transcribe-audio.js';
import { writeToFile } from '../tools/functions/write-to-file.js';
import './basic-rag.js';
import { ai } from './genkit.js';

export const processTranscript = ai.defineFlow(
  {
    name: 'processTranscript',
    inputSchema: z.object({ transcriptUrl: z.string() }),
    outputSchema: z.void(),
  },
  async ({ transcriptUrl }) => {
    const transcription = await ai.run('transcribeAudio', async () => {
      const transcription = await transcribe(transcriptUrl);
      return transcription;
    });

    const { text: correctedTranscript } = await ai.generate({
      prompt: correctionPrompt(transcription),
    });

    if (correctedTranscript === null) {
      throw new Error('Response was null or empty');
    }

    const { output } = await ai.generate({
      prompt: speakerLabelPrompt(correctedTranscript),
      model: googleAI.model('gemini-2.0-flash-lite'),
      output: {
        schema: SpeakerLabelsSchema,
      },
    });

    if (output === null) {
      throw new Error('Response was null or empty');
    }

    const transcriptWithNames = addSpeakerLabels(output, correctedTranscript);

    await ai.run('writeFile', async () => {
      await writeToFile('corrected_transcript.txt', transcriptWithNames);
    });

    return;
  },
);

// await processTranscript({
//   transcriptUrl:
//     'https://drive.google.com/uc?export=download&id=1vsS2VRHz5fdXz0JhGSsxysa5SCMXy6gi',
// });
