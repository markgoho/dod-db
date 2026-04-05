import type { VideoChapter, VideoMetadata } from "./youtube.js";

interface RawVideoMetadata {
  title?: string;
  description?: string;
  upload_date?: string;
  uploader?: string;
  chapters?: { title: string; start_time: number }[];
  fps?: number;
  vcodec?: string;
}

export async function fetchRawVideoMetadata(
  videoId: string,
): Promise<RawVideoMetadata> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const proc = Bun.spawn(["yt-dlp", videoUrl, "--dump-json", "--no-playlist"]);

  const metadata = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`yt-dlp failed with exit code ${exitCode}`);
  }

  return JSON.parse(metadata) as RawVideoMetadata;
}

/**
 * Fetch video metadata using yt-dlp.
 */
export async function fetchVideoMetadata(
  videoId: string,
): Promise<VideoMetadata> {
  const data = await fetchRawVideoMetadata(videoId);

  // Extract chapters if available (YouTube uploader-defined chapters)
  const chapters: VideoChapter[] | undefined = data.chapters
    ? data.chapters.map(chapter => ({
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
    ...(typeof data.fps === "number" ? { fps: data.fps } : {}),
    ...(typeof data.vcodec === "string" ? { vcodec: data.vcodec } : {}),
  };
}
