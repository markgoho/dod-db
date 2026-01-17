import { join } from "node:path";

/**
 * Get audio duration in seconds using ffprobe.
 * Returns undefined if the file doesn't exist or ffprobe fails.
 */
export async function getAudioDuration(
  videoId: string,
): Promise<number | undefined> {
  const audioDir = join(process.cwd(), "data", "audio");

  // Try common audio extensions
  const extensions = [".m4a", ".webm", ".mp3", ".wav"];

  for (const extension of extensions) {
    const audioPath = join(audioDir, `${videoId}${extension}`);
    const file = Bun.file(audioPath);

    if (await file.exists()) {
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

        if (!Number.isNaN(duration)) {
          return duration;
        }
      } catch {
        // ffprobe failed, try next extension
      }
    }
  }

  return undefined;
}
