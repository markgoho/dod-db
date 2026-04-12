/**
 * CLI script to describe one verified segment in a processed episode.
 *
 * Usage:
 *   bun run src/scripts/describe-segment.ts --episode 6 --segment what-does-that-mean
 *   bun run src/scripts/describe-segment.ts --episode 6 --anchor what-does-that-mean-1
 *   bun run src/scripts/describe-segment.ts --episode 6 --segment what-does-that-mean --dry-run
 */

import type { SegmentType } from "../config/segment-patterns.js";
import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { formatSegmentsForFrontmatter } from "../hugo/format-segments-for-frontmatter.js";
import { describeSegment } from "../pipeline/describe-segment.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";
import { getVideoByEpisodeNumber } from "../storage/get-video-by-episode-number.js";
import type {
  EpisodeSegment,
  ProcessedVideo,
} from "../storage/processed-videos.js";
import { updateSegmentDescription } from "../storage/update-segment-description.js";

interface ParsedArguments {
  episodeNumber: number;
  segmentType?: SegmentType;
  anchor?: string;
  dryRun: boolean;
}

function parseArguments(argv: string[]): ParsedArguments {
  let episodeNumber: number | undefined;
  let segmentType: SegmentType | undefined;
  let anchor: string | undefined;
  let dryRun = false;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (!argument) {
      continue;
    }

    if (argument === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (argument === "--episode") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --episode");
      }
      episodeNumber = Number.parseInt(value, 10);
      index += 1;
      continue;
    }

    if (argument === "--segment") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --segment");
      }
      segmentType = value as SegmentType;
      index += 1;
      continue;
    }

    if (argument === "--anchor") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value for --anchor");
      }
      anchor = value;
      index += 1;
      continue;
    }
  }

  if (!episodeNumber || Number.isNaN(episodeNumber)) {
    throw new Error("--episode <number> is required");
  }

  if (!segmentType && !anchor) {
    throw new Error("Provide either --segment <type> or --anchor <anchor>");
  }

  return { episodeNumber, segmentType, anchor, dryRun };
}

function resolveSegment(
  video: ProcessedVideo,
  segmentType: SegmentType | undefined,
  anchor: string | undefined,
): EpisodeSegment {
  const segments = video.segments as EpisodeSegment[] | undefined;
  if (!segments || segments.length === 0) {
    throw new Error("Episode has no segments");
  }

  const formatted = formatSegmentsForFrontmatter(segments as EpisodeSegment[]);

  if (anchor) {
    const matched = formatted.segmentData.find(item => item.anchor === anchor);
    if (!matched) {
      throw new Error(`Segment anchor not found: ${anchor}`);
    }

    const matchingSegments = segments.filter(
      candidate => candidate.type === matched.type,
    );
    const anchorIndex = Number.parseInt(anchor.split("-").at(-1) ?? "", 10);

    if (Number.isNaN(anchorIndex) || anchorIndex < 1) {
      throw new Error(`Invalid segment anchor: ${anchor}`);
    }

    const resolved = matchingSegments[anchorIndex - 1];

    if (!resolved) {
      throw new Error(`Could not resolve anchor to segment: ${anchor}`);
    }

    return resolved;
  }

  const matches = segments.filter(segment => segment.type === segmentType);
  if (matches.length === 0) {
    throw new Error(`No segment found with type: ${segmentType}`);
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple segments found for type ${segmentType}; use --anchor instead`,
    );
  }

  const match = matches[0];
  if (!match) {
    throw new Error(`No segment found with type: ${segmentType}`);
  }

  return match;
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
    const segment = resolveSegment(video, args.segmentType, args.anchor);
    const cleanTitle = extractCleanTitle(video.title);

    console.log(
      `Describing ${segment.type} for episode ${args.episodeNumber}: ${cleanTitle}`,
    );

    const description = await describeSegment({
      episodeTitle: cleanTitle,
      segmentType: segment.type,
      startTimestamp: segment.startTimestamp,
      transcript,
    });

    console.log(`Topic label: ${description.topicLabel}`);
    console.log(`Summary: ${description.summary}`);
    console.log(`Confidence: ${description.confidence}`);

    if (args.dryRun) {
      console.log("Dry run complete. No changes saved.");
      return;
    }

    await updateSegmentDescription(video.videoId, segment.startTimestamp, {
      topicLabel: description.topicLabel,
      summary: description.summary,
    });

    const updatedVideo = {
      ...video,
      segments: video.segments.map(candidate => {
        if (candidate.startTimestamp !== segment.startTimestamp) {
          return candidate;
        }

        return {
          ...candidate,
          type: candidate.type,
          topicLabel: description.topicLabel,
          summary: description.summary,
        };
      }),
    };

    await generateHugoEpisode(updatedVideo);
    console.log("Saved segment description and regenerated Hugo page.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
