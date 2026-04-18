import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { getGuestSpeakers } from "../hugo/get-guest-speakers.js";
import { EXCLUDED_SEGMENT_TYPES } from "../hugo/shared.js";
import {
  gatherSegmentContext,
  type GatheredSegmentContext,
} from "../pipeline/describe-segment.js";
import { getVideoByEpisodeNumber } from "../storage/get-video-by-episode-number.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";

const WEAK_EPISODE_TOPIC_LABELS = new Set([
  "star",
  "council",
  "astronomy",
  "religion",
  "history",
  "biblical",
  "bible",
  "jesus",
  "god",
  "christianity",
  "judaism",
]);

interface ParsedArguments {
  episodeNumber: number;
  force: boolean;
}

interface SegmentContextOutput extends GatheredSegmentContext {
  startTimestamp: string;
}

function parseArguments(argv: string[]): ParsedArguments {
  const episodeValue = argv.find(argument => !argument.startsWith("--"));
  const episodeNumber = episodeValue
    ? Number.parseInt(episodeValue, 10)
    : Number.NaN;

  if (Number.isNaN(episodeNumber)) {
    throw new TypeError(
      "Usage: bun run src/scripts/gather-segment-context.ts <episode-number> [--force]",
    );
  }

  return {
    episodeNumber,
    force: argv.includes("--force"),
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

function shouldRegenerateEpisodeTopic(
  episodeTopic: string | undefined,
): boolean {
  if (!episodeTopic) {
    return true;
  }

  const trimmed = episodeTopic.trim();
  if (trimmed.length === 0) {
    return true;
  }

  return WEAK_EPISODE_TOPIC_LABELS.has(trimmed.toLowerCase());
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const video = await getVideoByEpisodeNumber(args.episodeNumber);

    if (!video) {
      throw new Error(`Episode ${args.episodeNumber} not found`);
    }

    const episodeTitle = extractCleanTitle(video.title);
    const segments = (video.segments as EpisodeSegment[] | undefined) ?? [];
    const analyzableSegments = segments.filter(segment =>
      shouldAnalyzeSegment(segment, args.force),
    );

    if (analyzableSegments.length > 0) {
      const transcript = await Bun.file(video.transcriptPath).text();
      const gatheredSegments: SegmentContextOutput[] = analyzableSegments.map(
        segment => ({
          ...gatherSegmentContext({
            episodeTitle,
            segmentType: segment.type,
            startTimestamp: segment.startTimestamp,
            transcript,
          }),
          startTimestamp: segment.startTimestamp,
        }),
      );

      console.log(
        JSON.stringify(
          {
            mode: "segments",
            episodeNumber: args.episodeNumber,
            videoId: video.videoId,
            episodeTitle,
            segments: gatheredSegments,
          },
          undefined,
          2,
        ),
      );
      return;
    }

    if (
      episodeTitle.length > 0 &&
      shouldRegenerateEpisodeTopic(video.episodeTopic)
    ) {
      console.log(
        JSON.stringify(
          {
            mode: "episode-topic",
            episodeNumber: args.episodeNumber,
            videoId: video.videoId,
            episodeTitle,
            guestNames: getGuestSpeakers(video.speakers),
            transcriptPath: video.transcriptPath,
          },
          undefined,
          2,
        ),
      );
      return;
    }

    console.log(
      JSON.stringify(
        {
          mode: "no-op",
          episodeNumber: args.episodeNumber,
          videoId: video.videoId,
          episodeTitle,
        },
        undefined,
        2,
      ),
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
