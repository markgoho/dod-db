/**
 * CLI script to detect segments in a single episode.
 *
 * Usage:
 *   bun run src/scripts/detect-segments-single.ts <video-id>
 *   bun run src/scripts/detect-segments-single.ts <video-id> --verbose
 *   bun run src/scripts/detect-segments-single.ts <video-id> --dry-run
 */

import { SEGMENT_LABELS } from "../config/segment-patterns.js";
import {
  detectSegmentsFromAudio,
  formatTimestamp,
  getAudioDuration,
} from "../pipeline/detect-segments.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { updateVideoSegments } from "../storage/update-video-segments.js";

async function main(): Promise<void> {
  const videoId = process.argv[2];
  const verbose = process.argv.includes("--verbose");
  const dryRun = process.argv.includes("--dry-run");

  if (!videoId) {
    console.error(
      "Usage: bun run src/scripts/detect-segments-single.ts <video-id>",
    );
    console.error("Options:");
    console.error("  --verbose  Show detailed segment information");
    console.error("  --dry-run  Preview detection without saving");
    process.exit(1);
  }

  console.log(`🎬 Detecting segments for video: ${videoId}\n`);

  if (dryRun) {
    console.log("🔍 Dry run mode: No changes will be saved\n");
  }

  // Load video metadata
  const videos = await loadProcessedVideos();
  const video = videos.find(v => v.videoId === videoId);

  if (!video) {
    console.error(`❌ Video ${videoId} not found in processed-videos.json`);
    process.exit(1);
  }

  console.log(`Episode ${video.episodeNumber}: ${video.title}`);

  // Check if transcript exists
  const transcriptFile = Bun.file(video.transcriptPath);
  const exists = await transcriptFile.exists();

  if (!exists) {
    console.error(`❌ Transcript not found: ${video.transcriptPath}`);
    process.exit(1);
  }

  // Get audio duration
  const durationSeconds = await getAudioDuration(video.videoId);
  if (verbose && durationSeconds) {
    console.log(
      `Audio duration: ${(durationSeconds / 60).toFixed(1)} minutes\n`,
    );
  }

  // Detect segments
  console.log("Detecting segments with audio jingle...\n");
  const segments = await detectSegmentsFromAudio({
    videoId: video.videoId,
    durationSeconds: durationSeconds ?? undefined,
  });

  console.log(`✓ Detected ${segments.length} segments\n`);

  // Display segments
  for (const segment of segments) {
    const start = formatTimestamp(segment.startTimestamp);
    const end = segment.endTimestamp
      ? formatTimestamp(segment.endTimestamp)
      : "end";
    const label = SEGMENT_LABELS[segment.type];
    console.log(`  [${segment.type}] ${label}`);
    console.log(`    ${start} → ${end}`);
    console.log(
      `    Detection: ${segment.detectionMethod} (${segment.confidence})`,
    );
    if (verbose && segment.matchedPattern) {
      console.log(`    Pattern: ${segment.matchedPattern}`);
    }
    console.log();
  }

  // Save if not dry run
  if (dryRun) {
    console.log("🔍 Dry run complete. No changes were saved.");
  } else {
    const episodeSegments: EpisodeSegment[] = segments.map(s => ({
      type: s.type,
      startTimestamp: s.startTimestamp,
      endTimestamp: s.endTimestamp,
      confidence: s.confidence,
      detectionMethod: s.detectionMethod,
    }));

    await updateVideoSegments(video.videoId, episodeSegments);
    console.log("✅ Segments saved to processed-videos.json");
  }
}

await main();
