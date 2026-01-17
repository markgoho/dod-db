/**
 * Parallel correction processing with concurrency control.
 */

import { ai } from "../../src/ai.js";
import { correctionPrompt } from "../../src/prompts/correction.js";
import {
  PARALLEL_CONFIG,
  type ConcurrencyLevel,
  type ModelId,
} from "../config/experiment-config.js";
import type { TokenUsage } from "./cost-calculator.js";

export interface ChunkResult {
  index: number;
  output: string;
  tokens: TokenUsage;
  durationMs: number;
  retryCount: number;
  error?: string;
}

export interface ParallelCorrectionResult {
  chunks: ChunkResult[];
  wallClockMs: number;
  totalProcessingMs: number; // Sum of all chunk durations
  retries: number;
  errors: number;
}

interface ParallelConfig {
  concurrency: ConcurrencyLevel;
  retryAttempts?: number;
  retryDelayMs?: number;
}

/**
 * Simple semaphore for concurrency control.
 */
class Semaphore {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private limit: number) {}

  async acquire(): Promise<void> {
    if (this.running < this.limit) {
      this.running++;
      return;
    }

    return new Promise<void>(resolve => {
      this.queue.push(() => {
        this.running++;
        resolve();
      });
    });
  }

  release(): void {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }
}

/**
 * Sleep for a given duration.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a single chunk with retry logic.
 */
async function processChunk(
  textChunk: string,
  index: number,
  model: ModelId,
  config: ParallelConfig,
): Promise<ChunkResult> {
  const maxRetries = config.retryAttempts ?? PARALLEL_CONFIG.retryAttempts;
  const retryDelay = config.retryDelayMs ?? PARALLEL_CONFIG.retryDelayMs;

  const startTime = performance.now();
  let retryCount = 0;
  let lastError: Error | null = null;

  while (retryCount <= maxRetries) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: correctionPrompt(textChunk),
      });

      const durationMs = performance.now() - startTime;

      // Extract token usage from response metadata
      const usage = response.usageMetadata;
      const tokens: TokenUsage = {
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: usage?.candidatesTokenCount ?? 0,
      };

      return {
        index,
        output: response.text ?? "",
        tokens,
        durationMs,
        retryCount,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      retryCount++;

      if (retryCount <= maxRetries) {
        // Exponential backoff
        const delay = retryDelay * 2 ** (retryCount - 1);
        console.log(
          `  Chunk ${index + 1}: Retry ${retryCount}/${maxRetries} after ${delay}ms`,
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  const durationMs = performance.now() - startTime;
  return {
    index,
    output: "",
    tokens: { inputTokens: 0, outputTokens: 0 },
    durationMs,
    retryCount,
    error: lastError?.message ?? "Unknown error",
  };
}

/**
 * Process chunks in parallel with controlled concurrency.
 * Results are returned in original chunk order regardless of completion order.
 */
export async function correctChunksParallel(
  chunks: string[],
  model: ModelId,
  config: ParallelConfig,
): Promise<ParallelCorrectionResult> {
  const concurrencyLimit =
    config.concurrency === "full" ? chunks.length : config.concurrency;

  const semaphore = new Semaphore(concurrencyLimit);
  const results: ChunkResult[] = Array.from({ length: chunks.length });

  const wallClockStart = performance.now();

  // Create tasks for all chunks
  const tasks = chunks.map(async (textChunk, index) => {
    await semaphore.acquire();

    try {
      console.log(`  Starting chunk ${index + 1}/${chunks.length}`);
      const result = await processChunk(textChunk, index, model, config);
      results[index] = result;

      if (result.error) {
        console.log(`  Chunk ${index + 1}: ERROR - ${result.error}`);
      } else {
        console.log(
          `  Chunk ${index + 1}: Done in ${(result.durationMs / 1000).toFixed(1)}s`,
        );
      }
    } finally {
      semaphore.release();
    }
  });

  // Wait for all tasks to complete
  await Promise.all(tasks);

  const wallClockMs = performance.now() - wallClockStart;

  // Calculate totals
  const totalProcessingMs = results.reduce((sum, r) => sum + r.durationMs, 0);
  const retries = results.reduce((sum, r) => sum + r.retryCount, 0);
  const errors = results.filter(r => r.error).length;

  return {
    chunks: results,
    wallClockMs,
    totalProcessingMs,
    retries,
    errors,
  };
}

/**
 * Get ordered outputs from parallel results for deduplication.
 */
export function getOrderedOutputs(result: ParallelCorrectionResult): string[] {
  return result.chunks.map(c => c.output);
}
