import type { ProcessedVideo } from "../storage/processed-videos.js";
import { getHugoEpisodePath } from "./get-hugo-episode-path.js";
import { parseHugoFile } from "./parse-hugo-file.js";
import { writeHugoFile } from "./write-hugo-file.js";

/**
 * Remove a tag from an episode's frontmatter.
 *
 * @param video - ProcessedVideo object
 * @param tagToRemove - Tag to remove (case-insensitive)
 * @returns true if tag was found and removed, false otherwise
 */
export async function removeTagFromEpisode({
  video,
  tagToRemove,
}: {
  video: ProcessedVideo;
  tagToRemove: string;
}): Promise<boolean> {
  const filePath = getHugoEpisodePath(video);
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    console.warn(
      `Hugo episode file not found for episode ${video.episodeNumber}: ${filePath}`,
    );
    return false;
  }

  const { frontmatter, content } = await parseHugoFile(filePath);

  // Filter out the tag (case-insensitive)
  const originalLength = frontmatter.tags.length;
  frontmatter.tags = frontmatter.tags.filter(
    tag => tag.toLowerCase() !== tagToRemove.toLowerCase(),
  );

  // If no tags were removed, return false
  if (frontmatter.tags.length === originalLength) {
    return false;
  }

  // Write back updated frontmatter
  await writeHugoFile({ filePath, frontmatter, content });

  return true;
}
