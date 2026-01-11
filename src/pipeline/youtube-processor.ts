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
import { writeToFile } from '../storage/file.js';
import {
  isVideoProcessed,
  markVideoAsProcessed,
} from '../storage/processed-videos.js';

export interface ProcessYouTubeVideoResult {
  videoId: string;
  transcriptPath: string;
  metadata: VideoMetadata;
  skipped?: boolean;
}

export interface ProcessYouTubeVideoOptions {
  force?: boolean;
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

  // Check if already processed (unless force=true)
  if (!options.force) {
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

  // Fetch metadata
  console.log('Fetching video metadata...');
  const metadata = await fetchVideoMetadata(videoId);
  console.log(`Title: ${metadata.title}`);
  console.log(`Published: ${metadata.publishedAt}`);

  // Download audio
  console.log('Downloading audio...');
  const audioPath = await downloadAudio(videoId, youtubeConfig.audioDirectory);
  console.log(`Audio downloaded to: ${audioPath}`);

  // Transcribe audio
  console.log('Transcribing audio...');
  const transcription = await transcribeAudio(audioPath);

  // Identify speakers first (so raw has speaker names)
  console.log('Identifying speakers...');
  const { transcript: transcriptWithNames } = await identifySpeakers(
    transcription,
    {
      title: metadata.title,
      description: metadata.description,
    },
  );

  // Generate filename
  const filename = generateTranscriptFilename(
    metadata.title,
    metadata.publishedAt,
  );
  const transcriptPath = path.join(youtubeConfig.transcriptDirectory, filename);

  // Save raw transcript with speaker names (for learning comparisons, not committed)
  const rawPath = transcriptPath.replace('.txt', '-raw.txt');
  console.log('Saving raw transcript...');
  await writeToFile(rawPath, transcriptWithNames);
  console.log(`Raw transcript saved to: ${rawPath}`);

  // Correct transcript
  console.log('Correcting transcript...');
  const correctedTranscript = await correctTranscript(transcriptWithNames);

  // Write final transcript (this is the one we commit)
  console.log('Writing final transcript...');
  await writeToFile(transcriptPath, correctedTranscript);
  console.log(`Final transcript saved to: ${transcriptPath}`);

  // Mark as processed
  await markVideoAsProcessed({
    videoId,
    title: metadata.title,
    publishedAt: metadata.publishedAt,
    processedAt: new Date().toISOString(),
    transcriptPath,
  });

  console.log('Done!');

  return {
    videoId,
    transcriptPath,
    metadata,
  };
}
