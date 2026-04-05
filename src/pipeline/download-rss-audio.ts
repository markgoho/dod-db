import { mkdir } from "node:fs/promises";
import * as path from "node:path";

/**
 * Download audio from a canonical RSS enclosure URL.
 * Returns local file path to the downloaded audio.
 */
export async function downloadRssAudio(
  audioUrl: string,
  outputDirectory: string,
  fileStem: string,
): Promise<string> {
  await mkdir(outputDirectory, { recursive: true });

  const outputPath = path.join(outputDirectory, `${fileStem}.mp3`);
  const response = await fetch(audioUrl);

  if (!response.ok) {
    throw new Error(`RSS audio download failed with status ${response.status}`);
  }

  const audioBytes = await response.arrayBuffer();
  await Bun.write(outputPath, new Uint8Array(audioBytes));
  return outputPath;
}
