import { getEpisodeByNumber } from "../catalog/episode-catalog.js";
import { updateSegmentDescription } from "../catalog/episode-catalog.js";
import { setEpisodeTopic } from "../catalog/episode-catalog.js";
import type { SegmentType } from "../config/segment-patterns.js";
import { postProcessSegmentDescription } from "../pipeline/describe-segment.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";
import type { SegmentDescriptionResult } from "../prompts/segment-description.js";

interface SegmentResultInput extends SegmentDescriptionResult {
  startTimestamp: string;
  segmentType: SegmentType;
  forwardScriptureCandidate?: string;
  fallbackScriptureCandidate?: string;
  primaryScriptureCandidate?: string;
}

interface SaveInput {
  mode: "segments" | "episode-topic";
  episodeNumber: number;
  videoId: string;
  segmentResults?: SegmentResultInput[];
  episodeTopic?: string;
  episodeTopicConfidence?: number;
}

interface ParsedArguments {
  inputPath?: string;
}

function parseArguments(argv: string[]): ParsedArguments {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--input") {
      const inputPath = argv[index + 1];
      if (!inputPath) {
        throw new Error("Missing value for --input");
      }
      return { inputPath };
    }
  }

  return {};
}

async function readInput(inputPath: string | undefined): Promise<string> {
  if (inputPath) {
    return Bun.file(inputPath).text();
  }

  return new Response(Bun.stdin.stream()).text();
}

function printSegmentReviewSummary(
  episodeNumber: number,
  episodeTitle: string,
  summaries: SegmentResultInput[],
): void {
  console.log(`\nSegment review for episode ${episodeNumber}: ${episodeTitle}`);

  for (const segment of summaries) {
    console.log(`- ${segment.segmentType} @ ${segment.startTimestamp}`);
    console.log(`  Topic: ${segment.topicLabel}`);
    console.log(`  Summary: ${segment.summary}`);
    console.log(`  Confidence: ${segment.confidence}`);
  }
}

async function main(): Promise<void> {
  try {
    const args = parseArguments(process.argv.slice(2));
    const rawInput = await readInput(args.inputPath);
    const input = JSON.parse(rawInput) as SaveInput;
    const video = await getEpisodeByNumber(input.episodeNumber);

    if (!video) {
      throw new Error(`Episode ${input.episodeNumber} not found`);
    }

    if (video.videoId !== input.videoId) {
      throw new Error(
        `Episode ${input.episodeNumber} does not match video ${input.videoId}`,
      );
    }

    if (input.mode === "segments") {
      const segmentResults = input.segmentResults ?? [];
      const processedResults: SegmentResultInput[] = [];

      for (const result of segmentResults) {
        const processed = {
          ...result,
          ...postProcessSegmentDescription(result.segmentType, result, {
            primaryScriptureCandidate: result.primaryScriptureCandidate,
            fallbackScriptureCandidate: result.fallbackScriptureCandidate,
          }),
        };

        await updateSegmentDescription(input.videoId, result.startTimestamp, {
          topicLabel: processed.topicLabel,
          summary: processed.summary,
        });
        processedResults.push(processed);
      }

      const updatedVideo = {
        ...video,
        segments: video.segments?.map(segment => {
          const processed = processedResults.find(
            result => result.startTimestamp === segment.startTimestamp,
          );

          if (!processed) {
            return segment;
          }

          return {
            ...segment,
            topicLabel: processed.topicLabel,
            summary: processed.summary,
          };
        }),
      };

      printSegmentReviewSummary(
        input.episodeNumber,
        updatedVideo.title,
        processedResults,
      );
      await generateHugoEpisode(updatedVideo);
      console.log(
        `\nSaved ${segmentResults.length} segment description(s) and regenerated Hugo page.`,
      );
      return;
    }

    if (!input.episodeTopic) {
      throw new Error("episodeTopic is required for episode-topic mode");
    }

    await setEpisodeTopic(input.videoId, input.episodeTopic);
    const updatedVideo = await getEpisodeByNumber(input.episodeNumber);
    if (!updatedVideo) {
      throw new Error(`Episode ${input.episodeNumber} not found after update`);
    }

    await generateHugoEpisode(updatedVideo);
    console.log(`Episode topic: ${input.episodeTopic}`);
    if (input.episodeTopicConfidence !== undefined) {
      console.log(`Confidence: ${input.episodeTopicConfidence}`);
    }
    console.log("\nSaved episode topic and regenerated Hugo page.");
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

await main();
