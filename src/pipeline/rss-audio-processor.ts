import * as path from "node:path";
import { youtubeConfig } from "../config/youtube.js";
import type { PodcastRssItem } from "../rss/patreon-rss-item.js";
import { extractSpeakersFromTranscript } from "../storage/extract-speakers-from-transcript.js";
import { writeToFile } from "../storage/file.js";
import { getVideoById } from "../storage/get-video-by-id.js";
import { isVideoProcessed } from "../storage/is-video-processed.js";
import { markVideoAsProcessed } from "../storage/mark-video-as-processed.js";
import type { EpisodeSegment } from "../storage/processed-videos.js";
import { updateVideoScriptures } from "../storage/update-video-scriptures.js";
import { updateVideoTags } from "../storage/update-video-tags.js";
import { correctTranscript } from "./correct.js";
import {
  detectSegmentsFromAudio,
  getAudioDuration,
} from "./detect-segments.js";
import { downloadRssAudio } from "./download-rss-audio.js";
import { extractScripture } from "./extract-scripture.js";
import { extractTags } from "./extract-tags.js";
import { generateHugoEpisode } from "./generate-hugo-episode.js";
import { generateTranscriptFilename } from "./generate-transcript-filename.js";
import { identifySegmentTypes } from "./identify-segment-types.js";
import { identifySpeakers } from "./identify-speakers.js";
import { analyzeCorrections } from "./learn-corrections.js";
import { transcribeAudio, type TranscriptGranularity } from "./transcribe.js";

export interface ProcessRssEpisodeResult {
  videoId: string;
  transcriptPath: string;
  metadata: {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    channelTitle: string;
  };
  skipped?: boolean;
}

export interface ProcessRssEpisodeOptions {
  force?: boolean;
  startFrom?: "correct" | "segment-detection" | "extract-tags";
  transcriptGranularity?: TranscriptGranularity;
}

