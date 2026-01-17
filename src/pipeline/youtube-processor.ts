import * as path from "node:path";
import { youtubeConfig } from "../config/youtube.js";
import { writeToFile } from "../storage/file.js";
import {
  extractSpeakersFromTranscript,
  getVideoById,
  isVideoProcessed,
  markVideoAsProcessed,
  updateVideoSegments,
  updateVideoTags,
  type EpisodeSegment,
} from "../storage/processed-videos.js";
import { correctTranscript } from "./correct.js";
import {
  detectSegmentsFromAudio,
  getAudioDuration,
} from "./detect-segments.js";
import { extractTags } from "./extract-tags.js";
import { generateHugoEpisode } from "./generate-hugo-episode.js";
import { identifySegmentTypes } from "./identify-segment-types.js";
import { identifySpeakers } from "./identify-speakers.js";
import { analyzeCorrections } from "./learn-corrections.js";
import { transcribeAudio } from "./transcribe.js";
import {
  downloadAudio,
  extractVideoId,
  fetchVideoMetadata,
  generateTranscriptFilename,
  type VideoMetadata,
} from "./youtube.js";

export interface ProcessYouTubeVideoResult {
  videoId: string;
  transcriptPath: string;
  metadata: VideoMetadata;
  skipped?: boolean;
}

export interface ProcessYouTubeVideoOptions {
  force?: boolean;
  startFrom?: "correct" | "segment-detection" | "extract-tags";
}

/**
 * Process a YouTube video end-to-end:
 * 1. Extract video ID and check if already processed (unless force=true)
 * 2. Fetch metadata using yt-dlp
 * 3. Download audio
 * 4. Transcribe via AssemblyAI
 * 5. Correct transcript
 * 6. Identify speakers (with YouTube metadata context)
 * 7. Write to file with proper naming
 * 8. Update processed videos tracking
 */
