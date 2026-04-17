import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type {
  EpisodeTag,
  ProcessedVideo,
} from "../storage/processed-videos.js";
import { saveProcessedVideos } from "../storage/save-processed-videos.js";
import { sortTags } from "./tag-utils.js";

function renameTags(
  tags: EpisodeTag[],
  fromTag: string,
  toTag: string,
): EpisodeTag[] {
  const renamedTags: EpisodeTag[] = [];
  const fromLower = fromTag.toLowerCase();
  const toLower = toTag.toLowerCase();

  for (const tag of tags) {
    const tagLower = tag.tag.toLowerCase();

    if (tagLower === fromLower) {
      const existing = renamedTags.find(
        candidate => candidate.tag.toLowerCase() === toLower,
      );

      if (!existing) {
        renamedTags.push({
          tag: toTag,
          mentions: tag.mentions,
        });
      }

      continue;
    }

    const existing = renamedTags.find(
      candidate => candidate.tag.toLowerCase() === tagLower,
    );

    if (!existing) {
      renamedTags.push(tag);
    }
  }

  return sortTags(renamedTags);
}

export async function renameTagInAllEpisodes(
  fromTag: string,
  toTag: string,
): Promise<number> {
  const fromLower = fromTag.toLowerCase();
  const toLower = toTag.toLowerCase();

  if (fromLower === toLower) {
    return 0;
  }

  const videos = await loadProcessedVideos();
  let affectedCount = 0;

  const updatedVideos: ProcessedVideo[] = videos.map(video => {
    const originalTags = video.tags ?? [];
    const hasSourceTag = originalTags.some(
      tag => tag.tag.toLowerCase() === fromLower,
    );

    if (!hasSourceTag) {
      return video;
    }

    affectedCount++;

    return {
      ...video,
      tags: renameTags(originalTags, fromTag, toTag),
    };
  });

  if (affectedCount > 0) {
    await saveProcessedVideos(updatedVideos);
  }

  return affectedCount;
}
