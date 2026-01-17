/**
 * Clean invalid tags from processed-videos.json.
 * Removes tags that are 'rejected' or not in vocabulary.
 */

import { tagVocabulary } from "../config/tag-vocabulary.js";
import { loadProcessedVideos } from "../storage/load-processed-videos.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { saveProcessedVideos } from "../storage/save-processed-videos.js";

// Build set of accepted canonical tags
const acceptedTags = new Set<string>();
for (const def of tagVocabulary) {
  if (def.status === "accepted") {
    acceptedTags.add(def.canonical.toLowerCase());
  }
}

console.log(`Found ${acceptedTags.size} accepted tags in vocabulary\n`);

async function cleanInvalidTags() {
  const videos = await loadProcessedVideos();

  let totalRemoved = 0;
  const updatedVideos: ProcessedVideo[] = [];

  for (const video of videos) {
    const originalTagCount = video.tags?.length || 0;

    // Filter tags to only accepted ones
    const validTags = (video.tags || []).filter(tag =>
      acceptedTags.has(tag.tag.toLowerCase()),
    );

    const removedCount = originalTagCount - validTags.length;

    if (removedCount > 0) {
      const removedTags = (video.tags || [])
        .filter(tag => !acceptedTags.has(tag.tag.toLowerCase()))
        .map(tag => tag.tag);

      console.log(`Episode ${video.episodeNumber}: ${video.title}`);
      console.log(
        `  Removing ${removedCount} invalid tag(s): ${removedTags.join(", ")}`,
      );
      console.log(`  Keeping ${validTags.length} valid tag(s)\n`);

      totalRemoved += removedCount;

      // Update the video with cleaned tags
      updatedVideos.push({
        ...video,
        tags: validTags,
      });
    } else {
      // Keep video as-is
      updatedVideos.push(video);
    }
  }

  // Save updated videos back to file
  if (totalRemoved > 0) {
    await saveProcessedVideos(updatedVideos);
    console.log(
      `✓ Removed ${totalRemoved} invalid tag(s) across ${videos.length} episodes`,
    );
  } else {
    console.log("✓ No invalid tags found");
  }
}

cleanInvalidTags().catch(console.error);
