import { tool } from 'langchain';
import { z } from 'zod';
import { transcribeAudio } from '../tools/transcribe-audio';

export const transcribeAudioTool = tool(
  async (input) => {
    const { url } = input as { url: string };
    await transcribeAudio(url);
  },
  {
    name: 'transcribeAudio',
    description: 'Transcribe an audio file from a URL.',
    schema: z.object({
      url: z.url().describe('The URL of the audio file to transcribe.'),
    }),
  },
);
