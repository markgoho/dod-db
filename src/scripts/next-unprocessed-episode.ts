/**
 * Print the next canonical Patreon RSS episode that has not been processed yet,
 * along with likely matching YouTube videos from the Data Over Dogma channel.
 *
 * Usage:
 *   bun run src/scripts/next-unprocessed-episode.ts
 */

import { findNextUnprocessedEpisode } from "../rss/index.js";

async function main(): Promise<void> {
  const result = await findNextUnprocessedEpisode();

  if (!result) {
    console.log("No unprocessed canonical Patreon RSS episodes found.");
    return;
  }

  const { rssItem, candidates } = result;

  console.log(`Next unprocessed episode: ${rssItem.title}`);
  console.log(`Published: ${rssItem.pubDate}`);

  if (rssItem.itunesEpisode !== undefined) {
    console.log(`RSS episode number: ${rssItem.itunesEpisode}`);
  }

  console.log(`GUID: ${rssItem.guid}`);

  if (rssItem.enclosureUrl) {
    console.log(`Enclosure: ${rssItem.enclosureUrl}`);
  }

  if (candidates.length === 0) {
    console.log("Likely YouTube matches: none found in recent channel videos");
    return;
  }

  console.log("Likely YouTube matches:");
  for (const [index, candidate] of candidates.entries()) {
    console.log(`  ${index + 1}. ${candidate.title}`);
    console.log(`     ${candidate.url}`);
  }
}

await main();
