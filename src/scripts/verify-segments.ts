import {
  SEGMENT_LABELS,
  type SegmentType,
} from "../config/segment-patterns.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";
import { getVideoByEpisodeNumber } from "../storage/get-video-by-episode-number.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { updateVideoSegments } from "../storage/update-video-segments.js";

interface VerifyInput {
  episodeNumber: number;
  segments: { startTimestamp: string; type: SegmentType }[];
}

/**
 * Mark auto-detected segments as verified, optionally correcting their type.
 * Same effect as confirming them in the tool server's segment verification UI.
 */
async function main(): Promise<void> {
  try {
    const input = (await new Response(
      Bun.stdin.stream(),
    ).json()) as VerifyInput;
    const video = await getVideoByEpisodeNumber(input.episodeNumber);

    if (!video) {
      throw new Error(`Episode ${input.episodeNumber} not found`);
    }

    const segments = structuredClone(
      (video.segments as EpisodeSegment[] | undefined) ?? [],
    );

    for (const { startTimestamp, type } of input.segments) {
      if (!(type in SEGMENT_LABELS) || type === "segment") {
        throw new Error(`Invalid segment type "${type}" at ${startTimestamp}`);
      }

      const segment = segments.find(
        candidate => candidate.startTimestamp === startTimestamp,
      );
      if (!segment) {
        throw new Error(`Segment ${startTimestamp} not found`);
      }

      segment.type = type;
      segment.confidence = "verified";
    }

    await updateVideoSegments(video.videoId, segments);
    await generateHugoEpisode({ ...video, segments });

    console.log(
      `\nSegments for episode ${input.episodeNumber}: ${video.title}`,
    );
    for (const segment of segments) {
      console.log(
        `- ${segment.type} @ ${segment.startTimestamp} (${segment.confidence})`,
      );
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
