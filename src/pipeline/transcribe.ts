import { AssemblyAI, type TranscribeParams } from 'assemblyai';
import {
  downloadYouTubeAudio,
  isYouTubeUrl,
} from '../utils/youtube.js';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

/**
 * Format milliseconds into [HH:MM:SS.mmm] timestamp format
 */
function formatTimestamp(milliseconds: number): string {
  const hours = Math.floor(milliseconds / 3600000)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((milliseconds % 3600000) / 60000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((milliseconds % 60000) / 1000)
    .toString()
    .padStart(2, '0');
  const ms = (milliseconds % 1000).toString().padStart(3, '0');
  return `[${hours}:${minutes}:${seconds}.${ms}]`;
}

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

  // Try to get sentence-level timestamps first (more granular)
  try {
    console.log('  Retrieving sentence-level timestamps...');
    const sentencesResponse = await client.transcripts.sentences(transcript.id);

    if (sentencesResponse.sentences && sentencesResponse.sentences.length > 0) {
      const transcriptLines: string[] = [];

      for (const sentence of sentencesResponse.sentences) {
        // Use first word's timestamp for accuracy (sentence.start can be early due to pause detection)
        const firstWord = sentence.words?.[0];
        const timestamp = firstWord?.start ?? sentence.start;
        const formattedTime = formatTimestamp(timestamp);
        const speakerLabel = sentence.speaker
          ? `Speaker ${sentence.speaker}`
          : 'Unknown';
        const line = `${formattedTime} ${speakerLabel}: ${sentence.text}`;
        transcriptLines.push(line);
      }

      return transcriptLines.join('\n');
    }
  } catch (error) {
    console.warn(
      '  Warning: Could not retrieve sentence-level timestamps, falling back to utterances',
    );
  }

  // Fallback to utterances (speaker turns) if sentences unavailable
  if (transcript.utterances && transcript.utterances.length > 0) {
    const transcriptLines: string[] = [];
    for (const utterance of transcript.utterances) {
      const formattedTime = formatTimestamp(utterance.start);
      const line = `${formattedTime} Speaker ${utterance.speaker}: ${utterance.text}`;
      transcriptLines.push(line);
    }
    return transcriptLines.join('\n');
  }

  // Final fallback to raw text
  if (!transcript.text) {
    throw new Error('No text was transcribed');
  }

  return transcript.text;
}
