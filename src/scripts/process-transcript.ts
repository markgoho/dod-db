/**
 * CLI script to process a transcript from a Google Drive audio file.
 *
 * Usage:
 *   bun run src/scripts/process-transcript.ts
 */

import { processTranscript } from '../pipeline/index.js';

const trimmedAudioId = '1vsS2VRHz5fdXz0JhGSsxysa5SCMXy6gi';
const fullAudioId = '1XjkVt17K4Oa0muqJnDZm593FXMG9TRQd';

await processTranscript({
  transcriptUrl: `https://drive.google.com/uc?export=download&id=${trimmedAudioId}`,
});
