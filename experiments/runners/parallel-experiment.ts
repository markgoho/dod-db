#!/usr/bin/env bun
/**
 * Parallel processing experiment for LLM correction.
 *
 * Tests different concurrency levels to find optimal parallelization.
 *
 * Usage:
 *   bun run experiments/runners/parallel-experiment.ts --concurrency=4
 *   bun run experiments/runners/parallel-experiment.ts --concurrency=full
 *   bun run experiments/runners/parallel-experiment.ts --all-concurrency
 */

import { chunk } from "llm-chunk";
import { parseArgs } from "node:util";
import { correctionChunking } from "../../src/config/chunking.js";
import { globalCorrections } from "../../src/config/corrections.js";
import { reviewModel } from "../../src/config/models.js";
import {
  applyDeterministicCorrections,
  deduplicateChunks,
} from "../../src/pipeline/correct-utils.js";
import {
  CONCURRENCY_LEVELS,
  SAMPLE_TRANSCRIPTS,
  type ConcurrencyLevel,
  type ModelId,
} from "../config/experiment-config.js";
import { formatAccuracyMetrics, measureAccuracy } from "../lib/accuracy.js";
import {
  aggregateCosts,
  calculateCost,
  formatCost,
} from "../lib/cost-calculator.js";
import {
  correctChunksParallel,
  getOrderedOutputs,
} from "../lib/parallel-corrector.js";
import {
  calculateSummary,
  printSummary,
  writeResults,
  type ParallelResult,
} from "../lib/results-reporter.js";

/**
 * Run parallel correction on a single transcript.
 */
async function runParallelSingle(
  rawPath: string,
  truthPath: string,
  transcriptName: string,
  concurrency: ConcurrencyLevel,
  model: string = reviewModel,
  baselineWallClockMs?: number,
): Promise<ParallelResult> {
  console.log(`\n=== Processing: ${transcriptName} ===`);
  console.log(`  Concurrency: ${concurrency}`);
  console.log(`  Model: ${model}`);

  const rawTranscript = await Bun.file(rawPath).text();
  const groundTruth = await Bun.file(truthPath).text();

  // Step 1: Deterministic corrections
  console.log("\n  Step 1: Deterministic corrections...");
  const { correctedText: afterDeterministic, count: deterCount } =
    applyDeterministicCorrections(rawTranscript, globalCorrections);
  console.log(`    Applied ${deterCount} corrections`);

  // Step 2: Chunking
  console.log("\n  Step 2: Chunking...");
  const chunks = chunk(afterDeterministic, correctionChunking);
  console.log(`    Created ${chunks.length} chunks`);

  // Step 3: Parallel LLM correction
  console.log(
    `\n  Step 3: Parallel LLM correction (concurrency=${concurrency})...`,
  );
  const parallelResult = await correctChunksParallel(chunks, model as ModelId, {
    concurrency,
  });

  console.log(
    `    Wall clock: ${(parallelResult.wallClockMs / 1000).toFixed(1)}s`,
  );
  console.log(
    `    Total processing: ${(parallelResult.totalProcessingMs / 1000).toFixed(1)}s`,
  );
  console.log(`    Retries: ${parallelResult.retries}`);
  console.log(`    Errors: ${parallelResult.errors}`);

  // Step 4: Deduplication
  console.log("\n  Step 4: Deduplication...");
  const correctedChunks = getOrderedOutputs(parallelResult);
  const output = deduplicateChunks(correctedChunks, correctionChunking.overlap);

  // Calculate metrics
  console.log("\n  Measuring accuracy...");
  const accuracy = measureAccuracy(output, groundTruth);
  console.log(formatAccuracyMetrics(accuracy));

  // Calculate cost
  const costs = parallelResult.chunks.map(c =>
    calculateCost(model as ModelId, c.tokens),
  );
  const totalCost = aggregateCosts(costs);
  console.log("\n  Cost:");
  console.log(formatCost(totalCost));

  // Calculate speedup if baseline provided
  const speedupFactor = baselineWallClockMs
    ? baselineWallClockMs / parallelResult.wallClockMs
    : parallelResult.totalProcessingMs / parallelResult.wallClockMs;

  console.log(`\n  Speedup factor: ${speedupFactor.toFixed(2)}x`);

  return {
    transcript: rawPath,
    transcriptName,
    concurrency,
    chunks: chunks.length,
    timing: {
      wallClockMs: parallelResult.wallClockMs,
      totalProcessingMs: parallelResult.totalProcessingMs,
      perChunkMs: parallelResult.chunks.map(c => c.durationMs),
    },
    cost: totalCost,
    accuracy,
    speedupFactor,
    retries: parallelResult.retries,
    errors: parallelResult.errors,
    model,
  };
}

