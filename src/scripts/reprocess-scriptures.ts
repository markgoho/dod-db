/**
 * CLI script to reprocess episode scripture references.
 * Extracts Bible references from all episodes and updates processed-videos.json.
 *
 * Usage:
 *   bun run src/scripts/reprocess-scriptures.ts                    # Process episodes without scriptures
 *   bun run src/scripts/reprocess-scriptures.ts --force            # Reprocess all episodes (includes LLM verification)
 *   bun run src/scripts/reprocess-scriptures.ts --force --skip-llm # Reprocess without LLM verification (faster, cheaper)
 *   bun run src/scripts/reprocess-scriptures.ts --force --verbose  # Show detailed per-episode logs
 */

import { extractScripture } from "../pipeline/extract-scripture.js";
import { generateHugoEpisode } from "../pipeline/generate-hugo-episode.js";
import { getProcessedVideos } from "../storage/get-processed-videos.js";
import type { ProcessedVideo } from "../storage/processed-videos.js";
import { updateVideoScriptures } from "../storage/update-video-scriptures.js";

interface ReprocessResult {
  total: number;
  processed: number;
  skipped: number;
  failed: number;
}

async function reprocessScriptures(options: {
  force?: boolean;
  skipLlm?: boolean;
  verbose?: boolean;
}): Promise<ReprocessResult> {
  const { force = false, skipLlm = false, verbose = false } = options;

  const videos = await getProcessedVideos();

  // Filter to episodes that need processing
  const toProcess = force
    ? videos
    : videos.filter(
        video => video.scriptures === undefined || video.scriptures.length === 0,
      );

  console.log(`Found ${toProcess.length}/${videos.length} episodes to process\n`);

  const result: ReprocessResult = {
    total: toProcess.length,
    processed: 0,
    skipped: 0,
    failed: 0,
  };

  for (const video of toProcess) {
    const episodeLabel = video.episodeNumber
      ? `Episode ${video.episodeNumber}`
      : video.videoId;

    try {
      // Load transcript
      const transcriptFile = Bun.file(video.transcriptPath);
      if (!(await transcriptFile.exists())) {
        console.log(`⚠️  ${episodeLabel}: Transcript not found, skipping`);
        result.skipped++;
        continue;
      }

      const transcript = await transcriptFile.text();

      if (verbose) {
        console.log(`\n📖 Processing ${episodeLabel}: ${video.title}`);
      }

      // Extract scriptures
      const scriptures = await extractScripture(transcript, {
        enableLlmVerification: !skipLlm,
        episodeContext: {
          videoId: video.videoId,
          title: video.title,
          episodeNumber: video.episodeNumber,
        },
      });

      // Update processed-videos.json
      await updateVideoScriptures(video.videoId, scriptures);

      // Regenerate Hugo episode page
      const updatedVideo: ProcessedVideo = {
        ...video,
        scriptures,
      };
      await generateHugoEpisode(updatedVideo);

      const bookNames = scriptures.map(scripture => scripture.book).join(", ");
      if (verbose) {
        console.log(
          `  ✓ Found ${scriptures.length} books: ${bookNames || "(none)"}`,
        );
      } else {
        console.log(
          `✓ ${episodeLabel}: ${scriptures.length} books - ${bookNames || "(none)"}`,
        );
      }

      result.processed++;
    } catch (error) {
      console.error(
        `❌ ${episodeLabel}: Failed -`,
        error instanceof Error ? error.message : error,
      );
      result.failed++;
    }
  }

  return result;
}

async function main(): Promise<void> {
  console.log("📖 Scripture Reprocessing Script\n");

  // Parse CLI arguments
  const force = process.argv.includes("--force");
  const skipLlm = process.argv.includes("--skip-llm");
  const verbose = process.argv.includes("--verbose");

  if (force) {
    console.log("⚠️  Force mode: Reprocessing ALL episodes\n");
  }
  if (skipLlm) {
    console.log("⚡ Skip LLM mode: No verification for ambiguous books\n");
  }
  if (verbose) {
    console.log("📝 Verbose mode: Showing detailed logs\n");
  }

  // Run reprocessing
  const result = await reprocessScriptures({
    force,
    skipLlm,
    verbose,
  });

  // Print summary
  console.log("\n📊 Summary:");
  console.log(`   Total: ${result.total}`);
  console.log(`   Processed: ${result.processed}`);
  console.log(`   Skipped: ${result.skipped}`);
  console.log(`   Failed: ${result.failed}`);

  // Exit with appropriate code
  if (result.failed > 0) {
    process.exit(1);
  }
}

await main();
