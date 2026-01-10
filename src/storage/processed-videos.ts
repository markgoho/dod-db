import { z } from 'zod';
import { youtubeConfig } from '../config/youtube.js';

export const ProcessedVideoSchema = z.object({
  videoId: z.string(),
  title: z.string(),
  publishedAt: z.string(),
  processedAt: z.string(),
  transcriptPath: z.string(),
});

export type ProcessedVideo = z.infer<typeof ProcessedVideoSchema>;

/**
 * Load processed videos from JSON file.
 * Returns empty array if file doesn't exist.
 */
export async function loadProcessedVideos(): Promise<ProcessedVideo[]> {
  try {
    const file = Bun.file(youtubeConfig.processedVideosFile);
    const exists = await file.exists();

    if (!exists) {
      return [];
    }

    const content = await file.text();
    const data = JSON.parse(content);

    // Validate array of videos
    return z.array(ProcessedVideoSchema).parse(data);
  } catch (error) {
    console.error('Error loading processed videos:', error);
    return [];
  }
}

/**
 * Save processed videos to JSON file.
 */
export async function saveProcessedVideos(
  videos: ProcessedVideo[],
): Promise<void> {
  const content = JSON.stringify(videos, null, 2);
  await Bun.write(youtubeConfig.processedVideosFile, content);
}

/**
 * Check if video has been processed.
 */
export async function isVideoProcessed(videoId: string): Promise<boolean> {
  const videos = await loadProcessedVideos();
  return videos.some((video) => video.videoId === videoId);
}

/**
 * Add video to processed list.
 */
export async function markVideoAsProcessed(
  video: ProcessedVideo,
): Promise<void> {
  const videos = await loadProcessedVideos();

  // Check if already exists
  const exists = videos.some((v) => v.videoId === video.videoId);
  if (exists) {
    console.warn(`Video ${video.videoId} already marked as processed`);
    return;
  }

  videos.push(video);
  await saveProcessedVideos(videos);
}
