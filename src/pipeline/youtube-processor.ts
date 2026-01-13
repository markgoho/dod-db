import * as path from 'node:path';
import { youtubeConfig } from '../config/youtube.js';
import {
  downloadAudio,
  extractVideoId,
  fetchVideoMetadata,
  generateTranscriptFilename,
  type VideoMetadata,
} from './youtube.js';
import { transcribeAudio } from './transcribe.js';
import { correctTranscript } from './correct.js';
import { identifySpeakers } from './identify-speakers.js';
import { extractTags } from './extract-tags.js';
import { analyzeCorrections } from './learn-corrections.js';
import { detectSegments, getAudioDuration } from './detect-segments.js';
import { writeToFile } from '../storage/file.js';
import {
  isVideoProcessed,
  markVideoAsProcessed,
  getVideoById,
  updateVideoSegments,
  type EpisodeSegment,
} from '../storage/processed-videos.js';

export interface ProcessYouTubeVideoResult {
  videoId: string;
  transcriptPath: string;
  metadata: VideoMetadata;
  skipped?: boolean;
}

export interface ProcessYouTubeVideoOptions {
  force?: boolean;
  startFrom?: 'correct' | 'segment-detection';
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
        transcriptPath: '',
        metadata: {
          id: videoId,
          title: '',
          description: '',
          publishedAt: '',
          channelTitle: '',
        },
        skipped: true,
      };
    }
  } else if (options.force) {
    console.log('🔄 Force mode: reprocessing video...');
  }

  // Handle segment-detection stage (early return - only updates segments)
  if (options.startFrom === 'segment-detection') {
    console.log('Starting from segment detection stage...');

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
    console.log(`Loaded existing transcript from: ${existingVideo.transcriptPath}`);

    // Detect segments
    console.log('Detecting segments...');
    const audioDuration = await getAudioDuration(videoId);
    const detectedSegments = detectSegments(correctedTranscript, audioDuration ?? undefined);
    const segments: EpisodeSegment[] = detectedSegments.map((s) => ({
      type: s.type,
      startTimestamp: s.startTimestamp,
      endTimestamp: s.endTimestamp,
      confidence: s.confidence,
      detectionMethod: s.detectionMethod,
    }));
    console.log(`✓ Detected ${segments.length} segments`);

    // Update only segments
    await updateVideoSegments(videoId, segments);
    console.log('Done!');

    return {
      videoId,
      transcriptPath: existingVideo.transcriptPath,
      metadata: {
        id: videoId,
        title: existingVideo.title,
        description: '',
        publishedAt: existingVideo.publishedAt,
        channelTitle: '',
      },
    };
  }

  // Fetch metadata
  console.log('Fetching video metadata...');
  const metadata = await fetchVideoMetadata(videoId);
  console.log(`Title: ${metadata.title}`);
  console.log(`Published: ${metadata.publishedAt}`);

  // Generate filename early (needed for both normal and resume paths)
  const filename = generateTranscriptFilename(
    metadata.title,
    metadata.publishedAt,
  );
  const transcriptPath = path.join(youtubeConfig.transcriptDirectory, filename);
  const rawPath = transcriptPath.replace('.txt', '-raw.txt');

  let transcriptWithNames: string;

  if (options.startFrom === 'correct') {
    // Resume from correction stage - load existing raw transcript
    console.log('Starting from correction stage...');
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
    console.log('Downloading audio...');
    const audioPath = await downloadAudio(
      videoId,
      youtubeConfig.audioDirectory,
    );
    console.log(`Audio downloaded to: ${audioPath}`);

    console.log('Transcribing audio...');
    const transcription = await transcribeAudio(audioPath);

    console.log('Identifying speakers...');
    const { transcript: identified } = await identifySpeakers(transcription, {
      title: metadata.title,
      description: metadata.description,
    });
    transcriptWithNames = identified;

    console.log('Saving raw transcript...');
    await writeToFile(rawPath, transcriptWithNames);
    console.log(`Raw transcript saved to: ${rawPath}`);
  }

  // Correct transcript
  console.log('Correcting transcript...');
  const correctedTranscript = await correctTranscript(transcriptWithNames);

  // Write final transcript (this is the one we commit)
  console.log('Writing final transcript...');
  await writeToFile(transcriptPath, correctedTranscript);
  console.log(`Final transcript saved to: ${transcriptPath}`);

  // Extract tags from corrected transcript
  console.log('Extracting tags...');
  const tags = await extractTags(correctedTranscript);
  console.log(`✓ Extracted ${tags.length} tags`);

  // Analyze corrections for learning (compare raw vs corrected)
  await analyzeCorrections(transcriptWithNames, correctedTranscript, videoId);

  // Detect segments in the corrected transcript
  console.log('Detecting segments...');
  const audioDuration = await getAudioDuration(videoId);
  const detectedSegments = detectSegments(correctedTranscript, audioDuration ?? undefined);
  const segments: EpisodeSegment[] = detectedSegments.map((s) => ({
    type: s.type,
    startTimestamp: s.startTimestamp,
    endTimestamp: s.endTimestamp,
    confidence: s.confidence,
    detectionMethod: s.detectionMethod,
  }));
  console.log(`✓ Detected ${segments.length} segments`);

  // Mark as processed with tags and segments
  await markVideoAsProcessed({
    videoId,
    title: metadata.title,
    publishedAt: metadata.publishedAt,
    processedAt: new Date().toISOString(),
    transcriptPath,
    tags,
    segments,
  });

  console.log('Done!');

  return {
    videoId,
    transcriptPath,
    metadata,
  };
}
