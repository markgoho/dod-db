/**
 * Print the next canonical RSS episode that has not been processed yet,
 * along with its canonical enclosure audio URL.
 *
 * Usage:
 *   bun run src/scripts/next-unprocessed-episode.ts
 */

import { findNextUnprocessedEpisode } from "../rss/index.js";

async function main(): Promise<void> {
  const result = await findNextUnprocessedEpisode();

  if (!result) {
    console.log("No unprocessed canonical RSS episodes found.");
    return;
  }

  const { rssItem, audioUrl } = result;

  console.log(`Next unprocessed episode: ${rssItem.title}`);
  console.log(`Published: ${rssItem.pubDate}`);

  if (rssItem.itunesEpisode !== undefined) {
    console.log(`RSS episode number: ${rssItem.itunesEpisode}`);
  }

  console.log(`GUID: ${rssItem.guid}`);
  console.log(`Enclosure: ${audioUrl}`);
}

await main();
