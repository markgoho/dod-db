/**
 * Remove a specific tag from all episodes in processed-videos.json.
 * Useful when marking a tag as 'rejected' to clean up existing data.
 */

import {
  loadProcessedVideos,
  saveProcessedVideos,
  type ProcessedVideo,
} from "../storage/processed-videos.js";

/**
 * Remove a tag from all episodes.
 *
 * @param tagName - The canonical tag name to remove (case-insensitive)
 * @returns Number of episodes that had the tag removed
 */
export async function removeTagFromAllEpisodes(
  tagName: string,
): Promise<number> {
  const videos = await loadProcessedVideos();
  const lowerTagName = tagName.toLowerCase();

  let affectedCount = 0;
  const updatedVideos: ProcessedVideo[] = [];

  for (const video of videos) {
    const originalTags = video.tags || [];
    const filteredTags = originalTags.filter(
      tag => tag.tag.toLowerCase() !== lowerTagName,
    );

    if (filteredTags.length < originalTags.length) {
      // Tag was removed
      affectedCount++;
      updatedVideos.push({
        ...video,
        tags: filteredTags,
      });
    } else {
      // No change
      updatedVideos.push(video);
    }
  }

  if (affectedCount > 0) {
    await saveProcessedVideos(updatedVideos);
    console.log(`✓ Removed tag "${tagName}" from ${affectedCount} episode(s)`);
  }

  return affectedCount;
}
