import { chunk } from 'llm-chunk';
import { correctionChunking } from '../config/chunking.js';
import { reviewModel } from '../config/models.js';
import { globalCorrections } from '../config/corrections.js';
import { ai } from '../ai.js';
import { correctionPrompt } from '../prompts/correction.js';
import {
  applyDeterministicCorrections,
  deduplicateChunks,
} from './correct-utils.js';

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
  console.log(`    Chunk ${index + 1}/${total}: Done in ${(durationMs / 1000).toFixed(1)}s`);

  return {
    index,
    text: response.text ?? '',
    durationMs,
  };
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
 * 2. Chunk the transcript (5K-10K chars, 200 char overlap)
 * 3. Process all chunks in parallel via Promise.all (network I/O parallelism)
 * 4. Deduplicate overlaps using timestamp-aware joining
 *
 * Performance (Episode 5, 13 chunks):
 * - Sequential: 815s (~13.6 min)
 * - Parallel: 88s (~1.5 min)
 * - Speedup: 7.36x
 *
 * @param transcript - Raw or speaker-labeled transcript
 * @returns Corrected transcript
 */
export async function correctTranscript(transcript: string): Promise<string> {
  // 1. Apply deterministic corrections first
  console.log('  Applying deterministic corrections...');
  const { correctedText: afterDeterministic, count: deterministicCount } =
    applyDeterministicCorrections(transcript, globalCorrections);
  console.log(`  ✓ Applied ${deterministicCount} deterministic corrections`);

  // 2. Chunk the transcript
  const chunks = chunk(afterDeterministic, correctionChunking);
  console.log(`  Processing ${chunks.length} chunks with LLM (parallel)...`);

  // 3. Process all chunks in parallel (I/O-bound, not CPU-bound)
  const startTime = performance.now();
  const results = await Promise.all(
    chunks.map((textChunk, index) => processChunk(textChunk, index, chunks.length)),
  );
  const totalTime = performance.now() - startTime;

  // Sort by index to maintain correct order for deduplication
  results.sort((a, b) => a.index - b.index);
  const correctedChunks = results.map((r) => r.text);

  console.log(`  ✓ All chunks completed in ${(totalTime / 1000).toFixed(1)}s`);

  // 4. Deduplicate overlaps
  console.log('  Deduplicating overlaps...');
  const correctedText = deduplicateChunks(
    correctedChunks,
    correctionChunking.overlap,
  );

  console.log('✓ Correction complete');

  return correctedText;
}
