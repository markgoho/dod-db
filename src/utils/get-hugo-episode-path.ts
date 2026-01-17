import * as path from "node:path";
import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { getEpisodeOutputPath } from "../hugo/get-episode-path.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";

/**
 * Get the Hugo episode file path for a processed video.
 * Uses the same slug generation logic as the episode generator.
 *
 * @param video - ProcessedVideo object with title and speakers
 * @returns Absolute path to the Hugo episode markdown file
 */
export function getHugoEpisodePath(video: ProcessedVideo): string {
  const cleanTitle = extractCleanTitle(video.title);
  const relativePath = getEpisodeOutputPath(video, cleanTitle);
  return path.join(process.cwd(), relativePath);
}
