import { loadProcessedVideos } from "../storage/load-processed-videos.js";

type TagEpisodeEntry = {
  ep: number;
  m: number;
  title: string;
};

type TagEpisodeIndex = Record<string, TagEpisodeEntry[]>;

const tagOutputPath = new URL(
  "../../hugo/data/tag-episode-index.json",
  import.meta.url,
);

async function main(): Promise<void> {
  const videos = await loadProcessedVideos();
  const tagEpisodeIndex: TagEpisodeIndex = {};

  for (const video of videos) {
    if (video.episodeNumber === undefined || video.tags === undefined) {
      continue;
    }

    for (const tag of video.tags) {
      const entry = {
        ep: video.episodeNumber,
        m: tag.mentions,
        title: video.title,
      };
      const existingEntries = tagEpisodeIndex[tag.tag] ?? [];
      existingEntries.push(entry);
      tagEpisodeIndex[tag.tag] = existingEntries;
    }
  }

  for (const entries of Object.values(tagEpisodeIndex)) {
    entries.sort((left, right) => right.m - left.m || right.ep - left.ep);
  }

  const orderedTagNames = Object.keys(tagEpisodeIndex).toSorted((left, right) =>
    left.localeCompare(right),
  );
  const orderedTagIndex: TagEpisodeIndex = {};

  for (const tagName of orderedTagNames) {
    orderedTagIndex[tagName] = tagEpisodeIndex[tagName] ?? [];
  }

  await Bun.write(
    tagOutputPath,
    `${JSON.stringify(orderedTagIndex, undefined, 2)}\n`,
  );
  console.log(
    `✓ Wrote tag episode index for ${orderedTagNames.length} tags to ${tagOutputPath.pathname}`,
  );
}

await main();
