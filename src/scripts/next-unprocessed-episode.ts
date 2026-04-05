/**
 * Print the next canonical RSS episode that has not been processed yet,
 * along with likely matching YouTube videos from the Data Over Dogma channel.
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

  const { rssItem, candidates, audioUrl, preferAudio } = result;

  console.log(`Next unprocessed episode: ${rssItem.title}`);
  console.log(`Published: ${rssItem.pubDate}`);

  if (rssItem.itunesEpisode !== undefined) {
    console.log(`RSS episode number: ${rssItem.itunesEpisode}`);
  }

  console.log(`GUID: ${rssItem.guid}`);

  if (audioUrl) {
    console.log(`Enclosure: ${audioUrl}`);
  }

  if (preferAudio && audioUrl) {
    console.log("Recommendation: use canonical audio for site embedding");
  }

  if (candidates.length === 0) {
    console.log("Likely YouTube matches: none found in recent channel videos");
    console.log("RSS feed item:");
    console.log(JSON.stringify(rssItem, undefined, 2));
    return;
  }

  console.log("Likely YouTube matches:");
  for (const [index, candidate] of candidates.entries()) {
    console.log(`  ${index + 1}. [${candidate.videoType}] ${candidate.title}`);
    console.log(`     ${candidate.url}`);
  }
}

await main();
