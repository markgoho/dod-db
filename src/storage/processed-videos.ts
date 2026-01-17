import { z } from "zod";
import type { SegmentType } from "../config/segment-patterns.js";
import { youtubeConfig } from "../config/youtube.js";
import {
  DETECTION_METHODS,
  type DetectionMethod,
} from "../pipeline/detect-segments.js";

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
  endTimestamp?: string; // undefined if segment extends to end
  confidence: "auto" | "verified";
  detectionMethod: DetectionMethod;
}

/**
 * Zod schema for EpisodeSegment validation.
 */
export const EpisodeSegmentSchema = z.object({
  type: z.string(),
  startTimestamp: z.string(),
  endTimestamp: z.string().optional(),
  confidence: z.enum(["auto", "verified"]),
  detectionMethod: z.enum(DETECTION_METHODS),
});

/**
 * Zod schema for VideoChapter validation.
 */
export const VideoChapterSchema = z.object({
  title: z.string(),
  startTime: z.number(),
});

export const ProcessedVideoSchema = z.object({
  videoId: z.string().describe("YouTube video ID"),
  title: z.string().describe("Video title"),
  publishedAt: z.string().describe("ISO 8601 publication date"),
  processedAt: z.string().describe("ISO 8601 processing timestamp"),
  transcriptPath: z.string().describe("Path to the transcript file"),
  episodeNumber: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Sequential episode number based on publishedAt"),
  tags: z
    .array(EpisodeTagSchema)
    .optional()
    .describe("Extracted tags with mention counts"),
  segments: z
    .array(EpisodeSegmentSchema)
    .optional()
    .describe("Detected audio segments"),
  speakers: z
    .array(z.string())
    .optional()
    .describe(
      'Array of speaker names in order of appearance (e.g., ["Dan McClellan", "Dan Beecher"])',
    ),
  chapters: z
    .array(VideoChapterSchema)
    .optional()
    .describe("YouTube chapters defined by the video uploader"),
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
    console.error("Error loading processed videos:", error);
    return [];
  }
}

/**
 * Save processed videos to JSON file.
 */
export async function saveProcessedVideos(
  videos: ProcessedVideo[],
): Promise<void> {
  const content = JSON.stringify(videos, undefined, 2);
  await Bun.write(youtubeConfig.processedVideosFile, content);
}

/**
 * Check if video has been processed.
 */
export async function isVideoProcessed(videoId: string): Promise<boolean> {
  const videos = await loadProcessedVideos();
  return videos.some(video => video.videoId === videoId);
}

/**
 * Add video to processed list with computed episode number.
 */
export async function markVideoAsProcessed(
  video: ProcessedVideo,
): Promise<number | undefined> {
  const videos = await loadProcessedVideos();

  // Check if already exists
  const exists = videos.some(v => v.videoId === video.videoId);
  if (exists) {
    console.warn(`Video ${video.videoId} already marked as processed`);
    return undefined;
  }

  videos.push(video);

  // Recompute episode numbers for entire list
  const withNumbers = computeEpisodeNumbers(videos);

  await saveProcessedVideos(withNumbers);

  // Log assigned episode number and return it
  const newVideo = withNumbers.find(v => v.videoId === video.videoId);
  if (newVideo?.episodeNumber) {
    console.log(`✓ Assigned episode number: ${newVideo.episodeNumber}`);
    return newVideo.episodeNumber;
  }
  return undefined;
}

/**
 * Extract episode number from video title if present.
 * Matches patterns like "Episode 69" or "Episode 1".
 * Returns undefined if no episode number found in title.
 */
function extractEpisodeNumberFromTitle(title: string): number | undefined {
  const match = title.match(/Episode\s+(\d+)/i);
  return match?.[1] ? Number.parseInt(match[1], 10) : undefined;
}

