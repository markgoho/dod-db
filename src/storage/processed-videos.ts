import { z } from 'zod';
import { youtubeConfig } from '../config/youtube.js';
import type { SegmentType } from '../config/segment-patterns.js';

/**
 * Tag on an episode with mention count.
 * Distinct from TagDefinition in tag-vocabulary.ts.
 */
export interface EpisodeTag {
	tag: string; // Canonical tag name: "Moses", "Septuagint"
	mentions: number; // Count of mentions in this episode
}

/**
 * Zod schema for EpisodeTag validation.
 */
export const EpisodeTagSchema = z.object({
	tag: z.string(),
	mentions: z.number().int().positive(),
});

/**
 * A detected segment in an episode.
 */
export interface EpisodeSegment {
	type: SegmentType;
	startTimestamp: string; // "[HH:MM:SS.mmm]" format
	endTimestamp: string | null; // null if segment extends to end
	confidence: 'auto' | 'verified';
	detectionMethod: 'pattern' | 'llm' | 'manual';
}

/**
 * Zod schema for EpisodeSegment validation.
 */
export const EpisodeSegmentSchema = z.object({
	type: z.string(),
	startTimestamp: z.string(),
	endTimestamp: z.string().nullable(),
	confidence: z.enum(['auto', 'verified']),
	detectionMethod: z.enum(['pattern', 'llm', 'manual']),
});

export const ProcessedVideoSchema = z.object({
	videoId: z.string(),
	title: z.string(),
	publishedAt: z.string(),
	processedAt: z.string(),
	transcriptPath: z.string(),
	episodeNumber: z.number().int().positive().optional(),
	tags: z.array(EpisodeTagSchema).optional(),
	segments: z.array(EpisodeSegmentSchema).optional(),
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
 * Add video to processed list with computed episode number.
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

  // Recompute episode numbers for entire list
  const withNumbers = computeEpisodeNumbers(videos);

  await saveProcessedVideos(withNumbers);

  // Log assigned episode number
  const newVideo = withNumbers.find((v) => v.videoId === video.videoId);
  if (newVideo?.episodeNumber) {
    console.log(`✓ Assigned episode number: ${newVideo.episodeNumber}`);
  }
}

/**
 * Compute episode numbers for videos based on publishedAt date order.
 * Only fills missing episodeNumber fields (respects manual overrides).
 *
 * Algorithm:
 * - Sort by publishedAt ascending (earliest = Episode 1)
 * - Use videoId as tiebreaker for identical dates (lexicographic order)
 * - Skip videos with existing episodeNumber (manual overrides)
 * - Assign sequential numbers starting from 1
 */
export function computeEpisodeNumbers(
  videos: ProcessedVideo[],
): ProcessedVideo[] {
  // Sort by publishedAt (ascending), then videoId for determinism
  const sorted = [...videos].sort((a, b) => {
    const dateCompare = a.publishedAt.localeCompare(b.publishedAt);
    if (dateCompare !== 0) return dateCompare;
    return a.videoId.localeCompare(b.videoId); // Tiebreaker
  });

  // Assign sequential numbers only to entries without episodeNumber
  let nextNumber = 1;
  return sorted.map((video) => {
    if (video.episodeNumber !== undefined) {
      return video; // Respect manual override
    }
    return {
      ...video,
      episodeNumber: nextNumber++,
    };
  });
}

/**
 * Get all processed videos with episode numbers computed.
 */
export async function getProcessedVideosWithNumbers(): Promise<
  ProcessedVideo[]
> {
  const videos = await loadProcessedVideos();
  return computeEpisodeNumbers(videos);
}

/**
 * Get video by episode number.
 * Returns undefined if not found.
 */
export async function getVideoByEpisodeNumber(
  episodeNumber: number,
): Promise<ProcessedVideo | undefined> {
  const videos = await getProcessedVideosWithNumbers();
  return videos.find((v) => v.episodeNumber === episodeNumber);
}

/**
 * Get episode number for a video ID.
 * Returns undefined if not found or not assigned.
 */
export async function getEpisodeNumber(
  videoId: string,
): Promise<number | undefined> {
  const videos = await getProcessedVideosWithNumbers();
  const video = videos.find((v) => v.videoId === videoId);
  return video?.episodeNumber;
}

/**
 * Update segments for a video.
 * Creates or replaces the segments array for the specified video.
 */
export async function updateVideoSegments(
  videoId: string,
  segments: EpisodeSegment[],
): Promise<void> {
  const videos = await loadProcessedVideos();
  const index = videos.findIndex((v) => v.videoId === videoId);

  if (index === -1) {
    throw new Error(`Video not found: ${videoId}`);
  }

  videos[index] = {
    ...videos[index],
    segments,
  };

  await saveProcessedVideos(videos);
}

/**
 * Get video by videoId.
 * Returns undefined if not found.
 */
export async function getVideoById(
  videoId: string,
): Promise<ProcessedVideo | undefined> {
  const videos = await loadProcessedVideos();
  return videos.find((v) => v.videoId === videoId);
}
