import { AssemblyAI, type TranscribeParams } from 'assemblyai';
import { tool } from 'langchain';
import { z } from 'zod';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export const transcribeAudio = tool(
  async (input) => {
    const { url } = input as { url: string };
    try {
      const params: TranscribeParams = {
        audio: url,
        speaker_labels: true,
        audio_start_from: 0,
        audio_end_at: 3 * 60 * 1000, // 1 minutes
      };
      const transcript = await client.transcripts.transcribe(params);

      if (transcript.status === 'error') {
        return `Error transcribing audio: ${transcript.error}`;
      }

      if (transcript.utterances && transcript.utterances.length > 0) {
        const transcriptLines: string[] = [];
        for (const utterance of transcript.utterances) {
          const startTime = utterance.start;
          const hours = Math.floor(startTime / 3600000)
            .toString()
            .padStart(2, '0');
          const minutes = Math.floor((startTime % 3600000) / 60000)
            .toString()
            .padStart(2, '0');
          const seconds = Math.floor((startTime % 60000) / 1000)
            .toString()
            .padStart(2, '0');
          const formattedTime = `[${hours}:${minutes}:${seconds}]`;

          const line = `${formattedTime} Speaker ${utterance.speaker}: ${utterance.text}`;
          transcriptLines.push(line);
        }
        return transcriptLines.join('\n');
      }

      return transcript.text ?? 'No text was transcribed.';
    } catch (error) {
      return `An unexpected error occurred during transcription: ${
        error instanceof Error ? error.message : String(error)
      }`;
    }
  },
  {
    name: 'transcribeAudio',
    description: 'Transcribe an audio file from a URL.',
    schema: z.object({
      url: z.url().describe('The URL of the audio file to transcribe.'),
    }),
  },
);