export async function processYouTubeVideo(
  videoUrl: string,
  options: ProcessYouTubeVideoOptions = {},
): Promise<ProcessYouTubeVideoResult> {
  console.log(`Processing YouTube video: ${videoUrl}`);

  // Extract video ID from URL
  const videoId = extractVideoId(videoUrl);
  console.log(`Video ID: ${videoId}`);

  // Check if already processed (unless force=true or startFrom is specified)
  if (!options.force && !options.startFrom) {
    const alreadyProcessed = await isVideoProcessed(videoId);
    if (alreadyProcessed) {
      console.log(
        `⊘ Video ${videoId} already processed. Use --force to reprocess.`,
      );
      return {
        videoId,
        transcriptPath: "",
        metadata: {
          id: videoId,
          title: "",
          description: "",
          publishedAt: "",
          channelTitle: "",
        },
        skipped: true,
      };
    }
  } else if (options.force) {
    console.log("🔄 Force mode: reprocessing video...");
  }

  // Handle segment-detection stage (early return - only updates segments)
  if (options.startFrom === "segment-detection") {
    console.log("Starting from segment detection stage...");

    const existingVideo = await getVideoById(videoId);
    if (!existingVideo) {
      throw new Error(
        `Cannot start from segment-detection stage: video ${videoId} not found in processed-videos.json\n` +
          `Run without --start-from to process the full pipeline.`,
      );
    }

    const transcriptFile = Bun.file(existingVideo.transcriptPath);
    if (!(await transcriptFile.exists())) {
      throw new Error(
        `Cannot start from segment-detection stage: transcript not found at ${existingVideo.transcriptPath}`,
      );
    }

    const correctedTranscript = await transcriptFile.text();
    console.log(
      `Loaded existing transcript from: ${existingVideo.transcriptPath}`,
    );

    // Check if this is a guest episode
    const regularHosts = new Set(["Dan McClellan", "Dan Beecher"]);
    const speakers = existingVideo.speakers ?? [];
    const hasGuest = speakers.some(speaker => !regularHosts.has(speaker));

    // Preserve any verified segments from existing data
    const existingSegments = existingVideo.segments ?? [];
    const verifiedSegments = existingSegments.filter(
      s => s.confidence === "verified",
    );

    if (verifiedSegments.length > 0) {
      console.log(
        `📌 Preserving ${verifiedSegments.length} verified segment(s)`,
      );
    }

    if (hasGuest) {
      // Guest episodes typically don't have recurring segments - skip detection entirely
      console.log("⏭️ Guest episode detected, keeping existing segments");
      // Don't update segments at all for guest episodes
      return {
        videoId,
        transcriptPath: existingVideo.transcriptPath,
        metadata: {
          id: videoId,
          title: existingVideo.title,
          description: "",
          publishedAt: existingVideo.publishedAt,
          channelTitle: "",
        },
      };
    }

    // Detect segments using audio jingle
    console.log("Detecting segments with audio jingle...");
    const audioDuration = await getAudioDuration(videoId);
    const detectedSegments = await detectSegmentsFromAudio({
      videoId,
      durationSeconds: audioDuration ?? undefined,
    });

    // Identify segment types from transcript context
    const identifiedSegments = await identifySegmentTypes(
      detectedSegments,
      correctedTranscript,
    );

    const newSegments: EpisodeSegment[] = identifiedSegments.map(s => ({
      type: s.type,
      startTimestamp: s.startTimestamp,
      endTimestamp: s.endTimestamp,
      confidence: s.confidence,
      detectionMethod: s.detectionMethod,
    }));
    console.log(`✓ Detected ${newSegments.length} segments`);

    // Merge: keep verified segments, replace auto-detected ones
    // Use verified segments as the base, then add new segments that don't conflict
    const segments: EpisodeSegment[] =
      verifiedSegments.length > 0
        ? (verifiedSegments as EpisodeSegment[])
        : newSegments;

    // Update only segments
    await updateVideoSegments(videoId, segments);
    console.log("Done!");

    return {
      videoId,
      transcriptPath: existingVideo.transcriptPath,
      metadata: {
        id: videoId,
        title: existingVideo.title,
        description: "",
        publishedAt: existingVideo.publishedAt,
        channelTitle: "",
      },
    };
  }

  // Handle extract-tags stage (early return - only updates tags)
  if (options.startFrom === "extract-tags") {
    console.log("Starting from tag extraction stage...");

    const existingVideo = await getVideoById(videoId);
    if (!existingVideo) {
      throw new Error(
        `Cannot start from extract-tags stage: video ${videoId} not found in processed-videos.json\n` +
          `Run without --start-from to process the full pipeline.`,
      );
    }

    const transcriptFile = Bun.file(existingVideo.transcriptPath);
    if (!(await transcriptFile.exists())) {
      throw new Error(
        `Cannot start from extract-tags stage: transcript not found at ${existingVideo.transcriptPath}`,
      );
    }

    const correctedTranscript = await transcriptFile.text();
    console.log(
      `Loaded existing transcript from: ${existingVideo.transcriptPath}`,
    );

    // Extract tags
    console.log("Extracting tags...");
    const tags = await extractTags(correctedTranscript, {
      enableLlmVerification: true,
      episodeNumber: existingVideo.episodeNumber,
    });
    console.log(`✓ Extracted ${tags.length} tags`);

    // Update video with extracted tags
    await updateVideoTags(videoId, tags);
    console.log("Done!");

    return {
      videoId,
      transcriptPath: existingVideo.transcriptPath,
      metadata: {
        id: videoId,
        title: existingVideo.title,
        description: "",
        publishedAt: existingVideo.publishedAt,
        channelTitle: "",
      },
    };
  }

  // Fetch metadata
  console.log("Fetching video metadata...");
  const metadata = await fetchVideoMetadata(videoId);
  console.log(`Title: ${metadata.title}`);
  console.log(`Published: ${metadata.publishedAt}`);

  // Generate filename early (needed for both normal and resume paths)
  const filename = generateTranscriptFilename(
    metadata.title,
    metadata.publishedAt,
  );
  const transcriptPath = path.join(youtubeConfig.transcriptDirectory, filename);
  const rawPath = transcriptPath.replace(".txt", "-raw.txt");

  let transcriptWithNames: string;

  if (options.startFrom === "correct") {
    // Resume from correction stage - load existing raw transcript
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
    // Normal flow: download → transcribe → identify → save raw
    console.log("Downloading audio...");
    const audioPath = await downloadAudio(
      videoId,
      youtubeConfig.audioDirectory,
    );
    console.log(`Audio downloaded to: ${audioPath}`);

    console.log("Transcribing audio...");
    const transcription = await transcribeAudio(audioPath);

    console.log("Identifying speakers...");
    const { transcript: identified } = await identifySpeakers(transcription, {
      title: metadata.title,
      description: metadata.description,
    });
    transcriptWithNames = identified;

    console.log("Saving raw transcript...");
    await writeToFile(rawPath, transcriptWithNames);
    console.log(`Raw transcript saved to: ${rawPath}`);
  }

  // Extract speakers from the raw transcript (early stage - before correction)
  console.log("Extracting speaker names...");
  const speakers = await extractSpeakersFromTranscript(rawPath, metadata.title);
  console.log(`✓ Found ${speakers.length} speakers: ${speakers.join(", ")}`);

  // Correct transcript
  console.log("Correcting transcript...");
  const correctedTranscript = await correctTranscript(transcriptWithNames);

  // Write final transcript (this is the one we commit)
  console.log("Writing final transcript...");
  await writeToFile(transcriptPath, correctedTranscript);
  console.log(`Final transcript saved to: ${transcriptPath}`);

  // Detect segments using audio jingle
  console.log("Detecting segments with audio jingle...");
  const audioDuration = await getAudioDuration(videoId);

  // Check if this is a guest episode (has speakers other than the regular hosts)
  const regularHosts = new Set(["Dan McClellan", "Dan Beecher"]);
  const hasGuest = speakers.some(speaker => !regularHosts.has(speaker));

  let segments: EpisodeSegment[];

  if (hasGuest) {
    // Guest episodes typically don't have recurring segments - skip audio detection
    console.log("⏭️ Guest episode detected, skipping segment detection");
    segments = [];
  } else {
    // Regular episode: detect segments and identify types
    const detectedSegments = await detectSegmentsFromAudio({
      videoId,
      durationSeconds: audioDuration ?? undefined,
    });

    // Identify segment types from transcript context
    const identifiedSegments = await identifySegmentTypes(
      detectedSegments,
      correctedTranscript,
    );

    segments = identifiedSegments.map(s => ({
      type: s.type,
      startTimestamp: s.startTimestamp,
      endTimestamp: s.endTimestamp,
      confidence: s.confidence,
      detectionMethod: s.detectionMethod,
    }));
    console.log(`✓ Detected ${segments.length} segments`);
  }

  // Mark as processed FIRST to get episode number assigned
  console.log("Marking video as processed...");
  const episodeNumber = await markVideoAsProcessed({
    videoId,
    title: metadata.title,
    publishedAt: metadata.publishedAt,
    processedAt: new Date().toISOString(),
    transcriptPath,
    tags: [], // Empty initially
    segments,
    speakers,
    ...(metadata.chapters !== undefined && { chapters: metadata.chapters }),
  });

  // Extract tags from corrected transcript (now with episode number for newly discovered tags)
  console.log("Extracting tags...");
  const tags = await extractTags(correctedTranscript, {
    enableLlmVerification: true, // Enable LLM verification for ambiguous tags (e.g., "David", "John")
    episodeNumber, // Tag newly discovered tags with episode number
  });
  console.log(`✓ Extracted ${tags.length} tags`);

  // Update video with extracted tags
  await updateVideoTags(videoId, tags);

  // Analyze corrections for learning (compare raw vs corrected)
  await analyzeCorrections(transcriptWithNames, correctedTranscript, videoId);

  // Generate Hugo episode page
  console.log("Generating Hugo episode page...");
  const updatedVideo = await getVideoById(videoId);
  if (updatedVideo) {
    await generateHugoEpisode(updatedVideo);
  }

  console.log("Done!");

  return {
    videoId,
    transcriptPath,
    metadata,
  };
}
