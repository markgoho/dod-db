import { processRssEpisode } from "../pipeline/rss-audio-processor.js";
import { fetchPodcastRss, parsePodcastRss } from "../rss/index.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import { saveProcessedVideos } from "../storage/save-processed-videos.js";

const args = process.argv.slice(2);
const episodeArgumentIndex = args.indexOf("--episode");
const titleArgumentIndex = args.indexOf("--title");
const rssUrlArgumentIndex = args.indexOf("--rss-url");
const replaceExisting = args.includes("--replace-existing");

function getArgumentValue(index: number): string | undefined {
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function printUsage(): void {
  console.error("Usage:");
  console.error(
    "  bun run src/scripts/reprocess-rss-episode.ts --rss-url <url> (--episode <number> | --title <title>) [--replace-existing]",
  );
}

const episodeValue = getArgumentValue(episodeArgumentIndex);
const titleValue = getArgumentValue(titleArgumentIndex);
const rssUrl = getArgumentValue(rssUrlArgumentIndex);
const episodeNumber = episodeValue
  ? Number.parseInt(episodeValue, 10)
  : Number.NaN;

if ((!episodeValue && !titleValue) || !rssUrl) {
  printUsage();
  process.exit(1);
}

if (episodeValue && Number.isNaN(episodeNumber)) {
  printUsage();
  process.exit(1);
}

const rssXml = await fetchPodcastRss(rssUrl);
if (!rssXml) {
  throw new Error("Could not fetch RSS feed");
}

const rssItems = parsePodcastRss(rssXml);
const availableItems = rssItems
  .map(item => {
    if (item.itunesEpisode === undefined) {
      return item.title;
    }

    return `${item.itunesEpisode}: ${item.title}`;
  })
  .slice(0, 20);
const rssItem = titleValue
  ? rssItems.find(item => item.title === titleValue)
  : rssItems.find(item => item.itunesEpisode === episodeNumber);

if (!rssItem) {
  throw new Error(
    `Requested RSS item not found. Available items: ${availableItems.join(", ")}`,
  );
}

if (replaceExisting) {
  const processedVideos = await loadProcessedVideos();
  const filteredVideos = processedVideos.filter(video => {
    if (titleValue) {
      return video.title !== rssItem.title;
    }

    return video.episodeNumber !== episodeNumber;
  });
  await saveProcessedVideos(filteredVideos);
}

await processRssEpisode(rssItem);