export async function processRssEpisode(
  rssItem: PodcastRssItem,
  options: ProcessRssEpisodeOptions = {},
): Promise<ProcessRssEpisodeResult> {
  if (!rssItem.enclosureUrl) {
    throw new Error("Cannot process RSS episode without enclosure URL");
  }

  const recordId = rssItem.guid;
  console.log(`Processing canonical RSS episode: ${rssItem.title}`);
  if (rssItem.itunesEpisode !== undefined) {
    console.log(`Episode number: ${rssItem.itunesEpisode}`);
  }
  console.log(`Record ID: ${recordId}`);

  if (!options.force && !options.startFrom) {
    const alreadyProcessed = await isVideoProcessed(recordId);
    if (alreadyProcessed) {
      console.log(
        `⊘ Episode ${rssItem.itunesEpisode} already processed. Use --force to reprocess.`,
      );
      return {
        videoId: recordId,
        transcriptPath: "",
        metadata: {
          id: recordId,
          title: rssItem.title,
          description: "",
          publishedAt: new Date(rssItem.pubDate).toISOString(),
          channelTitle: "",
        },
        skipped: true,
      };
    }
  } else if (options.force) {
    console.log("🔄 Force mode: reprocessing episode...");
  }

  const publishedAt = new Date(rssItem.pubDate).toISOString();
  const filename = generateTranscriptFilename(rssItem.title, publishedAt);
  const transcriptPath = path.join(youtubeConfig.transcriptDirectory, filename);
  const rawPath = transcriptPath.replace(".txt", "-raw.txt");
  const audioStem = `rss-${filename.replace(/\.txt$/, "")}`;
  const audioPath = path.join(youtubeConfig.audioDirectory, `${audioStem}.mp3`);

  let transcriptWithNames: string;

  if (options.startFrom === "correct") {
    console.log("Starting from correction stage...");
    const rawFile = Bun.file(rawPath);
    if (!(await rawFile.exists())) {
      throw new Error(
        `Cannot start from correct stage: raw transcript not found at ${rawPath}\n` +
          `Run without --start-from to process the full pipeline.`,
      );
    }
    transcriptWithNames = await rawFile.text();
    console.log(`Loaded existing raw transcript from: ${rawPath}`);
  } else {
    console.log("Downloading canonical audio...");
    const downloadedAudioPath = await downloadRssAudio(
      rssItem.enclosureUrl,
      youtubeConfig.audioDirectory,
      audioStem,
    );
    console.log(`Audio downloaded to: ${downloadedAudioPath}`);

    console.log("Transcribing audio...");
    const transcription = await transcribeAudio(downloadedAudioPath, {
      granularity: options.transcriptGranularity,
    });

    console.log("Identifying speakers...");
    const { transcript: identified } = await identifySpeakers(transcription, {
      title: rssItem.title,
    });
    transcriptWithNames = identified;

    console.log("Saving raw transcript...");
    await writeToFile(rawPath, transcriptWithNames);
    console.log(`Raw transcript saved to: ${rawPath}`);
  }

  console.log("Extracting speaker names...");
  const speakers = await extractSpeakersFromTranscript(rawPath, rssItem.title);
  console.log(`✓ Found ${speakers.length} speakers: ${speakers.join(", ")}`);

  console.log("Correcting transcript...");
  const correctedTranscript = await correctTranscript(transcriptWithNames);

  console.log("Writing final transcript...");
  await writeToFile(transcriptPath, correctedTranscript);
  console.log(`Final transcript saved to: ${transcriptPath}`);

  console.log("Detecting segments with audio jingle...");
  const audioDuration = await getAudioDuration(audioPath);

  const regularHosts = new Set(["Dan McClellan", "Dan Beecher"]);
  const hasGuest = speakers.some(speaker => !regularHosts.has(speaker));

  let segments: EpisodeSegment[];

  if (hasGuest) {
    console.log("⏭️ Guest episode detected, skipping segment detection");
    segments = [];
  } else {
    const detectedSegments = await detectSegmentsFromAudio({
      audioPath,
      durationSeconds: audioDuration ?? undefined,
    });

    const identifiedSegments = await identifySegmentTypes(
      detectedSegments,
      correctedTranscript,
    );

    segments = identifiedSegments.map(segment => ({
      type: segment.type,
      startTimestamp: segment.startTimestamp,
      endTimestamp: segment.endTimestamp,
      confidence: segment.confidence,
      detectionMethod: segment.detectionMethod,
    }));
    console.log(`✓ Detected ${segments.length} segments`);
  }

  console.log("Marking episode as processed...");
  const episodeNumber = await markVideoAsProcessed({
    videoId: recordId,
    audioUrl: rssItem.enclosureUrl,
    title: rssItem.title,
    publishedAt,
    processedAt: new Date().toISOString(),
    transcriptPath,
    tags: [],
    segments,
    speakers,
  });

  console.log("Extracting tags...");
  const tags = await extractTags(correctedTranscript, {
    enableLlmVerification: true,
    episodeNumber,
  });
  console.log(`✓ Extracted ${tags.length} tags`);
  await updateVideoTags(recordId, tags);

  console.log("Extracting scripture references...");
  const scriptures = await extractScripture(correctedTranscript, {
    enableLlmVerification: true,
    episodeContext: {
      videoId: recordId,
      title: rssItem.title,
      ...(episodeNumber !== undefined && { episodeNumber }),
    },
  });
  console.log(`✓ Extracted ${scriptures.length} scripture books`);
  await updateVideoScriptures(recordId, scriptures);

  await analyzeCorrections(transcriptWithNames, correctedTranscript, recordId);

  console.log("Generating Hugo episode page...");
  const updatedVideo = await getVideoById(recordId);
  if (updatedVideo) {
    await generateHugoEpisode(updatedVideo);
  }

  console.log("Done!");

  return {
    videoId: recordId,
    transcriptPath,
    metadata: {
      id: recordId,
      title: rssItem.title,
      description: "",
      publishedAt,
      channelTitle: "",
    },
  };
}
