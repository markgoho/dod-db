import { AssemblyAI, type TranscribeParams } from 'assemblyai';
import {
  downloadYouTubeAudio,
  isYouTubeUrl,
} from '../utils/youtube.js';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function transcribeAudio(url: string): Promise<string> {
  // If YouTube URL, download audio first
  let audioUrl = url;
  if (isYouTubeUrl(url)) {
    const audioPath = await downloadYouTubeAudio(url);
    // Upload the local file to AssemblyAI
    console.log('  Uploading audio to AssemblyAI...');
    const uploadedUrl = await client.files.upload(audioPath);
    audioUrl = uploadedUrl;
  }

  const params: TranscribeParams = {
    audio: audioUrl,
    speaker_labels: true,
  };
  const transcript = await client.transcripts.transcribe(params);

  if (transcript.status === 'error') {
    throw new Error(`Error transcribing audio: ${transcript.error}`);
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

  if (!transcript.text) {
    throw new Error('No text was transcribed');
  }

  return transcript.text;
}
