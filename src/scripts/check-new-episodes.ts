/**
 * Check for new episodes on YouTube channel using yt-dlp and process them.
 * Used by GitHub Actions cron workflow.
 *
 * Usage:
 *   bun run src/scripts/check-new-episodes.ts
 */

import { isVideoProcessed } from '../storage/processed-videos.js';
import { processYouTubeVideo } from '../pipeline/youtube-processor.js';

// Data over Dogma channel URL
const CHANNEL_URL = 'https://www.youtube.com/@DataOverDogma/videos';

async function fetchLatestVideos(maxResults: number = 10): Promise<string[]> {
  console.log(`Fetching ${maxResults} most recent videos from channel...`);

  // Use yt-dlp to fetch video IDs from the channel
  // --flat-playlist: Don't download, just extract info
  // --playlist-end: Limit number of videos
  // --dump-json: Output as JSON
  const proc = Bun.spawn([
    'yt-dlp',
    CHANNEL_URL,
    '--flat-playlist',
    '--playlist-end',
    maxResults.toString(),
    '--dump-json',
    '--skip-download',
  ]);

  const output = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`yt-dlp failed to fetch channel videos: exit code ${exitCode}`);
  }

  // Parse newline-delimited JSON
  const lines = output.trim().split('\n');
  const videoIds: string[] = [];

  for (const line of lines) {
    try {
      const data = JSON.parse(line);
      if (data.id) {
        videoIds.push(data.id);
      }
    } catch {
      // Skip invalid JSON lines
    }
  }

  return videoIds;
}

async function main() {
  console.log('Checking for new episodes...');

  const videoIds = await fetchLatestVideos();
  console.log(`Found ${videoIds.length} recent videos`);

  let processedCount = 0;
  let skippedCount = 0;
  const errors: Array<{ videoId: string; error: string }> = [];

  for (const videoId of videoIds) {
    const alreadyProcessed = await isVideoProcessed(videoId);

    if (alreadyProcessed) {
      console.log(`⊘ Skipping ${videoId} (already processed)`);
      skippedCount++;
      continue;
    }

    try {
      console.log(`⟳ Processing ${videoId}...`);
      const result = await processYouTubeVideo(
        `https://www.youtube.com/watch?v=${videoId}`,
      );

      if (!result.skipped) {
        console.log(`✓ Processed: ${result.metadata.title}`);
        processedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${videoId}:`, error);
      errors.push({
        videoId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  console.log('');
  console.log('--- Summary ---');
  console.log(`Processed: ${processedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.error('');
    console.error('Errors encountered:');
    for (const { videoId, error } of errors) {
      console.error(`  ${videoId}: ${error}`);
    }
    process.exit(1);
  }
}

await main();
