import { tagVocabulary } from "../config/tag-vocabulary.js";
import { updateTagInVocabulary } from "../pipeline/update-tag-in-vocabulary.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";

async function main(): Promise<void> {
  console.log("🏷️  Backfilling tag episode metadata\n");

  const videos = await loadProcessedVideos();
  const episodesByTag = new Map<string, Set<number>>();

  for (const tag of tagVocabulary) {
    episodesByTag.set(tag.canonical.toLowerCase(), new Set<number>());
  }

  for (const video of videos) {
    if (video.episodeNumber === undefined || !video.tags) {
      continue;
    }

    for (const tag of video.tags) {
      const episodeNumbers = episodesByTag.get(tag.tag.toLowerCase());
      if (!episodeNumbers) {
        continue;
      }
      episodeNumbers.add(video.episodeNumber);
    }
  }

  let updated = 0;
  let skipped = 0;

  for (const tag of tagVocabulary) {
    const episodeNumbers = [
      ...(episodesByTag.get(tag.canonical.toLowerCase()) ?? new Set<number>()),
    ].sort((a, b) => a - b);

    try {
      await updateTagInVocabulary(tag.canonical, { episodes: episodeNumbers });
      updated++;
      process.stdout.write(".");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("Could not find tag")) {
        skipped++;
        console.warn(`\nSkipping stale in-memory tag "${tag.canonical}"`);
        continue;
      }
      throw error;
    }
  }

  console.log("\n\n✅ Backfill complete!");
  console.log(`Updated ${updated} tags.`);
  if (skipped > 0) {
    console.log(`Skipped ${skipped} stale in-memory tags.`);
  }
}

await main();
