import { AssemblyAI, type TranscribeParams } from 'assemblyai';
import { MAX_DURATION_MS } from '../utils/collapse-transcript.js';

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

/**
 * Format milliseconds into [HH:MM:SS.mmm] timestamp format
 */
function formatTimestamp(milliseconds: number): string {
  const hours = Math.floor(milliseconds / 3_600_000)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((milliseconds % 60_000) / 1000)
    .toString()
    .padStart(2, '0');
  const ms = (milliseconds % 1000).toString().padStart(3, '0');
  return `[${hours}:${minutes}:${seconds}.${ms}]`;
}

/**
 * Transcribe audio file using AssemblyAI.
 * @param audioFilePath - Path to local audio file (MP3, M4A, WAV, etc.)
 * @returns Formatted transcript with sentence-level timestamps
 */
export async function transcribeAudio(audioFilePath: string): Promise<string> {
  // Upload local audio file to AssemblyAI
  console.log('  Uploading audio to AssemblyAI...');
  const uploadedUrl = await client.files.upload(audioFilePath);
  const audioUrl = uploadedUrl;

  const parameters: TranscribeParams = {
    audio: audioUrl,
    speaker_labels: true,
  };
  const transcript = await client.transcripts.transcribe(parameters);

  if (transcript.status === 'error') {
    throw new Error(`Error transcribing audio: ${transcript.error}`);
  }

  // Try to get sentence-level timestamps first (more granular)
  try {
    console.log('  Retrieving sentence-level timestamps...');
    const sentencesResponse = await client.transcripts.sentences(transcript.id);

    if (sentencesResponse.sentences && sentencesResponse.sentences.length > 0) {
      // Group consecutive sentences by speaker to reduce line count
      // Only emit a timestamp when the speaker changes
      const groups: Array<{ timestamp: number; speaker: string; texts: string[] }> = [];
      let currentGroup: { timestamp: number; speaker: string; texts: string[] } | undefined;

      for (const sentence of sentencesResponse.sentences) {
        // Use first word's timestamp for accuracy (sentence.start can be early due to pause detection)
        const firstWord = sentence.words?.[0];
        const timestamp = firstWord?.start ?? sentence.start;
        const speakerLabel = sentence.speaker
          ? `Speaker ${sentence.speaker}`
          : 'Unknown';

        // Check if we can append to the current group
        const canAppend =
          currentGroup !== undefined &&
          currentGroup.speaker === speakerLabel &&
          timestamp - currentGroup.timestamp <= MAX_DURATION_MS;

        if (canAppend && currentGroup !== undefined) {
          // Same speaker within time limit - append text to current group
          currentGroup.texts.push(sentence.text);
        } else {
          // New speaker OR exceeded time limit - save current group and start a new one
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            timestamp,
            speaker: speakerLabel,
            texts: [sentence.text],
          };
        }
      }

      // Don't forget the last group
      if (currentGroup) {
        groups.push(currentGroup);
      }

      // Format groups into transcript lines
      const transcriptLines = groups.map((group) => {
        const formattedTime = formatTimestamp(group.timestamp);
        const text = group.texts.join(' ');
        return `${formattedTime} ${group.speaker}: ${text}`;
      });

      return transcriptLines.join('\n');
    }
  } catch {
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
