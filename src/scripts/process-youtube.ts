/**
 * CLI script to process a YouTube video.
 *
 * Usage:
 *   bun run src/scripts/process-youtube.ts <youtube-url> [options]
 *   bun run src/scripts/process-youtube.ts https://www.youtube.com/watch?v=833s6y6kW2k
 *   bun run src/scripts/process-youtube.ts 833s6y6kW2k --force
 *   bun run src/scripts/process-youtube.ts 833s6y6kW2k --start-from=correct
 */

import { processYouTubeVideo } from '../pipeline/youtube-processor.js';

const args = process.argv.slice(2);
const videoUrl = args[0];
const force = args.includes('--force');

// Parse --start-from flag
const startFromIndex = args.findIndex((arg) =>
  arg.startsWith('--start-from'),
);
let startFrom: 'correct' | undefined = undefined;
if (startFromIndex !== -1) {
  const value = args[startFromIndex]?.includes('=')
    ? args[startFromIndex]?.split('=')[1]
    : args[startFromIndex + 1];
  if (value !== 'correct') {
    console.error('Error: --start-from only supports "correct" stage');
    console.error('');
    process.exit(1);
  }
  startFrom = 'correct';
}

if (!videoUrl) {
  console.error('Error: YouTube URL or video ID is required');
  console.error('');
  console.error('Usage:');
  console.error(
    '  bun run src/scripts/process-youtube.ts <youtube-url> [options]',
  );
  console.error('');
  console.error('Options:');
  console.error('  --force              Reprocess video even if already processed');
  console.error(
    '  --start-from=STAGE   Resume from a specific stage (saves API costs)',
  );
  console.error('                       Supported stages: correct');
  console.error('');
  console.error('Examples:');
  console.error(
    '  bun run src/scripts/process-youtube.ts https://www.youtube.com/watch?v=833s6y6kW2k',
  );
  console.error('  bun run src/scripts/process-youtube.ts 833s6y6kW2k --force');
  console.error(
    '  bun run src/scripts/process-youtube.ts 833s6y6kW2k --start-from=correct',
  );
  process.exit(1);
}

try {
  const result = await processYouTubeVideo(videoUrl, { force, startFrom });

  if (result.skipped) {
    console.log('');
    console.log('⊘ Video already processed (use --force to reprocess)');
    process.exit(0);
  }

  console.log('');
  console.log('✓ Successfully processed video');
  console.log(`  Video ID: ${result.videoId}`);
  console.log(`  Title: ${result.metadata.title}`);
  console.log(`  Transcript: ${result.transcriptPath}`);
} catch (error) {
  console.error('');
  console.error('✗ Error processing video:');
  console.error(error);
  process.exit(1);
}
