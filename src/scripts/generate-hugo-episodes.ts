/**
 * CLI script to generate Hugo episode content from processed videos.
 *
 * Usage:
 *   bun run src/scripts/generate-hugo-episodes.ts --all              # Generate all episodes
 *   bun run src/scripts/generate-hugo-episodes.ts --newest           # Generate most recent episode
 *   bun run src/scripts/generate-hugo-episodes.ts --episode 42       # Generate specific episode
 */

import { extractCleanTitle } from "../hugo/extract-clean-title.js";
import { generateFrontmatter } from "../hugo/generate-frontmatter.js";
import { getEpisodeOutputPath } from "../hugo/get-episode-path.js";
import { transformToShortcodes } from "../hugo/transform-shortcodes.js";
import { getProcessedVideosWithNumbers } from "../storage/get-processed-videos-with-numbers.js";
import { getVideoByEpisodeNumber } from "../storage/get-video-by-episode-number.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";

/**
 * Generate Hugo content file for a single episode.
 */
async function generateEpisodeContent(video: ProcessedVideo): Promise<boolean> {
  if (video.episodeNumber === undefined) {
    console.warn(`⚠️  Skipping video ${video.videoId}: no episode number`);
    return false;
  }

  // Check if transcript exists
  const transcriptFile = Bun.file(video.transcriptPath);
  const transcriptExists = await transcriptFile.exists();

  if (!transcriptExists) {
    console.warn(
      `⚠️  Skipping episode ${video.episodeNumber}: transcript not found at ${video.transcriptPath}`,
    );
    return false;
  }

  // Read transcript content
  const transcriptContent = await transcriptFile.text();

  // Transform to Hugo shortcode format
  const transcriptWithShortcodes = transformToShortcodes(transcriptContent);

  // Generate frontmatter
  const cleanTitle = extractCleanTitle(video.title);
  const frontmatter = await generateFrontmatter(video, cleanTitle);

  // Combine frontmatter and transcript
  const content = transcriptWithShortcodes.endsWith("\n")
    ? `${frontmatter}\n\n${transcriptWithShortcodes}`
    : `${frontmatter}\n\n${transcriptWithShortcodes}\n`;

  // Write to Hugo content directory with slug-based path
  const outputPath = getEpisodeOutputPath(video, cleanTitle);
  await Bun.write(outputPath, content);

  console.log(`✓ Generated episode ${video.episodeNumber}: ${cleanTitle}`);
  return true;
}

/**
 * Generate content for all episodes.
 */
async function generateAllEpisodes(): Promise<{
  success: number;
  failed: number;
}> {
  const videos = await getProcessedVideosWithNumbers();
  let success = 0;
  let failed = 0;

  console.log(`📚 Generating content for ${videos.length} episodes...\n`);

  for (const video of videos) {
    const result = await generateEpisodeContent(video);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Generate content for the newest episode (highest episode number).
 */
async function generateNewestEpisode(): Promise<boolean> {
  const videos = await getProcessedVideosWithNumbers();

  if (videos.length === 0) {
    console.error("❌ No processed videos found");
    return false;
  }

  // Find the video with highest episode number using a for loop
  let newest = videos[0];
  for (const video of videos) {
    if (newest === undefined) {
      newest = video;
      continue;
    }
    const newestNumber = newest.episodeNumber ?? 0;
    const currentNumber = video.episodeNumber ?? 0;
    if (currentNumber > newestNumber) {
      newest = video;
    }
  }

  if (newest === undefined) {
    console.error("❌ Could not determine newest episode");
    return false;
  }

  console.log(
    `📺 Generating content for newest episode (${newest.episodeNumber})...\n`,
  );
  return generateEpisodeContent(newest);
}

/**
 * Generate content for a specific episode by number.
 */
async function generateSpecificEpisode(
  episodeNumber: number,
): Promise<boolean> {
  const video = await getVideoByEpisodeNumber(episodeNumber);

  if (!video) {
    console.error(`❌ Episode ${episodeNumber} not found`);
    return false;
  }

  console.log(`📺 Generating content for episode ${episodeNumber}...\n`);
  return generateEpisodeContent(video);
}

async function main(): Promise<void> {
  console.log("🎙️  Hugo Episode Generator\n");

  // Parse CLI arguments
  const isAll = process.argv.includes("--all");
  const isNewest = process.argv.includes("--newest");
  const episodeArgumentIndex = process.argv.indexOf("--episode");
  const specificEpisode =
    episodeArgumentIndex === -1
      ? undefined
      : Number.parseInt(process.argv[episodeArgumentIndex + 1] ?? "", 10);

  // Validate arguments
  const modeCount = [isAll, isNewest, specificEpisode !== undefined].filter(
    Boolean,
  ).length;

  if (modeCount === 0) {
    console.log("Usage:");
    console.log("  bun run src/scripts/generate-hugo-episodes.ts --all");
    console.log("  bun run src/scripts/generate-hugo-episodes.ts --newest");
    console.log(
      "  bun run src/scripts/generate-hugo-episodes.ts --episode <number>",
    );
    process.exit(1);
  }

  if (modeCount > 1) {
    console.error(
      "❌ Please specify only one mode: --all, --newest, or --episode <number>",
    );
    process.exit(1);
  }

  // Execute the appropriate mode
  if (isAll) {
    const { success, failed } = await generateAllEpisodes();
    console.log(`\n✅ Generated ${success} episodes`);
    if (failed > 0) {
      console.log(`⚠️  Skipped ${failed} episodes`);
      process.exit(1);
    }
  } else if (isNewest) {
    const success = await generateNewestEpisode();
    if (!success) {
      process.exit(1);
    }
  } else if (specificEpisode !== undefined) {
    if (Number.isNaN(specificEpisode)) {
      console.error("❌ Invalid episode number");
      process.exit(1);
    }
    const success = await generateSpecificEpisode(specificEpisode);
    if (!success) {
      process.exit(1);
    }
  }
}

await main();
