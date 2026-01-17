import { youtubeConfig } from "../config/youtube.js";
import type { ProcessedVideo } from "./processed-videos.js";

/**
 * Load processed videos from JSON file.
 * Returns empty array if file doesn't exist.
 */
export async function loadProcessedVideos(): Promise<ProcessedVideo[]> {
  try {
    const file = Bun.file(youtubeConfig.processedVideosFile);
    const exists = await file.exists();

    if (!exists) {
      console.log(
        "No processed videos file found. Starting with empty array.",
      );
      return [];
    }

    const data = await file.json();
    return data as ProcessedVideo[];
  } catch (error) {
    console.error("Error loading processed videos:", error);
    return [];
  }
}
