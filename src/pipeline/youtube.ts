import { formatDate, titleToSlug } from '../utils/slugify.js';
import * as path from 'node:path';
import { mkdir, readdir } from 'node:fs/promises';

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
}

/**
 * Fetch video metadata using yt-dlp.
 */
export async function fetchVideoMetadata(
  videoId: string,
): Promise<VideoMetadata> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const proc = Bun.spawn(['yt-dlp', videoUrl, '--dump-json', '--no-playlist']);

  const metadata = await new Response(proc.stdout).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`yt-dlp failed with exit code ${exitCode}`);
  }

  const data = JSON.parse(metadata);

  return {
    id: videoId,
    title: data.title || 'Untitled',
    description: data.description || '',
    publishedAt: data.upload_date
      ? `${data.upload_date.slice(0, 4)}-${data.upload_date.slice(4, 6)}-${data.upload_date.slice(6, 8)}T00:00:00Z`
      : new Date().toISOString(),
    channelTitle: data.uploader || '',
  };
}

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
    'yt-dlp',
    videoUrl,
    '-f',
    'bestaudio',
    '-o',
    outputTemplate,
  ]);

  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`yt-dlp audio download failed with exit code ${exitCode}`);
  }

  // Find the actual downloaded file (could be .m4a, .webm, .opus, etc.)
  const files = await readdir(outputDirectory);
  const downloadedFile = files.find(
    (f) => f.startsWith(videoId) && f !== `${videoId}.mp3`,
  );

  if (!downloadedFile) {
    throw new Error(`Could not find downloaded audio file for ${videoId}`);
  }

  return path.join(outputDirectory, downloadedFile);
}

/**
 * Extract video ID from various YouTube URL formats.
 * Supports:
 * - youtube.com/watch?v=ID
 * - youtu.be/ID
 * - youtube.com/embed/ID
 * - youtube.com/v/ID
 */
export function extractVideoId(url: string): string {
  // Try various YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  // If no pattern matches, check if the input is already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  throw new Error(
    `Invalid YouTube URL or video ID: ${url}\n` +
      'Expected format: https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID',
  );
}

/**
 * Generate transcript filename from title and publish date.
 * Format: YYYY-MM-DD-title-slug.txt
 * Example: "2024-01-15-episode-1-the-beginning.txt"
 */
export function generateTranscriptFilename(
  title: string,
  publishedAt: string,
): string {
  const date = formatDate(publishedAt);
  const slug = titleToSlug(title);
  return `${date}-${slug}.txt`;
}
