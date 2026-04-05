/**
 * CLI script to process the next canonical RSS episode from its enclosure audio.
 *
 * Usage:
 *   bun run src/scripts/process-next-episode.ts [options]
 *   bun run src/scripts/process-next-episode.ts --rss-url=https://feeds.megaphone.fm/ARML8571494714
 */

import { processRssEpisode } from "../pipeline/rss-audio-processor.js";
import { findNextUnprocessedEpisode } from "../rss/index.js";

const arguments_ = process.argv.slice(2);
const force = arguments_.includes("--force");

const rssUrlIndex = arguments_.findIndex(argument =>
  argument.startsWith("--rss-url"),
);
const rssUrl =
  rssUrlIndex === -1
    ? undefined
    : arguments_[rssUrlIndex]?.includes("=")
      ? arguments_[rssUrlIndex]?.split("=")[1]
      : arguments_[rssUrlIndex + 1];

const startFromIndex = arguments_.findIndex(argument =>
  argument.startsWith("--start-from"),
);
let startFrom: "correct" | "segment-detection" | "extract-tags" | undefined;
if (startFromIndex !== -1) {
  const value = arguments_[startFromIndex]?.includes("=")
    ? arguments_[startFromIndex]?.split("=")[1]
    : arguments_[startFromIndex + 1];
  if (
    value !== "correct" &&
    value !== "segment-detection" &&
    value !== "extract-tags"
  ) {
    console.error(
      'Error: --start-from only supports "correct", "segment-detection", or "extract-tags" stages',
    );
    console.error("");
    printUsage();
    process.exit(1);
  }
  startFrom = value as "correct" | "segment-detection" | "extract-tags";
}

function printUsage(): void {
  console.error("Usage:");
  console.error("  bun run src/scripts/process-next-episode.ts [options]");
  console.error("");
  console.error("Options:");
  console.error(
    "  --rss-url=URL        Override the canonical RSS feed URL for this run",
  );
  console.error(
    "  --force              Reprocess episode even if already processed",
  );
  console.error(
    "  --start-from=STAGE   Resume from a specific stage (saves API costs)",
  );
  console.error(
    "                       Supported stages: correct, segment-detection, extract-tags",
  );
}

const consumedIndexes = new Set<number>();
if (rssUrlIndex !== -1) {
  consumedIndexes.add(rssUrlIndex);
  if (!arguments_[rssUrlIndex]?.includes("=")) {
    consumedIndexes.add(rssUrlIndex + 1);
  }
}
if (startFromIndex !== -1) {
  consumedIndexes.add(startFromIndex);
  if (!arguments_[startFromIndex]?.includes("=")) {
    consumedIndexes.add(startFromIndex + 1);
  }
}

const unexpectedArguments = arguments_.filter(
  (argument, index) =>
    !consumedIndexes.has(index) &&
    !argument.startsWith("--") &&
    argument !== "--force",
);

if (unexpectedArguments.length > 0) {
  console.error(
    `Error: unexpected positional argument(s): ${unexpectedArguments.join(", ")}`,
  );
  console.error("");
  printUsage();
  process.exit(1);
}

try {
  const nextEpisode = await findNextUnprocessedEpisode(rssUrl);

  if (!nextEpisode) {
    console.log("No unprocessed canonical RSS episodes found.");
    process.exit(0);
  }

  const episodeNumber = nextEpisode.rssItem.itunesEpisode;
  console.log(`Canonical episode: ${nextEpisode.rssItem.title}`);
  if (episodeNumber !== undefined) {
    console.log(`Episode number: ${episodeNumber}`);
  }

  const result = await processRssEpisode(nextEpisode.rssItem, {
    force,
    startFrom,
  });

  if (result.skipped) {
    console.log("");
    console.log("⊘ Episode already processed (use --force to reprocess)");
    process.exit(0);
  }

  console.log("");
  console.log("✓ Successfully processed episode");
  console.log(`  Record ID: ${result.videoId}`);
  console.log(`  Title: ${result.metadata.title}`);
  console.log(`  Transcript: ${result.transcriptPath}`);
  console.log("  Embed: canonical audio");
  process.exit(0);
} catch (error) {
  console.error("");
  console.error("✗ Error processing episode:");
  console.error(error);
  process.exit(1);
}
