#!/usr/bin/env bun
/**
 * Model comparison experiment for LLM correction.
 *
 * Compares different Gemini models on the same transcripts.
 *
 * Usage:
 *   bun run experiments/runners/model-comparison.ts --all
 *   bun run experiments/runners/model-comparison.ts --model=gemini-2.0-flash
 *   bun run experiments/runners/model-comparison.ts --transcript=0 --model=gemini-2.0-flash
 */

import { chunk } from "llm-chunk";
import { parseArgs } from "node:util";
import { ai } from "../../src/ai.js";
import { correctionChunking } from "../../src/config/chunking.js";
import { globalCorrections } from "../../src/config/corrections.js";
import {
  applyDeterministicCorrections,
  deduplicateChunks,
} from "../../src/pipeline/correct-utils.js";
import { correctionPrompt } from "../../src/prompts/correction.js";
import {
  MODELS_TO_TEST,
  SAMPLE_TRANSCRIPTS,
  type ModelId,
} from "../config/experiment-config.js";
import { formatAccuracyMetrics, measureAccuracy } from "../lib/accuracy.js";
import {
  aggregateCosts,
  calculateCost,
  formatCost,
  type TokenUsage,
} from "../lib/cost-calculator.js";
import {
  printSummary,
  writeResults,
  type ModelComparisonResult,
  type TimingMetrics,
} from "../lib/results-reporter.js";

/**
 * Run correction with a specific model on a single transcript.
 */
async function runWithModel(
  rawPath: string,
  truthPath: string,
  transcriptName: string,
  model: ModelId,
): Promise<ModelComparisonResult> {
  console.log(`\n=== Processing: ${transcriptName} ===`);
  console.log(`  Model: ${model}`);

  const rawTranscript = await Bun.file(rawPath).text();
  const groundTruth = await Bun.file(truthPath).text();

  const wallClockStart = performance.now();
  const chunkTimings: Array<{ durationMs: number; tokens: TokenUsage }> = [];

  // Step 1: Deterministic corrections
  const deterStart = performance.now();
  const { correctedText: afterDeterministic, count: deterCount } =
    applyDeterministicCorrections(rawTranscript, globalCorrections);
  const deterMs = performance.now() - deterStart;
  console.log(
    `  Deterministic: ${deterCount} corrections in ${deterMs.toFixed(0)}ms`,
  );

  // Step 2: Chunking
  const chunkStart = performance.now();
  const chunks = chunk(afterDeterministic, correctionChunking);
  const chunkMs = performance.now() - chunkStart;
  console.log(`  Chunks: ${chunks.length}`);

  // Step 3: Sequential LLM correction
  const correctedChunks: string[] = [];
  const llmStart = performance.now();

  for (const [index, textChunk] of chunks.entries()) {
    const chunkStartTime = performance.now();
    process.stdout.write(`    Chunk ${index + 1}/${chunks.length}...`);

    const response = await ai.models.generateContent({
      model,
      contents: correctionPrompt(textChunk),
    });

    const durationMs = performance.now() - chunkStartTime;
    const usage = response.usageMetadata;
    const tokens: TokenUsage = {
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
    };

    chunkTimings.push({ durationMs, tokens });
    console.log(` ${(durationMs / 1000).toFixed(1)}s`);

    if (response.text) {
      correctedChunks.push(response.text);
    }
  }

  const llmTotalMs = performance.now() - llmStart;

  // Step 4: Deduplication
  const dedupStart = performance.now();
  const output = deduplicateChunks(correctedChunks, correctionChunking.overlap);
  const dedupMs = performance.now() - dedupStart;

  const wallClockMs = performance.now() - wallClockStart;

  // Calculate metrics
  const accuracy = measureAccuracy(output, groundTruth);
  console.log("\n  Accuracy:");
  console.log(formatAccuracyMetrics(accuracy));

  // Calculate cost
  const costs = chunkTimings.map(ct => calculateCost(model, ct.tokens));
  const totalCost = aggregateCosts(costs);
  console.log("\n  Cost:");
  console.log(formatCost(totalCost));

  const timing: TimingMetrics = {
    deterministicMs: deterMs,
    chunkingMs: chunkMs,
    llmTotalMs,
    perChunkMs: chunkTimings.map(ct => ct.durationMs),
    deduplicationMs: dedupMs,
    wallClockMs,
  };

  console.log(`\n  Total time: ${(wallClockMs / 1000).toFixed(1)}s`);

  return {
    transcript: rawPath,
    transcriptName,
    model,
    chunks: chunks.length,
    timing,
    cost: totalCost,
    accuracy,
  };
}

/**
 * Run model comparison on all samples with all models.
 */
