/**
 * One-time migration script to add speakers field to existing videos.
 * Extracts speaker names from transcript files deterministically.
 * Safe to run multiple times (idempotent) - skips videos that already have speakers.
 *
 * Usage: bun run src/scripts/migrate-speakers.ts
 */

import {
  extractSpeakersFromTranscript,
  getProcessedVideos,
  saveProcessedVideos,
} from "../storage/processed-videos.js";

async function migrate(): Promise<void> {
  console.log("Loading processed videos...");
  const videos = await getProcessedVideos();

  console.log(`Found ${videos.length} videos to process\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const video of videos) {
    // Skip if speakers already exists (idempotent)
    if (video.speakers && video.speakers.length > 0) {
      console.log(`⏭️  Skipping ${video.videoId} - speakers already set`);
      skipped++;
      continue;
    }

    console.log(`🔍 Processing ${video.videoId}: ${video.title}`);

    const speakers = await extractSpeakersFromTranscript(
      video.transcriptPath,
      video.title,
    );

    if (speakers.length > 0) {
      video.speakers = speakers;
      console.log(`   ✅ Found speakers: ${speakers.join(", ")}`);
      updated++;
    } else {
      console.log("   ⚠️  No speakers found (empty or missing transcript)");
      failed++;
    }
  }

  console.log("\nSaving updated metadata...");
  await saveProcessedVideos(videos);

  console.log("\n✨ Migration complete:");
  console.log(`   Updated: ${updated} videos`);
  console.log(`   Skipped: ${skipped} videos (already had speakers)`);
  console.log(`   Failed:  ${failed} videos (no speakers found)`);
  console.log(`   Total:   ${videos.length} videos`);
}

await migrate();
