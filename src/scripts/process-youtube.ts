/**
 * CLI script to process a YouTube video.
 *
 * Usage:
 *   bun run src/scripts/process-youtube.ts <youtube-url> [--force]
 *   bun run src/scripts/process-youtube.ts https://www.youtube.com/watch?v=833s6y6kW2k
 *   bun run src/scripts/process-youtube.ts 833s6y6kW2k --force
 */

import { processYouTubeVideo } from '../pipeline/youtube-processor.js';

const args = process.argv.slice(2);
const videoUrl = args[0];
const force = args.includes('--force');

if (!videoUrl) {
  console.error('Error: YouTube URL or video ID is required');
  console.error('');
  console.error('Usage:');
  console.error(
    '  bun run src/scripts/process-youtube.ts <youtube-url> [--force]',
  );
  console.error('');
  console.error('Options:');
  console.error('  --force    Reprocess video even if already processed');
  console.error('');
  console.error('Examples:');
  console.error(
    '  bun run src/scripts/process-youtube.ts https://www.youtube.com/watch?v=833s6y6kW2k',
  );
  console.error('  bun run src/scripts/process-youtube.ts 833s6y6kW2k --force');
  process.exit(1);
}

try {
  const result = await processYouTubeVideo(videoUrl, { force });

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