async function runFullComparison(): Promise<void> {
  console.log("=== FULL MODEL COMPARISON ===\n");
  console.log("Models:", MODELS_TO_TEST);
  console.log("Transcripts:", SAMPLE_TRANSCRIPTS.length);

  const allResults: Map<ModelId, ModelComparisonResult[]> = new Map();

  for (const model of MODELS_TO_TEST) {
    console.log(`\n\n========================================`);
    console.log(`MODEL: ${model}`);
    console.log(`========================================`);

    const results: ModelComparisonResult[] = [];

    for (const sample of SAMPLE_TRANSCRIPTS) {
      const result = await runWithModel(
        sample.raw,
        sample.truth,
        sample.name,
        model,
      );
      results.push(result);
    }

    allResults.set(model, results);

    // Write per-model results
    const avgAccuracy =
      results.reduce((sum, r) => sum + r.accuracy.levenshteinSimilarity, 0) /
      results.length;
    const avgCost =
      results.reduce((sum, r) => sum + r.cost.totalCost, 0) / results.length;
    const avgTime =
      results.reduce((sum, r) => sum + r.timing.wallClockMs, 0) /
      results.length;

    await writeResults("model-comparison", results, {
      totalTranscripts: results.length,
      avgAccuracy,
      avgCostPerTranscript: avgCost,
      avgTimePerTranscript: avgTime,
      recommendations: [`Model: ${model}`],
    });
  }

  // Print comparison summary
  console.log("\n\n========================================");
  console.log("MODEL COMPARISON SUMMARY");
  console.log("========================================");
  console.log(
    "\nModel                    | Accuracy | Cost/Trans | Time/Trans",
  );
  console.log("-------------------------|----------|------------|------------");

  for (const [model, results] of allResults) {
    const avgAccuracy =
      results.reduce((sum, r) => sum + r.accuracy.levenshteinSimilarity, 0) /
      results.length;
    const avgCost =
      results.reduce((sum, r) => sum + r.cost.totalCost, 0) / results.length;
    const avgTime =
      results.reduce((sum, r) => sum + r.timing.wallClockMs, 0) /
      results.length;

    console.log(
      `${model.padEnd(24)} | ${(avgAccuracy * 100).toFixed(1).padStart(6)}% | $${avgCost.toFixed(5).padStart(9)} | ${(avgTime / 1000).toFixed(1).padStart(8)}s`,
    );
  }

  // Find best options
  const bestAccuracy = [...allResults.entries()].sort(
    (a, b) =>
      b[1].reduce((s, r) => s + r.accuracy.levenshteinSimilarity, 0) -
      a[1].reduce((s, r) => s + r.accuracy.levenshteinSimilarity, 0),
  )[0]?.[0];

  const cheapest = [...allResults.entries()].sort(
    (a, b) =>
      a[1].reduce((s, r) => s + r.cost.totalCost, 0) -
      b[1].reduce((s, r) => s + r.cost.totalCost, 0),
  )[0]?.[0];

  const fastest = [...allResults.entries()].sort(
    (a, b) =>
      a[1].reduce((s, r) => s + r.timing.wallClockMs, 0) -
      b[1].reduce((s, r) => s + r.timing.wallClockMs, 0),
  )[0]?.[0];

  console.log("\nRecommendations:");
  console.log(`  Best accuracy: ${bestAccuracy}`);
  console.log(`  Cheapest: ${cheapest}`);
  console.log(`  Fastest: ${fastest}`);
}

/**
 * Run with a single model on all samples.
 */
async function runSingleModel(
  model: ModelId,
): Promise<ModelComparisonResult[]> {
  const results: ModelComparisonResult[] = [];

  for (const sample of SAMPLE_TRANSCRIPTS) {
    const result = await runWithModel(
      sample.raw,
      sample.truth,
      sample.name,
      model,
    );
    results.push(result);
  }

  return results;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      all: { type: "boolean", default: false },
      model: { type: "string" },
      transcript: { type: "string" },
    },
  });

  if (values.all) {
    await runFullComparison();
    return;
  }

  if (!values.model) {
    console.log("Usage:");
    console.log("  bun run experiments/runners/model-comparison.ts --all");
    console.log(
      "  bun run experiments/runners/model-comparison.ts --model=gemini-2.0-flash",
    );
    console.log(
      "  bun run experiments/runners/model-comparison.ts --transcript=0 --model=gemini-2.0-flash",
    );
    console.log("\nAvailable models:", MODELS_TO_TEST.join(", "));
    return;
  }

  const model = values.model as ModelId;
  if (!MODELS_TO_TEST.includes(model)) {
    console.error(`Invalid model: ${model}`);
    console.error("Valid models:", MODELS_TO_TEST.join(", "));
    process.exit(1);
  }

  let results: ModelComparisonResult[];

  if (values.transcript === undefined) {
    results = await runSingleModel(model);
  } else {
    const index = Number.parseInt(values.transcript, 10);
    const sample = SAMPLE_TRANSCRIPTS[index];
    if (!sample) {
      console.error(`Invalid transcript index: ${index}`);
      process.exit(1);
    }
    results = [
      await runWithModel(sample.raw, sample.truth, sample.name, model),
    ];
  }

  // Print summary
  const avgAccuracy =
    results.reduce((sum, r) => sum + r.accuracy.levenshteinSimilarity, 0) /
    results.length;
  const avgCost =
    results.reduce((sum, r) => sum + r.cost.totalCost, 0) / results.length;
  const avgTime =
    results.reduce((sum, r) => sum + r.timing.wallClockMs, 0) / results.length;

  printSummary({
    totalTranscripts: results.length,
    avgAccuracy,
    avgCostPerTranscript: avgCost,
    avgTimePerTranscript: avgTime,
    recommendations: [],
  });

  await writeResults("model-comparison", results, {
    totalTranscripts: results.length,
    avgAccuracy,
    avgCostPerTranscript: avgCost,
    avgTimePerTranscript: avgTime,
    recommendations: [`Model: ${model}`],
  });
}

main().catch(console.error);