/**
 * Compute episode numbers for videos.
 * Prioritizes episode numbers from titles, then fills gaps sequentially.
 *
 * Algorithm:
 * 1. Extract episode numbers from titles (e.g., "Episode 69" → 69)
 * 2. For episodes without title numbers, assign sequential numbers filling gaps
 * 3. Respect manually-set episodeNumber fields (don't override)
 * 4. Sort by publishedAt for chronological ordering
 *
 * This handles cases where:
 * - Episodes are processed out of order
 * - Some episodes lack numbers in titles (special episodes)
 * - Episode numbers in titles are the authoritative source
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

  // First pass: Extract episode numbers from titles (authoritative source)
  const withTitleNumbers = sorted.map(video => {
    // If video already has a manually-set episodeNumber, respect it
    if (video.episodeNumber !== undefined) {
      return video;
    }

    // Try to extract episode number from title
    const titleNumber = extractEpisodeNumberFromTitle(video.title);
    if (titleNumber !== undefined) {
      return {
        ...video,
        episodeNumber: titleNumber,
      };
    }

    // No number in title yet - will assign in second pass
    return video;
  });

  // Find which episode numbers are already taken
  const takenNumbers = new Set(
    withTitleNumbers
      .map(v => v.episodeNumber)
      .filter((n): n is number => n !== undefined),
  );

  // Second pass: Assign sequential numbers to episodes without title numbers
  // Fill gaps in the sequence (e.g., if we have 1-15, 17-20, assign 16 to next unnumbered)
  let nextSequential = 1;
  const result = withTitleNumbers.map(video => {
    if (video.episodeNumber !== undefined) {
      return video;
    }

    // Find next available sequential number
    while (takenNumbers.has(nextSequential)) {
      nextSequential++;
    }

    const assignedNumber = nextSequential;
    takenNumbers.add(assignedNumber);
    nextSequential++;

    return {
      ...video,
      episodeNumber: assignedNumber,
    };
  });

  return result;
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
 * Update tags for an existing processed video.
 *
 * @param videoId - The video ID to update
 * @param tags - The new tags to set
 */
export async function updateVideoTags(
  videoId: string,
  tags: EpisodeTag[],
): Promise<void> {
  const videos = await loadProcessedVideos();

  const videoIndex = videos.findIndex(v => v.videoId === videoId);
  if (videoIndex === -1) {
    throw new Error(`Video ${videoId} not found in processed videos`);
  }

  const existingVideo = videos[videoIndex];
  if (!existingVideo) {
    throw new Error(`Video at index ${videoIndex} is undefined`);
  }

  videos[videoIndex] = {
    ...existingVideo,
    tags,
  };

  await saveProcessedVideos(videos);
}

/**
 * Get video by episode number.
 * Returns undefined if not found.
 */
export async function getVideoByEpisodeNumber(
  episodeNumber: number,
): Promise<ProcessedVideo | undefined> {
  const videos = await getProcessedVideosWithNumbers();
  return videos.find(v => v.episodeNumber === episodeNumber);
}

/**
 * Get episode number for a video ID.
 * Returns undefined if not found or not assigned.
 */
