import type { VideoMetadata, VideoChapter } from "./youtube.js";

/**
 * Fetch video metadata using yt-dlp.
 */
export async function fetchVideoMetadata(
  videoId: string,
): Promise<VideoMetadata> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const proc = Bun.spawn(["yt-dlp", videoUrl, "--dump-json", "--no-playlist"]);

  const metadata = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`yt-dlp failed with exit code ${exitCode}`);
  }

  const data = JSON.parse(metadata);

  // Extract chapters if available (YouTube uploader-defined chapters)
  const chapters: VideoChapter[] | undefined = data.chapters
    ? data.chapters.map((chapter: { title: string; start_time: number }) => ({
        title: chapter.title,
        startTime: chapter.start_time,
      }))
    : undefined;

  return {
    id: videoId,
    title: data.title || "Untitled",
    description: data.description || "",
    publishedAt: data.upload_date
      ? `${data.upload_date.slice(0, 4)}-${data.upload_date.slice(4, 6)}-${data.upload_date.slice(6, 8)}T00:00:00Z`
      : new Date().toISOString(),
    channelTitle: data.uploader || "",
    ...(chapters !== undefined && { chapters }),
  };
}
