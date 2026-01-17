import type { ProcessedVideo } from "../storage/processed-videos.js";
import { getHugoEpisodePath } from "./get-hugo-episode-path.js";
import { parseHugoFile } from "./parse-hugo-file.js";
import { writeHugoFile } from "./write-hugo-file.js";

/**
 * Update tags for an episode's frontmatter.
 *
 * @param video - ProcessedVideo object
 * @param tags - New tags array
 */
export async function updateEpisodeTags({
  video,
  tags,
}: {
  video: ProcessedVideo;
  tags: string[];
}): Promise<void> {
  const filePath = getHugoEpisodePath(video);
  const file = Bun.file(filePath);

  if (!(await file.exists())) {
    throw new Error(
      `Hugo episode file not found for episode ${video.episodeNumber}: ${filePath}`,
    );
  }

  const { frontmatter, content } = await parseHugoFile(filePath);
  frontmatter.tags = tags;

  await writeHugoFile({ filePath, frontmatter, content });
}
