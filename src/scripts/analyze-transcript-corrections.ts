/**
 * Analyze corrections between raw and final transcripts
 * without reprocessing the entire episode.
 *
 * Usage:
 *   bun run src/scripts/analyze-transcript-corrections.ts <raw-transcript-path> <corrected-transcript-path>
 *   bun run src/scripts/analyze-transcript-corrections.ts data/transcripts/2023-05-01-episode-4-may-1-2023-ehrmageddon-with-bart-ehrman-raw.txt data/transcripts/2023-05-01-episode-4-may-1-2023-ehrmageddon-with-bart-ehrman.txt
 */

import { analyzeCorrections } from "../pipeline/learn-corrections.js";

const arguments_ = process.argv.slice(2);
const rawPath = arguments_[0];
const correctedPath = arguments_[1];
const episodeId = arguments_[2]; // Optional: video ID for tracking

if (!rawPath || !correctedPath) {
  console.error("Error: Both raw and corrected transcript paths are required");
  console.error("");
  console.error("Usage:");
  console.error(
    "  bun run src/scripts/analyze-transcript-corrections.ts <raw-path> <corrected-path> [episode-id]",
  );
  console.error("");
  console.error("Examples:");
  console.error("  bun run src/scripts/analyze-transcript-corrections.ts \\");
  console.error("    data/transcripts/episode-raw.txt \\");
  console.error("    data/transcripts/episode.txt");
  console.error("");
  console.error("  # With episode ID to update tracker:");
  console.error("  bun run src/scripts/analyze-transcript-corrections.ts \\");
  console.error("    data/transcripts/episode-raw.txt \\");
  console.error("    data/transcripts/episode.txt \\");
  console.error("    WidY7lIBiyY");
  process.exit(1);
}

try {
  console.log("Loading transcripts...");
  console.log(`  Raw: ${rawPath}`);
  console.log(`  Corrected: ${correctedPath}`);
  if (episodeId) {
    console.log(`  Episode ID: ${episodeId}`);
  }

  const rawTranscript = await Bun.file(rawPath).text();
  const correctedTranscript = await Bun.file(correctedPath).text();

  await analyzeCorrections(rawTranscript, correctedTranscript, episodeId);
} catch (error) {
  console.error("");
  console.error("✗ Error analyzing transcripts:");
  console.error(error);
  process.exit(1);
}
