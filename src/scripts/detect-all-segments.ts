/**
 * CLI script to detect segments in all episodes.
 *
 * Usage:
 *   bun run src/scripts/detect-all-segments.ts              # Process episodes without segments
 *   bun run src/scripts/detect-all-segments.ts --force      # Reprocess unverified episodes
 *   bun run src/scripts/detect-all-segments.ts --force-verified  # Reprocess ALL (including verified)
 *   bun run src/scripts/detect-all-segments.ts --verbose    # Show detailed per-episode logs
 *   bun run src/scripts/detect-all-segments.ts --dry-run    # Show what would be detected without saving
 */

import {
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import {
  detectSegmentsFromAudio,
  formatTimestamp,
  getAudioDuration,
} from "../pipeline/detect-segments.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { updateVideoSegments } from "../storage/update-video-segments.js";

interface DetectionResult {
  videoId: string;
  title: string;
  episodeNumber?: number;
  segmentsFound: number;
  segmentTypes: SegmentType[];
  error?: string;
}

async function main() {
  console.log("🎬 Segment Detection Script\n");

  // Parse CLI arguments
  const force = process.argv.includes("--force");
  const forceVerified = process.argv.includes("--force-verified");
  const verbose = process.argv.includes("--verbose");
  const dryRun = process.argv.includes("--dry-run");

  if (forceVerified) {
    console.log(
      "⚠️  Force-verified mode: Reprocessing ALL episodes including verified\n",
    );
  } else if (force) {
    console.log(
      "⚠️  Force mode: Reprocessing unverified episodes (skipping verified)\n",
    );
  }
  if (dryRun) {
    console.log("🔍 Dry run mode: No changes will be saved\n");
  }
  if (verbose) {
    console.log("📝 Verbose mode: Showing detailed logs\n");
  }

  // Load all processed videos
  const videos = await loadProcessedVideos();
  console.log(`Found ${videos.length} processed episodes\n`);

  // Helper to check if an episode has any verified segments
  const hasVerifiedSegments = (v: (typeof videos)[0]) =>
    v.segments?.some(s => s.confidence === "verified") ?? false;

  // Filter videos to process
  let toProcess: typeof videos;
  let skippedVerified: typeof videos = [];

  if (forceVerified) {
    // Process everything, including verified
    toProcess = videos;
  } else if (force) {
    // Process all except verified
    skippedVerified = videos.filter(hasVerifiedSegments);
    toProcess = videos.filter(v => !hasVerifiedSegments(v));
  } else {
    // Only process episodes without segments
    toProcess = videos.filter(v => !v.segments || v.segments.length === 0);
  }

  if (toProcess.length === 0) {
    console.log("✅ All episodes already have segments detected.");
    if (skippedVerified.length > 0) {
      console.log(
        `   Skipped ${skippedVerified.length} episode(s) with verified segments.`,
      );
      console.log("   Use --force-verified to reprocess verified episodes.");
    } else {
      console.log("   Use --force to reprocess all episodes.");
    }
    return;
  }

  // Show skipped verified episodes
  if (skippedVerified.length > 0) {
    console.log(
      `⏭️  Skipping ${skippedVerified.length} episode(s) with verified segments:`,
    );
    for (const v of skippedVerified) {
      console.log(`   - Episode ${v.episodeNumber}: ${v.title}`);
    }
    console.log();
  }

  console.log(`Processing ${toProcess.length} episodes...\n`);

  const results: DetectionResult[] = [];
  const globalStats: Record<SegmentType, number> = {} as Record<
    SegmentType,
    number
  >;

  for (const video of toProcess) {
    const result: DetectionResult = {
      videoId: video.videoId,
      title: video.title,
      episodeNumber: video.episodeNumber,
      segmentsFound: 0,
      segmentTypes: [],
    };

    try {
      // Read transcript file
      const transcriptFile = Bun.file(video.transcriptPath);
      const exists = await transcriptFile.exists();

      if (!exists) {
        result.error = `Transcript not found: ${video.transcriptPath}`;
        results.push(result);
        console.log(`❌ Episode ${video.episodeNumber}: ${result.error}`);
        continue;
      }

      // Get audio duration for accurate end timestamp
      const durationSeconds = await getAudioDuration(video.videoId);
      if (verbose && durationSeconds) {
        console.log(
          `   Audio duration: ${(durationSeconds / 60).toFixed(1)} minutes`,
        );
      }

      // Detect segments using audio jingle matching
      const segments = await detectSegmentsFromAudio({
        videoId: video.videoId,
        durationSeconds: durationSeconds ?? undefined,
      });
      result.segmentsFound = segments.length;
      result.segmentTypes = segments.map(s => s.type);

      // Update global stats
      for (const segment of segments) {
        globalStats[segment.type] = (globalStats[segment.type] || 0) + 1;
      }

      // Convert to EpisodeSegment (remove matchedPattern for storage)
      const episodeSegments: EpisodeSegment[] = segments.map(s => ({
        type: s.type,
        startTimestamp: s.startTimestamp,
        endTimestamp: s.endTimestamp,
        confidence: s.confidence,
        detectionMethod: s.detectionMethod,
      }));

      // Save if not dry run
      if (!dryRun) {
        await updateVideoSegments(video.videoId, episodeSegments);
      }

      // Log result
      const prefix = dryRun ? "🔍" : "✅";
      const episodeLabel = video.episodeNumber
        ? `Episode ${video.episodeNumber}`
        : video.videoId;
      console.log(
        `${prefix} ${episodeLabel}: ${segments.length} segments found`,
      );

      if (verbose) {
        for (const segment of segments) {
          const start = formatTimestamp(segment.startTimestamp);
          const end = segment.endTimestamp
            ? formatTimestamp(segment.endTimestamp)
            : "end";
          console.log(
            `   - ${SEGMENT_LABELS[segment.type]}: ${start} → ${end}`,
          );
        }
        console.log();
      }

      results.push(result);
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      results.push(result);
      console.log(`❌ Episode ${video.episodeNumber}: ${result.error}`);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("SUMMARY");
  console.log("=".repeat(60));

  const successful = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  console.log(`\nProcessed: ${successful.length}/${results.length} episodes`);
  if (failed.length > 0) {
    console.log(`Failed: ${failed.length}`);
  }

  // Segment type breakdown
  console.log("\nSegments by type:");
  const sortedTypes = Object.entries(globalStats).sort(([, a], [, b]) => b - a);
  for (const [type, count] of sortedTypes) {
    console.log(`  ${SEGMENT_LABELS[type as SegmentType]}: ${count}`);
  }

  // Episodes without named segments
  const withoutNamedSegments = results.filter(
    r =>
      !r.error &&
      r.segmentTypes.every(
        t => t === "intro" || t === "main-content" || t === "outro",
      ),
  );
  if (withoutNamedSegments.length > 0) {
    console.log(`\n⚠️  Episodes with only intro/outro (no named segments):`);
    for (const ep of withoutNamedSegments) {
      console.log(`   - Episode ${ep.episodeNumber}: ${ep.title}`);
    }
  }

  if (dryRun) {
    console.log("\n🔍 Dry run complete. No changes were saved.");
    console.log("   Remove --dry-run to save segment data.");
  }
}

await main();
