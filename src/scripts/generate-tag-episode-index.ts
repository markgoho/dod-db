import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import { titleToSlug } from "../utils/title-to-slug.js";

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
const topicOutputPath = new URL(
  "../../hugo/data/topic-episode-index.json",
  import.meta.url,
);

async function loadTopicNamesBySlug(): Promise<Map<string, string>> {
  const namesBySlug = new Map<string, string>();

  for await (const path of new Bun.Glob("*/_index.md").scan({
    cwd: new URL("../../hugo/content/topics/", import.meta.url).pathname,
  })) {
    const file = Bun.file(
      new URL(`../../hugo/content/topics/${path}`, import.meta.url),
    );
    const text = await file.text();
    const match = text.match(/^title:\s*(.+)$/m);
    const slug = path.split("/")[0];
    if (!slug || !match?.[1]) {
      continue;
    }
    namesBySlug.set(slug, match[1].trim().replaceAll(/^"|"$/g, ""));
  }

  return namesBySlug;
}

async function main(): Promise<void> {
  const [videos, topicNamesBySlug] = await Promise.all([
    loadProcessedVideos(),
    loadTopicNamesBySlug(),
  ]);
  const tagEpisodeIndex: TagEpisodeIndex = {};
  const topicEpisodeIndex: TagEpisodeIndex = {};

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

      const topicName = topicNamesBySlug.get(titleToSlug(tag.tag));
      if (!topicName) {
        continue;
      }

      const topicEntries = topicEpisodeIndex[topicName] ?? [];
      topicEntries.push(entry);
      topicEpisodeIndex[topicName] = topicEntries;
    }
  }

  for (const index of [tagEpisodeIndex, topicEpisodeIndex]) {
    for (const entries of Object.values(index)) {
      entries.sort((left, right) => right.m - left.m || right.ep - left.ep);
    }
  }

  const orderedTagNames = Object.keys(tagEpisodeIndex).sort((left, right) =>
    left.localeCompare(right),
  );
  const orderedTopicNames = Object.keys(topicEpisodeIndex).sort((left, right) =>
    left.localeCompare(right),
  );
  const orderedTagIndex: TagEpisodeIndex = {};
  const orderedTopicIndex: TagEpisodeIndex = {};

  for (const tagName of orderedTagNames) {
    orderedTagIndex[tagName] = tagEpisodeIndex[tagName] ?? [];
  }

  for (const topicName of orderedTopicNames) {
    orderedTopicIndex[topicName] = topicEpisodeIndex[topicName] ?? [];
  }

  await Promise.all([
    Bun.write(
      tagOutputPath,
      `${JSON.stringify(orderedTagIndex, undefined, 2)}\n`,
    ),
    Bun.write(
      topicOutputPath,
      `${JSON.stringify(orderedTopicIndex, undefined, 2)}\n`,
    ),
  ]);
  console.log(
    `✓ Wrote tag episode index for ${orderedTagNames.length} tags to ${tagOutputPath.pathname}`,
  );
  console.log(
    `✓ Wrote topic episode index for ${orderedTopicNames.length} topics to ${topicOutputPath.pathname}`,
  );
}

await main();
