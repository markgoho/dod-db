import { youtubeConfig } from "../config/youtube.js";
import type { ProcessedVideo } from "./processed-videos.js";

export async function saveProcessedVideos(
  videos: ProcessedVideo[],
): Promise<void> {
  const filePath = youtubeConfig.processedVideosFile;
  await Bun.write(filePath, JSON.stringify(videos, undefined, 2));

  const result = Bun.spawnSync(["bunx", "prettier", "--write", filePath]);
  if (result.exitCode !== 0) {
    console.warn(`prettier failed on ${filePath}: ${result.stderr.toString()}`);
  }
}