export async function getEpisodeNumber(
  videoId: string,
): Promise<number | undefined> {
  const videos = await getProcessedVideosWithNumbers();
  const video = videos.find(v => v.videoId === videoId);
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
  const index = videos.findIndex(v => v.videoId === videoId);

  const existingVideo = videos[index];
  if (index === -1 || !existingVideo) {
    throw new Error(`Video not found: ${videoId}`);
  }

  videos[index] = {
    ...existingVideo,
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
  return videos.find(v => v.videoId === videoId);
}

/**
 * Calculate Levenshtein distance (edit distance) between two strings.
 * Returns the minimum number of single-character edits needed to change one string into another.
 */
function levenshteinDistance(string1: string, string2: string): number {
  const length1 = string1.length;
  const length2 = string2.length;

  // Create distance matrix
  const matrix: number[][] = Array.from({ length: length1 + 1 }, () =>
    Array.from<number>({ length: length2 + 1 }).fill(0),
  );

  // Initialize first row and column
  for (let index = 0; index <= length1; index++) {
    matrix[index]![0] = index;
  }
  for (let index = 0; index <= length2; index++) {
    matrix[0]![index] = index;
  }

  // Fill matrix
  for (let index1 = 1; index1 <= length1; index1++) {
    for (let index2 = 1; index2 <= length2; index2++) {
      const cost = string1[index1 - 1] === string2[index2 - 1] ? 0 : 1;
      const previousRow = matrix[index1 - 1];
      const currentRow = matrix[index1];
      const previousCell = previousRow?.[index2];
      const leftCell = currentRow?.[index2 - 1];
      const diagonalCell = previousRow?.[index2 - 1];

      if (
        currentRow !== undefined &&
        previousCell !== undefined &&
        leftCell !== undefined &&
        diagonalCell !== undefined
      ) {
        currentRow[index2] = Math.min(
          previousCell + 1, // deletion
          leftCell + 1, // insertion
          diagonalCell + cost, // substitution
        );
      }
    }
  }

  const lastRow = matrix[length1];
  return lastRow?.[length2] ?? 0;
}

/**
 * Calculate similarity ratio between two strings (0-1, where 1 = identical).
 * Uses Levenshtein distance normalized by the length of the longer string.
 */
function calculateSimilarity(string1: string, string2: string): number {
  const maxLength = Math.max(string1.length, string2.length);
  if (maxLength === 0) return 1; // Both strings are empty

  const distance = levenshteinDistance(
    string1.toLowerCase(),
    string2.toLowerCase(),
  );
  return 1 - distance / maxLength;
}

/**
 * Check if a speaker name is similar to any existing speaker.
 * Returns the existing speaker name if similar, otherwise undefined.
 */
function findSimilarSpeaker(
  speakerName: string,
  existingSpeakers: string[],
  threshold: number = 0.85,
): string | undefined {
  for (const existing of existingSpeakers) {
    const similarity = calculateSimilarity(speakerName, existing);
    if (similarity >= threshold) {
      return existing;
    }
  }
  return undefined;
}

/**
 * Extract guest names from video title.
 * Looks for patterns like "with [Name]" or "With [Name]".
 * @param title - Video title
 * @returns Array of guest names found in title
 */
function extractGuestNamesFromTitle(title: string): string[] {
  const guests: string[] = [];

  // Pattern: "with Name" or "With Name" (case insensitive)
  // Captures everything after "with " until end or a delimiter
  const withPattern =
    /\bwith\s+([^,\n]+?)(?:\s+and\s+([^,\n]+?))?(?:\s*$|[,\n])/gi;
  let match = withPattern.exec(title);

  while (match !== null) {
    const guest1 = match[1]?.trim();
    const guest2 = match[2]?.trim();

    if (guest1) {
      // Clean up common artifacts
      const cleanedGuest1 = guest1
        .replace(/^(Prof\.|Dr\.|Professor|Doctor)\s+/i, "")
        .trim();
      if (cleanedGuest1) {
        guests.push(cleanedGuest1);
      }
    }

    if (guest2) {
      const cleanedGuest2 = guest2
        .replace(/^(Prof\.|Dr\.|Professor|Doctor)\s+/i, "")
        .trim();
      if (cleanedGuest2) {
        guests.push(cleanedGuest2);
      }
    }

    match = withPattern.exec(title);
  }

  return guests;
}

/**
 * Extracts unique speaker names from a transcript file in order of first appearance.
 * Filters out speaker names shorter than 5 characters to avoid malformed data.
 * Uses fuzzy matching to merge similar names (e.g., "Leanne" vs "Liane").
 * If videoTitle is provided, uses title as authoritative source for guest names.
 * @param transcriptPath - Path to the transcript file
 * @param videoTitle - Optional video title to extract authoritative guest names
 * @returns Array of speaker names, or empty array if file not found/empty
 */
export async function extractSpeakersFromTranscript(
  transcriptPath: string,
  videoTitle?: string,
): Promise<string[]> {
  try {
    const file = Bun.file(transcriptPath);
    const content = await file.text();

    if (!content.trim()) {
      return [];
    }

    // Extract guest names from title if provided
    const titleGuests = videoTitle
      ? extractGuestNamesFromTitle(videoTitle)
      : [];
    const hasTitleGuests = titleGuests.length > 0;

    // Host names to always include
    const hosts = ["Dan McClellan", "Dan Beecher"];

    // Match pattern: [HH:MM:SS] SpeakerName: or [HH:MM:SS.mmm] SpeakerName:
    const speakerRegex = /^\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\] (.+?):/gm;
    const speakers: string[] = [];
    const seen = new Set<string>();
    const minimumNameLength = 5; // Minimum length to avoid malformed entries like "[00"
    const similarityThreshold = 0.85; // Threshold for fuzzy matching (0-1)
    const minimumMentions = 50; // Minimum mentions to be considered a real speaker (filters clip speakers)

    // First pass: count all speaker mentions
    const speakerCounts = new Map<string, number>();
    let match = speakerRegex.exec(content);
    while (match !== null) {
      const speakerName = match[2]?.trim();
      if (speakerName && speakerName.length >= minimumNameLength) {
        speakerCounts.set(
          speakerName,
          (speakerCounts.get(speakerName) ?? 0) + 1,
        );
      }
      match = speakerRegex.exec(content);
    }

    // Reset regex for second pass
    speakerRegex.lastIndex = 0;

    // Second pass: extract speakers based on counts and rules
    match = speakerRegex.exec(content);
    while (match !== null) {
      const speakerName = match[2]?.trim();
      if (
        speakerName &&
        speakerName.length >= minimumNameLength &&
        !seen.has(speakerName)
      ) {
        // Check if this is one of the hosts
        const isHost = hosts.some(
          host => calculateSimilarity(speakerName, host) >= similarityThreshold,
        );

        if (isHost) {
          // Add host with their canonical name
          const canonicalHost = hosts.find(
            host =>
              calculateSimilarity(speakerName, host) >= similarityThreshold,
          );
          if (canonicalHost && !speakers.includes(canonicalHost)) {
            speakers.push(canonicalHost);
          }
          seen.add(speakerName);
        } else if (hasTitleGuests) {
          // If title explicitly mentions guests with "with [Name]", ONLY include those guests
          // This filters out speakers from clips (e.g., Jordan Peterson in episode 25)
          const titleGuest = findSimilarSpeaker(
            speakerName,
            titleGuests,
            similarityThreshold,
          );

          if (titleGuest) {
            // Use the title spelling as authoritative
            if (!speakers.includes(titleGuest)) {
              speakers.push(titleGuest);
            }
            seen.add(speakerName);
          } else {
            // Speaker not in title - skip (likely from clips)
            seen.add(speakerName);
          }
        } else {
          // No guests in title - use fuzzy matching + mention threshold
          // This handles episodes where guest isn't mentioned in title (e.g., episode 22)
          // Require minimum mentions to filter out clip speakers
          const mentionCount = speakerCounts.get(speakerName) ?? 0;
          if (mentionCount >= minimumMentions) {
            const similarSpeaker = findSimilarSpeaker(
              speakerName,
              speakers,
              similarityThreshold,
            );

            if (similarSpeaker) {
              // Name is similar to existing speaker - don't add, but track the variant
              seen.add(speakerName);
            } else {
              // New unique speaker with enough mentions
              speakers.push(speakerName);
              seen.add(speakerName);
            }
          } else {
            // Not enough mentions - likely from clips, skip
            seen.add(speakerName);
          }
        }
      }
      match = speakerRegex.exec(content);
    }

    return speakers;
  } catch (error) {
    console.warn(`Failed to extract speakers from ${transcriptPath}:`, error);
    return [];
  }
}

/**
 * Alias for loadProcessedVideos for consistency with other functions.
 */
export async function getProcessedVideos(): Promise<ProcessedVideo[]> {
  return loadProcessedVideos();
}
