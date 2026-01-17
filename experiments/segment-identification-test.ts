/**
 * Experiment: Test segment type identification against existing verified segments.
 *
 * This script:
 * 1. Loads episodes from processed-videos.json that have segments
 * 2. Re-detects segments using audio jingles
 * 3. Runs type identification on the detected segments
 * 4. Compares against existing (potentially verified) segment types
 * 5. Writes results to experiments/results/segment-identification-results.json
 *
 * Usage:
 *   bun run experiments/segment-identification-test.ts [--episode=N] [--limit=N]
 */

import { join } from "node:path";
import {
  detectSegmentsFromAudio,
  getAudioDuration,
} from "../src/pipeline/detect-segments.js";
import { identifySegmentTypes } from "../src/pipeline/identify-segment-types.js";
import { loadProcessedVideos } from "../src/storage/load-processed-videos.js";

interface SegmentComparison {
  timestamp: string;
  existing: {
    type: string;
    detectionMethod: string;
    confidence: string;
  };
  identified: {
    type: string;
    detectionMethod: string;
    matchedPattern?: string;
  };
  match: boolean;
}

interface EpisodeResult {
  episodeNumber: number;
  videoId: string;
  title: string;
  isGuestEpisode: boolean;
  skipped: boolean;
  existingSegmentCount: number;
  detectedSegmentCount: number;
  comparisons: SegmentComparison[];
  accuracy: {
    total: number;
    matches: number;
    percentage: number;
  };
}

/**
 * Regular hosts of the podcast.
 */
const REGULAR_HOSTS = new Set(["Dan McClellan", "Dan Beecher"]);

/**
 * Check if an episode has a guest speaker.
 */
function hasGuestSpeaker(speakers: string[] | undefined): boolean {
  if (!speakers || speakers.length === 0) return false;
  return speakers.some(speaker => !REGULAR_HOSTS.has(speaker));
}

interface ExperimentResults {
  runAt: string;
  episodesProcessed: number;
  overallAccuracy: {
    total: number;
    matches: number;
    percentage: number;
  };
  byDetectionMethod: {
    pattern: { total: number; matches: number };
    llm: { total: number; matches: number };
  };
  episodes: EpisodeResult[];
}

function parseArguments(): { episode?: number; limit?: number } {
  const args: { episode?: number; limit?: number } = {};

  for (const argument of process.argv.slice(2)) {
    if (argument.startsWith("--episode=")) {
      args.episode = Number.parseInt(argument.split("=")[1] ?? "", 10);
    } else if (argument.startsWith("--limit=")) {
      args.limit = Number.parseInt(argument.split("=")[1] ?? "", 10);
    }
  }

  return args;
}

async function loadTranscript(
  transcriptPath: string,
): Promise<string | undefined> {
  const file = Bun.file(transcriptPath);
  if (await file.exists()) {
    return file.text();
  }
  return undefined;
}

/**
 * Find the closest existing segment to a detected timestamp.
 */
function findClosestExistingSegment(
  detectedTimestamp: string,
  existingSegments: Array<{
    type: string;
    startTimestamp: string;
    detectionMethod: string;
    confidence: string;
  }>,
  toleranceSeconds = 10,
): (typeof existingSegments)[number] | undefined {
  const detectedSeconds = timestampToSeconds(detectedTimestamp);

  let closest: (typeof existingSegments)[number] | undefined;
  let closestDiff = Number.POSITIVE_INFINITY;

  for (const segment of existingSegments) {
    const segmentSeconds = timestampToSeconds(segment.startTimestamp);
    const diff = Math.abs(segmentSeconds - detectedSeconds);

    if (diff < closestDiff && diff <= toleranceSeconds) {
      closestDiff = diff;
      closest = segment;
    }
  }

  return closest;
}

function timestampToSeconds(timestamp: string): number {
  const clean = timestamp.replaceAll(/[[\]]/g, "");
  const parts = clean.split(":");
  const hours = Number.parseInt(parts[0] ?? "0", 10);
  const minutes = Number.parseInt(parts[1] ?? "0", 10);
  const seconds = Number.parseFloat(parts[2] ?? "0");
  return hours * 3600 + minutes * 60 + seconds;
}

