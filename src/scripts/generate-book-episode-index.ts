import { loadProcessedVideos } from "../storage/load-processed-videos.js";

type BookEpisodeEntry = {
  ep: number;
  m: number;
  title: string;
};

type BookEpisodeIndex = Record<string, BookEpisodeEntry[]>;

const outputPath = new URL(
  "../../hugo/data/book-episode-index.json",
  import.meta.url,
);

async function main(): Promise<void> {
  const videos = await loadProcessedVideos();
  const bookEpisodeIndex: BookEpisodeIndex = {};

  for (const video of videos) {
    if (video.episodeNumber === undefined || video.scriptures === undefined) {
      continue;
    }

    for (const scripture of video.scriptures) {
      const entries = bookEpisodeIndex[scripture.book] ?? [];
      entries.push({
        ep: video.episodeNumber,
        m: scripture.mentions,
        title: video.title,
      });
      bookEpisodeIndex[scripture.book] = entries;
    }
  }

  for (const entries of Object.values(bookEpisodeIndex)) {
    entries.sort((left, right) => right.m - left.m || right.ep - left.ep);
  }

  const orderedBookNames = Object.keys(bookEpisodeIndex).sort((left, right) =>
    left.localeCompare(right),
  );
  const orderedBookIndex: BookEpisodeIndex = {};

  for (const bookName of orderedBookNames) {
    orderedBookIndex[bookName] = bookEpisodeIndex[bookName] ?? [];
  }

  await Bun.write(
    outputPath,
    `${JSON.stringify(orderedBookIndex, undefined, 2)}\n`,
  );
  console.log(
    `✓ Wrote book episode index for ${orderedBookNames.length} books to ${outputPath.pathname}`,
  );
}

await main();
