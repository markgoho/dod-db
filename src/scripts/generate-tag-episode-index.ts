import { loadProcessedVideos } from "../storage/load-processed-videos.js";

type TagEpisodeEntry = {
  ep: number;
  m: number;
  title: string;
};

type TagEpisodeIndex = Record<string, TagEpisodeEntry[]>;

const outputPath = new URL(
  "../../hugo/data/tag-episode-index.json",
  import.meta.url,
);

async function main(): Promise<void> {
  const videos = await loadProcessedVideos();
  const tagEpisodeIndex: TagEpisodeIndex = {};
  const episodeSlugIndex: Record<number, string> = {};

  for (const video of videos) {
    if (video.episodeNumber !== undefined) {
      episodeSlugIndex[video.episodeNumber] = video.title;
    }

    if (video.episodeNumber === undefined || video.tags === undefined) {
      continue;
    }

    for (const tag of video.tags) {
      const existingEntries = tagEpisodeIndex[tag.tag] ?? [];
      existingEntries.push({
        ep: video.episodeNumber,
        m: tag.mentions,
        title: video.title,
      });
      tagEpisodeIndex[tag.tag] = existingEntries;
    }
  }

  for (const entries of Object.values(tagEpisodeIndex)) {
    entries.sort((left, right) => right.m - left.m || right.ep - left.ep);
  }

  const orderedTagNames = Object.keys(tagEpisodeIndex).sort((left, right) =>
    left.localeCompare(right),
  );
  const orderedIndex: TagEpisodeIndex = {};

  for (const tagName of orderedTagNames) {
    orderedIndex[tagName] = tagEpisodeIndex[tagName] ?? [];
  }

  await Bun.write(
    outputPath,
    `${JSON.stringify(orderedIndex, undefined, 2)}\n`,
  );
  console.log(
    `✓ Wrote tag episode index for ${orderedTagNames.length} tags to ${outputPath.pathname}`,
  );
}

await main();
