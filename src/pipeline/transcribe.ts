import { AssemblyAI, type TranscribeParams } from 'assemblyai';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function transcribeAudio(url: string): Promise<string> {
  try {
    const params: TranscribeParams = {
      audio: url,
      speaker_labels: true,
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
}
