/**
 * Generate Hugo episode content for a single processed video.
 * Called automatically by the YouTube processing pipeline.
 */

import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { generateFrontmatter } from "../hugo/generate-frontmatter.js";
import { getEpisodeOutputPath } from "../hugo/get-episode-path.js";
import { transformToShortcodes } from "../hugo/transform-shortcodes.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";

/**
 * Generate Hugo content file for a single episode.
 * Returns true if successful, false if skipped.
 */
export async function generateHugoEpisode(
  video: ProcessedVideo,
  options?: { silent?: boolean },
): Promise<boolean> {
  if (video.episodeNumber === undefined) {
    console.warn(
      `⚠️  Cannot generate Hugo page: no episode number for ${video.videoId}`,
    );
    return false;
  }

  const transcriptFile = Bun.file(video.transcriptPath);
  const transcriptExists = await transcriptFile.exists();

  if (!transcriptExists) {
    console.warn(
      `⚠️  Cannot generate Hugo page: transcript not found at ${video.transcriptPath}`,
    );
    return false;
  }

  const transcriptContent = await transcriptFile.text();
  const transcriptWithShortcodes = transformToShortcodes(transcriptContent);

  // Generate frontmatter
  const cleanTitle = extractCleanTitle(video.title);
  const frontmatter = generateFrontmatter(video, cleanTitle);

  // Combine frontmatter and transcript
  const content = `${frontmatter}\n\n${transcriptWithShortcodes}`;

  // Write to Hugo content directory with slug-based path
  const outputPath = getEpisodeOutputPath(video, cleanTitle);
  await Bun.write(outputPath, content);

  if (options?.silent !== true) {
    console.log(`✓ Generated Hugo page: /episodes/${video.episodeNumber}/`);
  }
  return true;
}
