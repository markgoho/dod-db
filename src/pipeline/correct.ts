import { ai } from "../ai.js";
import { correctionChunking } from "../config/chunking.js";
import { globalCorrections } from "../config/corrections.js";
import { reviewModel } from "../config/models.js";
import { correctionPrompt } from "../prompts/correction.js";
import { applyDeterministicCorrections } from "./apply-deterministic-corrections.js";
import { chunkTranscriptLines } from "./chunk-transcript-lines.js";

const timestampPattern = /^\[[\d:.]+\]/gm;

function lineTimestamps(text: string): string {
  return (text.match(timestampPattern) ?? []).join("|");
}

/**
 * Process a single chunk with the LLM.
 * Returns the corrected text and timing info.
 */
async function processChunk(
  textChunk: string,
  index: number,
  total: number,
): Promise<{ index: number; text: string; durationMs: number }> {
  const startTime = performance.now();

  const response = await ai.models.generateContent({
    model: reviewModel,
    contents: correctionPrompt(textChunk),
  });

  const durationMs = performance.now() - startTime;
  console.log(
    `    Chunk ${index + 1}/${total}: Done in ${(durationMs / 1000).toFixed(1)}s`,
  );

  // Never lose lines: if the model dropped, merged, or altered any timestamped
  // line, keep this chunk uncorrected rather than risk missing text.
  const trailing = textChunk.endsWith("\n") ? "\n" : "";
  const corrected = (response.text ?? "").trim() + trailing;
  if (lineTimestamps(corrected) !== lineTimestamps(textChunk)) {
    console.warn(
      `    ⚠ Chunk ${index + 1}/${total}: timestamps changed, keeping uncorrected text`,
    );
    return { index, text: textChunk, durationMs };
  }

  return { index, text: corrected, durationMs };
}

/**
 * Transcript correction with deterministic preprocessing and parallel LLM processing.
 *
 * Uses parallel network I/O to process all chunks concurrently, achieving ~7x speedup
 * over sequential processing. The LLM API calls are I/O-bound (waiting for network
 * responses), so parallelization overlaps the waiting time without additional CPU cost.
 *
 * Steps:
 * 1. Apply deterministic find/replace corrections (instant, free)
 * 2. Chunk the transcript on line boundaries (up to maxLength chars, no overlap)
 * 3. Process all chunks in parallel via Promise.all (network I/O parallelism)
 * 4. Join the corrected chunks with newlines
 *
 * Performance (Episode 5, 13 chunks):
 * - Sequential: 815s (~13.6 min)
 * - Parallel: 88s (~1.5 min)
 * - Speedup: 7.36x
 *
 * @param transcript - Raw or speaker-labeled transcript
 * @param maxLength - Maximum chunk length in characters
 * @returns Corrected transcript
 */
export async function correctTranscript(
  transcript: string,
  maxLength = correctionChunking.maxLength,
): Promise<string> {
  // 1. Apply deterministic corrections first
  console.log("  Applying deterministic corrections...");
  const { correctedText: afterDeterministic, count: deterministicCount } =
    applyDeterministicCorrections(transcript, globalCorrections);
  console.log(`  ✓ Applied ${deterministicCount} deterministic corrections`);

  // 2. Chunk the transcript
  const chunks = chunkTranscriptLines(afterDeterministic, maxLength);
  console.log(`  Processing ${chunks.length} chunks with LLM (parallel)...`);

  // 3. Process all chunks in parallel (I/O-bound, not CPU-bound)
  const startTime = performance.now();
  const results = await Promise.all(
    chunks.map((textChunk, index) =>
      processChunk(textChunk, index, chunks.length),
    ),
  );
  const totalTime = performance.now() - startTime;

  // Sort by index to keep chunks in transcript order
  results.sort((a, b) => a.index - b.index);
  const correctedChunks = results.map(r => r.text);

  console.log(`  ✓ All chunks completed in ${(totalTime / 1000).toFixed(1)}s`);

  // 4. Join chunks (line-aligned, so no overlap to remove)
  const correctedText = correctedChunks.join("\n");

  console.log("✓ Correction complete");

  return correctedText;
}
