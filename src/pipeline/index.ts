import { z } from 'genkit';
import { ai } from '../genkit.js';
import { indexTranscript } from '../storage/firestore.js';
import { writeToFile } from '../storage/file.js';
import { correctTranscript } from './correct.js';
import { identifySpeakers } from './identify-speakers.js';
import { transcribeAudio } from './transcribe.js';

export const processTranscript = ai.defineFlow(
  {
    name: 'processTranscript',
    inputSchema: z.object({ transcriptUrl: z.string() }),
    outputSchema: z.void(),
  },
  async ({ transcriptUrl }) => {
    console.log('Transcribing Audio');
    const transcription = await ai.run('transcribeAudio', async () => {
      return await transcribeAudio(transcriptUrl);
    });

    console.log('Correcting Transcript');
    const correctedTranscript = await ai.run('correctTranscript', async () => {
      return await correctTranscript(transcription);
    });

    console.log('Identifying Speakers');
    const { transcript: transcriptWithNames } = await ai.run(
      'identifySpeakers',
      async () => {
        return await identifySpeakers(correctedTranscript);
      },
    );

    await ai.run('writeFile', async () => {
      await writeToFile('corrected_transcript.txt', transcriptWithNames);
    });

    console.log('Indexing Transcript in Firestore');
    await ai.run('indexTranscript', async () => {
      await indexTranscript(transcriptWithNames);
    });

    return;
  },
);

export { transcribeAudio } from './transcribe.js';
export { correctTranscript } from './correct.js';
export { identifySpeakers } from './identify-speakers.js';