async function main(): Promise<void> {
  const args = parseArguments();

  console.log("🧪 Segment Identification Experiment\n");

  // Load all processed videos
  const videos = await loadProcessedVideos();

  // Filter to videos with segments and transcripts
  let episodesToTest = videos.filter(
    v =>
      v.segments &&
      v.segments.length > 0 &&
      v.transcriptPath &&
      v.episodeNumber !== undefined,
  );

  // Apply filters
  if (args.episode !== undefined) {
    episodesToTest = episodesToTest.filter(
      v => v.episodeNumber === args.episode,
    );
    console.log(`Filtering to episode ${args.episode}`);
  }

  if (args.limit !== undefined) {
    episodesToTest = episodesToTest.slice(0, args.limit);
    console.log(`Limiting to ${args.limit} episode(s)`);
  }

  console.log(`Found ${episodesToTest.length} episode(s) to test\n`);

  if (episodesToTest.length === 0) {
    console.log("No episodes to test. Exiting.");
    return;
  }

  const results: ExperimentResults = {
    runAt: new Date().toISOString(),
    episodesProcessed: 0,
    overallAccuracy: { total: 0, matches: 0, percentage: 0 },
    byDetectionMethod: {
      pattern: { total: 0, matches: 0 },
      llm: { total: 0, matches: 0 },
    },
    episodes: [],
  };

  for (const video of episodesToTest) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Episode ${video.episodeNumber}: ${video.title}`);
    console.log(`Video ID: ${video.videoId}`);
    console.log(`Speakers: ${video.speakers?.join(", ") ?? "unknown"}`);
    console.log(`Existing segments: ${video.segments?.length ?? 0}`);

    // Check if this is a guest episode
    const isGuest = hasGuestSpeaker(video.speakers);
    if (isGuest) {
      console.log("⏭️ Guest episode detected, skipping segment identification");
      results.episodes.push({
        episodeNumber: video.episodeNumber!,
        videoId: video.videoId,
        title: video.title,
        isGuestEpisode: true,
        skipped: true,
        existingSegmentCount: video.segments?.length ?? 0,
        detectedSegmentCount: 0,
        comparisons: [],
        accuracy: { total: 0, matches: 0, percentage: 0 },
      });
      continue;
    }

    // Load transcript
    const transcript = await loadTranscript(video.transcriptPath);
    if (!transcript) {
      console.log("⚠️ Transcript not found, skipping");
      continue;
    }

    // Detect segments from audio
    const audioDuration = await getAudioDuration(video.videoId);
    const detectedSegments = await detectSegmentsFromAudio({
      videoId: video.videoId,
      durationSeconds: audioDuration ?? undefined,
    });

    if (detectedSegments.length === 0) {
      console.log("⚠️ No segments detected from audio, skipping");
      continue;
    }

    console.log(`Detected ${detectedSegments.length} segment(s) from audio`);

    // Run type identification
    const identifiedSegments = await identifySegmentTypes(
      detectedSegments,
      transcript,
    );

    // Compare against existing segments
    const comparisons: SegmentComparison[] = [];
    const existingSegments = (video.segments ?? []).map(s => ({
      type: s.type,
      startTimestamp: s.startTimestamp,
      detectionMethod: s.detectionMethod,
      confidence: s.confidence,
    }));

    for (const identified of identifiedSegments) {
      const closest = findClosestExistingSegment(
        identified.startTimestamp,
        existingSegments,
      );

      if (closest) {
        const isMatch =
          identified.type === closest.type ||
          // Consider 'segment' as unknown, not a mismatch
          (identified.type === "segment" && closest.type === "segment");

        comparisons.push({
          timestamp: identified.startTimestamp,
          existing: {
            type: closest.type,
            detectionMethod: closest.detectionMethod,
            confidence: closest.confidence,
          },
          identified: {
            type: identified.type,
            detectionMethod: identified.detectionMethod,
            matchedPattern: identified.matchedPattern,
          },
          match: isMatch,
        });

        // Track by detection method
        if (identified.detectionMethod === "pattern") {
          results.byDetectionMethod.pattern.total++;
          if (isMatch) results.byDetectionMethod.pattern.matches++;
        } else if (identified.detectionMethod === "llm") {
          results.byDetectionMethod.llm.total++;
          if (isMatch) results.byDetectionMethod.llm.matches++;
        }
      }
    }

    // Calculate accuracy for this episode
    const matches = comparisons.filter(c => c.match).length;
    const total = comparisons.length;
    const percentage = total > 0 ? Math.round((matches / total) * 100) : 0;

    results.episodes.push({
      episodeNumber: video.episodeNumber!,
      videoId: video.videoId,
      title: video.title,
      isGuestEpisode: false,
      skipped: false,
      existingSegmentCount: existingSegments.length,
      detectedSegmentCount: identifiedSegments.length,
      comparisons,
      accuracy: { total, matches, percentage },
    });

    results.overallAccuracy.total += total;
    results.overallAccuracy.matches += matches;
    results.episodesProcessed++;

    // Print comparison
    console.log("\nComparisons:");
    for (const comparison of comparisons) {
      const icon = comparison.match ? "✅" : "❌";
      const existingString = `${comparison.existing.type} (${comparison.existing.confidence})`;
      const identifiedString = `${comparison.identified.type} (${comparison.identified.detectionMethod})`;
      console.log(
        `  ${icon} ${comparison.timestamp}: ${existingString} → ${identifiedString}`,
      );
    }
    console.log(`\nAccuracy: ${matches}/${total} (${percentage}%)`);
  }

  // Calculate overall accuracy
  results.overallAccuracy.percentage =
    results.overallAccuracy.total > 0
      ? Math.round(
          (results.overallAccuracy.matches / results.overallAccuracy.total) *
            100,
        )
      : 0;

  // Write results
  const resultsDir = join(process.cwd(), "experiments", "results");
  const resultsPath = join(resultsDir, "segment-identification-results.json");

  await Bun.write(resultsPath, JSON.stringify(results, undefined, 2));

  console.log(`\n${"=".repeat(60)}`);
  console.log("EXPERIMENT SUMMARY");
  console.log(`${"=".repeat(60)}`);
  console.log(`Episodes processed: ${results.episodesProcessed}`);
  console.log(
    `Overall accuracy: ${results.overallAccuracy.matches}/${results.overallAccuracy.total} (${results.overallAccuracy.percentage}%)`,
  );
  console.log(
    `Pattern matching: ${results.byDetectionMethod.pattern.matches}/${results.byDetectionMethod.pattern.total}`,
  );
  console.log(
    `LLM identification: ${results.byDetectionMethod.llm.matches}/${results.byDetectionMethod.llm.total}`,
  );
  console.log(`\nResults written to: ${resultsPath}`);
}

main().catch(console.error);
