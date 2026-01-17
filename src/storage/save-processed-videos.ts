import { youtubeConfig } from "../config/youtube.js";
import type { ProcessedVideo } from "./processed-videos.js";

/**
 * Save processed videos to JSON file.
 */
export async function saveProcessedVideos(
  videos: ProcessedVideo[],
): Promise<void> {
  await Bun.write(
    youtubeConfig.processedVideosFile,
    JSON.stringify(videos, undefined, 2),
  );
}
