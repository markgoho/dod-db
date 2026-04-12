/**
 * CLI script to analyze verified segments for a processed episode.
 *
 * Usage:
 *   bun run src/scripts/analyze-segments.ts 6
 *   bun run src/scripts/analyze-segments.ts 6 --force
 *   bun run src/scripts/analyze-segments.ts 6 --dry-run
 */

import type { SegmentType } from "../config/segment-patterns.js";
import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { describeSegment } from "../pipeline/describe-segment.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";
import { getVideoByEpisodeNumber } from "../storage/get-video-by-episode-number.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { updateSegmentDescription } from "../storage/update-segment-description.js";

const EXCLUDED_SEGMENT_TYPES = new Set<SegmentType>([
  "intro",
  "outro",
  "main-content",
  "advertisement",
  "segment",
]);

interface ParsedArguments {
  episodeNumber: number;
  force: boolean;
  dryRun: boolean;
}

function parseArguments(argv: string[]): ParsedArguments {
  const episodeValue = argv.find(argument => !argument.startsWith("--"));
  const episodeNumber = episodeValue
    ? Number.parseInt(episodeValue, 10)
    : Number.NaN;

  if (Number.isNaN(episodeNumber)) {
    throw new TypeError(
      "Usage: bun run src/scripts/analyze-segments.ts <episode-number> [--force] [--dry-run]",
    );
  }

  return {
    episodeNumber,
    force: argv.includes("--force"),
    dryRun: argv.includes("--dry-run"),
  };
}

function shouldAnalyzeSegment(
  segment: EpisodeSegment,
  force: boolean,
): boolean {
  if (segment.confidence !== "verified") {
    return false;
  }

  if (EXCLUDED_SEGMENT_TYPES.has(segment.type)) {
    return false;
  }

  if (!force && segment.topicLabel && segment.summary) {
    return false;
  }

  return true;
}

function printSegmentReviewSummary(
  episodeNumber: number,
  episodeTitle: string,
  summaries: Array<{
    type: string;
    startTimestamp: string;
    topicLabel: string;
    summary: string;
    confidence: number;
  }>,
): void {
  console.log(`\nSegment review for episode ${episodeNumber}: ${episodeTitle}`);

  for (const segment of summaries) {
    console.log(`- ${segment.type} @ ${segment.startTimestamp}`);
    console.log(`  Topic: ${segment.topicLabel}`);
    console.log(`  Summary: ${segment.summary}`);
    console.log(`  Confidence: ${segment.confidence}`);
  }
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const video = await getVideoByEpisodeNumber(args.episodeNumber);

    if (!video) {
      throw new Error(`Episode ${args.episodeNumber} not found`);
    }

    if (!video.segments || video.segments.length === 0) {
      throw new Error(`Episode ${args.episodeNumber} has no segments`);
    }

    const transcript = await Bun.file(video.transcriptPath).text();
    const cleanTitle = extractCleanTitle(video.title);
    const updatedSegments = [...(video.segments as EpisodeSegment[])];
    const reviewSummaries: Array<{
      type: string;
      startTimestamp: string;
      topicLabel: string;
      summary: string;
      confidence: number;
    }> = [];
    let describedCount = 0;

    for (const [index, segment] of updatedSegments.entries()) {
      if (!shouldAnalyzeSegment(segment, args.force)) {
        continue;
      }

      console.log(
        `Analyzing segment ${index + 1}/${updatedSegments.length}: ${segment.type} (${segment.startTimestamp})`,
      );

      const description = await describeSegment({
        episodeTitle: cleanTitle,
        segmentType: segment.type,
        startTimestamp: segment.startTimestamp,
        transcript,
      });

      console.log(`  Topic label: ${description.topicLabel}`);
      console.log(`  Summary: ${description.summary}`);
      console.log(`  Confidence: ${description.confidence}`);

      reviewSummaries.push({
        type: segment.type,
        startTimestamp: segment.startTimestamp,
        topicLabel: description.topicLabel,
        summary: description.summary,
        confidence: description.confidence,
      });

      if (!args.dryRun) {
        await updateSegmentDescription(video.videoId, segment.startTimestamp, {
          topicLabel: description.topicLabel,
          summary: description.summary,
        });
      }

      updatedSegments[index] = {
        ...segment,
        topicLabel: description.topicLabel,
        summary: description.summary,
      };
      describedCount += 1;
    }

    if (describedCount === 0) {
      console.log("No segments needed analysis.");
      return;
    }

    printSegmentReviewSummary(args.episodeNumber, cleanTitle, reviewSummaries);

    if (args.dryRun) {
      console.log(`\nDry run complete. ${describedCount} segment(s) analyzed.`);
      return;
    }

    await generateHugoEpisode({
      ...video,
      segments: updatedSegments,
    });
    console.log(
      `\nSaved ${describedCount} segment description(s) and regenerated Hugo page.`,
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