/**
 * Run parallel experiment with specific concurrency on all samples.
 */
async function runParallelExperiment(
  concurrency: ConcurrencyLevel,
): Promise<ParallelResult[]> {
  const results: ParallelResult[] = [];

  for (const sample of SAMPLE_TRANSCRIPTS) {
    const result = await runParallelSingle(
      sample.raw,
      sample.truth,
      sample.name,
      concurrency,
    );
    results.push(result);
  }

  return results;
}

/**
 * Run all concurrency levels and compare.
 */
async function runAllConcurrencyLevels(): Promise<void> {
  console.log("=== Running all concurrency levels ===\n");

  const allResults: Map<ConcurrencyLevel, ParallelResult[]> = new Map();

  for (const concurrency of CONCURRENCY_LEVELS) {
    console.log(`\n\n========================================`);
    console.log(`CONCURRENCY LEVEL: ${concurrency}`);
    console.log(`========================================`);

    const results = await runParallelExperiment(concurrency);
    allResults.set(concurrency, results);

    const summary = calculateSummary(results);
    printSummary(summary);

    await writeResults("parallel", results, {
      ...summary,
      recommendations: [
        `Concurrency: ${concurrency}`,
        ...summary.recommendations,
      ],
    });
  }

  // Print comparison
  console.log("\n\n========================================");
  console.log("CONCURRENCY COMPARISON");
  console.log("========================================");

  for (const [concurrency, results] of allResults) {
    const avgTime =
      results.reduce((sum, r) => sum + r.timing.wallClockMs, 0) /
      results.length;
    const avgSpeedup =
      results.reduce((sum, r) => sum + r.speedupFactor, 0) / results.length;
    console.log(
      `  ${String(concurrency).padStart(4)}: ${(avgTime / 1000).toFixed(1)}s avg (${avgSpeedup.toFixed(2)}x speedup)`,
    );
  }
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      concurrency: { type: "string" },
      "all-concurrency": { type: "boolean", default: false },
      transcript: { type: "string" },
    },
  });

  if (values["all-concurrency"]) {
    await runAllConcurrencyLevels();
    return;
  }

  if (!values.concurrency) {
    console.log("Usage:");
    console.log(
      "  bun run experiments/runners/parallel-experiment.ts --concurrency=4",
    );
    console.log(
      "  bun run experiments/runners/parallel-experiment.ts --concurrency=full",
    );
    console.log(
      "  bun run experiments/runners/parallel-experiment.ts --all-concurrency",
    );
    return;
  }

  const concurrency: ConcurrencyLevel =
    values.concurrency === "full"
      ? "full"
      : Number.parseInt(values.concurrency, 10);

  if (typeof concurrency === "number" && Number.isNaN(concurrency)) {
    console.error('Invalid concurrency value. Use a number or "full".');
    process.exit(1);
  }

  let results: ParallelResult[];

  if (values.transcript === undefined) {
    results = await runParallelExperiment(concurrency);
  } else {
    const index = Number.parseInt(values.transcript, 10);
    const sample = SAMPLE_TRANSCRIPTS[index];
    if (!sample) {
      console.error(`Invalid transcript index: ${index}`);
      process.exit(1);
    }
    results = [
      await runParallelSingle(
        sample.raw,
        sample.truth,
        sample.name,
        concurrency,
      ),
    ];
  }

  const summary = calculateSummary(results);
  printSummary(summary);

  await writeResults("parallel", results, summary);
}

main().catch(console.error);
