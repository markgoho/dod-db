import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { correctionPrompt } from '../prompts/correction-prompt.js';
import { speakerLabelPrompt } from '../prompts/speaker-label-prompts.js';
import {
  addSpeakerLabels,
  SpeakerLabelsSchema,
} from '../tools/functions/add-speaker-labels.js';
import { indexTranscript } from '../tools/functions/index-transcript.js';
import { transcribe } from '../tools/functions/transcribe-audio.js';
import { writeToFile } from '../tools/functions/write-to-file.js';
import { ai } from './genkit.js';

export const processTranscript = ai.defineFlow(
  {
    name: 'processTranscript',
    inputSchema: z.object({ transcriptUrl: z.string() }),
    outputSchema: z.void(),
  },
  async ({ transcriptUrl }) => {
    console.log('Transcribing Audio');
    const transcription = await ai.run('transcribeAudio', async () => {
      const transcription = await transcribe(transcriptUrl);
      return transcription;
    });

    await ai.run('writeFile', async () => {
      await writeToFile('raw_transcript.txt', transcription);
    });

    console.log('Correcting Transcript');
    const { text: correctedTranscript } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: correctionPrompt(transcription),
    });

    if (correctedTranscript === null) {
      throw new Error('Response was null or empty');
    }

    await ai.run('writeFile', async () => {
      await writeToFile('corrected_transcript.txt', correctedTranscript);
    });

    console.log('Identifying Speakers');
    const { output } = await ai.generate({
      prompt: speakerLabelPrompt(correctedTranscript),
      model: googleAI.model('gemini-1.5-flash'),
      output: {
        schema: SpeakerLabelsSchema,
      },
    });

    if (output === null) {
      throw new Error('Response was null or empty');
    }

    console.log('Replacing labels with names');
    const transcriptWithNames = addSpeakerLabels(output, correctedTranscript);

    await ai.run('writeFile', async () => {
      await writeToFile('corrected_transcript.txt', transcriptWithNames);
    });

    console.log('Indexing Transcript');
    await ai.run('indexTranscript', async () => {
      await indexTranscript(transcriptWithNames);
    });

    return;
  },
);

const trimmedAudioId = '1vsS2VRHz5fdXz0JhGSsxysa5SCMXy6gi';
const fullAudioId = '1XjkVt17K4Oa0muqJnDZm593FXMG9TRQd';

await processTranscript({
  transcriptUrl: `https://drive.google.com/uc?export=download&id=${fullAudioId}`,
});
