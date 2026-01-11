import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { writeToFile } from '../storage/file.js';
import { correctTranscript } from './correct.js';
import { identifySpeakers } from './identify-speakers.js';
import { transcribeAudio } from './transcribe.js';

const execAsync = promisify(exec);

/**
 * Commit a pipeline stage to git with descriptive message.
 * Silently continues if git is not available or commit fails.
 *
 * @param stageName - Name of the pipeline stage (e.g., 'transcription')
 * @param filePath - Path to the file to commit
 */
async function commitStage(
  stageName: string,
  filePath: string,
): Promise<void> {
  try {
    await execAsync(`git add "${filePath}"`);
    await execAsync(
      `git commit -m "Transcript ${stageName} complete" --author="Pipeline <pipeline@dod-db>"`,
    );
    console.log(`✓ Committed ${stageName}`);
  } catch {
    console.warn(`Could not commit ${stageName} (git may not be available)`);
  }
}

/**
 * Process a transcript from an audio URL.
 * Transcribes, corrects, and identifies speakers.
 * Commits each stage to git for version tracking.
 */
export async function processTranscript({
  transcriptUrl,
  metadata,
}: {
  transcriptUrl: string;
  metadata?: { title?: string; description?: string };
}): Promise<void> {
  console.log('Transcribing Audio');
  const transcription = await transcribeAudio(transcriptUrl);

  console.log('Correcting Transcript');
  const correctedTranscript = await correctTranscript(transcription);

  console.log('Identifying Speakers');
  const { transcript: transcriptWithNames } =
    await identifySpeakers(correctedTranscript, metadata);

  console.log('Writing to file');
  await writeToFile('corrected_transcript.txt', transcriptWithNames);

  console.log('Done!');
}

export { transcribeAudio } from './transcribe.js';
export { correctTranscript } from './correct.js';
export { identifySpeakers } from './identify-speakers.js';
