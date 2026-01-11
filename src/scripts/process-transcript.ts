/**
 * CLI script to process a transcript from audio (YouTube, Google Drive, or direct URL).
 *
 * Usage:
 *   bun run src/scripts/process-transcript.ts <url> [title]
 *
 * Examples:
 *   bun run src/scripts/process-transcript.ts "https://www.youtube.com/watch?v=VIDEO_ID" "Episode 2 (April 17, 2023)"
 *   bun run src/scripts/process-transcript.ts "https://drive.google.com/uc?export=download&id=FILE_ID"
 */

import { processTranscript } from '../pipeline/index.js';

const [, , url, title] = process.argv;

if (!url) {
  console.error('Error: URL is required\n');
  console.log('Usage: bun run src/scripts/process-transcript.ts <url> [title]\n');
  console.log('Examples:');
  console.log('  bun run src/scripts/process-transcript.ts "https://www.youtube.com/watch?v=VIDEO_ID" "Episode 2 (April 17, 2023)"');
  console.log('  bun run src/scripts/process-transcript.ts "https://drive.google.com/uc?export=download&id=FILE_ID"');
  process.exit(1);
}

const metadata = title ? { title } : undefined;

await processTranscript({
  transcriptUrl: url,
  metadata,
});
