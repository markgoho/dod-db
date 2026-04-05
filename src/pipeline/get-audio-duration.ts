import { join } from "node:path";

async function probeAudioDuration(
  audioPath: string,
): Promise<number | undefined> {
  try {
    const proc = Bun.spawn([
      "ffprobe",
      "-v",
      "quiet",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      audioPath,
    ]);

    const output = await new Response(proc.stdout).text();
    const duration = Number.parseFloat(output.trim());

    return Number.isNaN(duration) ? undefined : duration;
  } catch {
    return undefined;
  }
}

/**
 * Get audio duration in seconds using ffprobe.
 * Returns undefined if the file doesn't exist or ffprobe fails.
 */
export async function getAudioDuration(
  videoIdOrPath: string,
): Promise<number | undefined> {
  const directFile = Bun.file(videoIdOrPath);
  if (await directFile.exists()) {
    return probeAudioDuration(videoIdOrPath);
  }

  const audioDir = join(process.cwd(), "data", "audio");

  // Try common audio extensions
  const extensions = [".m4a", ".webm", ".mp3", ".wav"];

  for (const extension of extensions) {
    const audioPath = join(audioDir, `${videoIdOrPath}${extension}`);
    const file = Bun.file(audioPath);

    if (await file.exists()) {
      return probeAudioDuration(audioPath);
    }
  }

  return undefined;
}
