/**
 * YouTube audio extraction utilities
 */
import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

/**
 * Download audio from YouTube video and return the audio file path.
 * Uses yt-dlp to extract audio as MP3.
 *
 * @param youtubeUrl - YouTube video URL
 * @returns Path to the downloaded audio file
 */
export async function downloadYouTubeAudio(
  youtubeUrl: string,
): Promise<string> {
  // Ensure data/audio directory exists
  if (!existsSync('data/audio')) {
    await mkdir('data/audio', { recursive: true });
  }

  // Extract video ID from URL
  const videoId = extractVideoId(youtubeUrl);
  const outputPath = `data/audio/${videoId}.mp3`;

  // Check if already downloaded
  if (existsSync(outputPath)) {
    console.log(`  Audio already exists: ${outputPath}`);
    return outputPath;
  }

  console.log(`  Downloading audio from YouTube...`);

  // Download audio using yt-dlp
  const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${youtubeUrl}"`;

  try {
    await execAsync(command);
    console.log(`  ✓ Audio downloaded: ${outputPath}`);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to download YouTube audio: ${error}`);
  }
}

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string {
  const match = url.match(/[?&]v=([^&]+)/);
  if (match?.[1]) {
    return match[1];
  }

  // Handle youtu.be format
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch?.[1]) {
    return shortMatch[1];
  }

  throw new Error('Could not extract video ID from URL');
}

/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}
