import { mkdir, readdir } from "node:fs/promises";
import * as path from "node:path";

/**
 * Download audio from YouTube video using yt-dlp.
 * Downloads format 140 (128kbps AAC) for best quality and timestamp accuracy.
 * Returns local file path to the downloaded audio.
 */
export async function downloadAudio(
  videoId: string,
  outputDirectory: string,
): Promise<string> {
  // Ensure output directory exists
  await mkdir(outputDirectory, { recursive: true });

  // Let yt-dlp choose the extension based on format
  const outputTemplate = path.join(outputDirectory, `${videoId}.%(ext)s`);
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Use bestaudio to automatically select the highest quality audio format
  // This handles variations in available formats across different videos
  // (e.g., format 140 AAC, 251 Opus, or DRC variants)
  const proc = Bun.spawn([
    "yt-dlp",
    videoUrl,
    "-f",
    "bestaudio",
    "-o",
    outputTemplate,
  ]);

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`yt-dlp audio download failed with exit code ${exitCode}`);
  }

  // Find the actual downloaded file (could be .m4a, .webm, .opus, etc.)
  const files = await readdir(outputDirectory);
  const downloadedFile = files.find(
    f => f.startsWith(videoId) && f !== `${videoId}.mp3`,
  );

  if (!downloadedFile) {
    throw new Error(`Could not find downloaded audio file for ${videoId}`);
  }

  return path.join(outputDirectory, downloadedFile);
}
