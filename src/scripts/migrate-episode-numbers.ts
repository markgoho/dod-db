/**
 * One-time migration script to add episodeNumber field to existing videos.
 * Safe to run multiple times - only fills missing episodeNumber fields.
 *
 * Usage: bun run src/scripts/migrate-episode-numbers.ts
 */

import { listEpisodes } from "../catalog/episode-catalog.js";
import { transact } from "../catalog/episode-catalog.js";
import { computeEpisodeNumbers } from "../rss/compute-episode-numbers.js";

async function migrate() {
  console.log("Loading processed videos...");
  const videos = await listEpisodes();

  console.log(`Found ${videos.length} processed videos`);

  const missing = videos.filter(v => v.episodeNumber === undefined).length;
  console.log(`Videos without episode numbers: ${missing}`);

  if (missing === 0) {
    console.log("✅ All videos already have episode numbers");
    return;
  }

  console.log("Computing episode numbers...");
  const withNumbers = computeEpisodeNumbers(videos);

  console.log("\nEpisode number assignments:");
  for (const video of withNumbers) {
    const status = videos.find(v => v.videoId === video.videoId)?.episodeNumber
      ? "(existing)"
      : "(NEW)";
    console.log(`  Episode ${video.episodeNumber}: ${video.title} ${status}`);
  }

  console.log("\nSaving updated processed-videos.json...");
  await transact(() => withNumbers);

  console.log(`✅ Migration complete! Updated ${missing} videos.`);
}

await migrate();
