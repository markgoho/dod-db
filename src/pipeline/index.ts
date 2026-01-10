import { writeToFile } from '../storage/file.js';
import { correctTranscript } from './correct.js';
import { identifySpeakers } from './identify-speakers.js';
import { transcribeAudio } from './transcribe.js';

/**
 * Process a transcript from an audio URL.
 * Transcribes, corrects, and identifies speakers.
 */
export async function processTranscript({
  transcriptUrl,
}: {
  transcriptUrl: string;
}): Promise<void> {
  console.log('Transcribing Audio');
  const transcription = await transcribeAudio(transcriptUrl);

  console.log('Correcting Transcript');
  const correctedTranscript = await correctTranscript(transcription);

  console.log('Identifying Speakers');
  const { transcript: transcriptWithNames } =
    await identifySpeakers(correctedTranscript);

  console.log('Writing to file');
  await writeToFile('corrected_transcript.txt', transcriptWithNames);

  console.log('Done!');
}

export { transcribeAudio } from './transcribe.js';
export { correctTranscript } from './correct.js';
export { identifySpeakers } from './identify-speakers.js';
