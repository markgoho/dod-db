#!/usr/bin/env bun
/**
 * Baseline measurement script for LLM correction.
 *
 * Replicates the current sequential correction flow and captures:
 * - Per-chunk timing
 * - Token usage from API responses
 * - Accuracy vs ground truth
 *
 * Usage:
 *   bun run experiments/runners/baseline.ts --all
 *   bun run experiments/runners/baseline.ts --transcript=0
 *   bun run experiments/runners/baseline.ts --dry-run
 */

import { chunk } from "llm-chunk";
import { parseArgs } from "node:util";
import { ai } from "../../src/ai.js";
import { correctionChunking } from "../../src/config/chunking.js";
import { globalCorrections } from "../../src/config/corrections.js";
import { reviewModel } from "../../src/config/models.js";
import {
  applyDeterministicCorrections,
  deduplicateChunks,
} from "../../src/pipeline/correct-utils.js";
import { correctionPrompt } from "../../src/prompts/correction.js";
import {
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
  calculateSummary,
  printSummary,
  writeResults,
  type BaselineResult,
  type TimingMetrics,
} from "../lib/results-reporter.js";

interface ChunkTiming {
  index: number;
  durationMs: number;
  tokens: TokenUsage;
}

/**
 * Run baseline correction on a single transcript.
 */
async function runBaselineSingle(
  rawPath: string,
  truthPath: string,
  transcriptName: string,
  model: string = reviewModel,
): Promise<BaselineResult> {
  console.log(`\n=== Processing: ${transcriptName} ===`);
  console.log(`  Raw: ${rawPath}`);
  console.log(`  Truth: ${truthPath}`);
  console.log(`  Model: ${model}`);

  const rawTranscript = await Bun.file(rawPath).text();
  const groundTruth = await Bun.file(truthPath).text();

  const chunkTimings: ChunkTiming[] = [];
  const wallClockStart = performance.now();

  // Step 1: Deterministic corrections
  console.log("\n  Step 1: Deterministic corrections...");
  const deterStart = performance.now();
  const { correctedText: afterDeterministic, count: deterCount } =
    applyDeterministicCorrections(rawTranscript, globalCorrections);
  const deterMs = performance.now() - deterStart;
  console.log(
    `    Applied ${deterCount} corrections in ${deterMs.toFixed(0)}ms`,
  );

  // Step 2: Chunking
  console.log("\n  Step 2: Chunking...");
  const chunkStart = performance.now();
  const chunks = chunk(afterDeterministic, correctionChunking);
  const chunkMs = performance.now() - chunkStart;
  console.log(`    Created ${chunks.length} chunks in ${chunkMs.toFixed(0)}ms`);

  // Step 3: Sequential LLM correction
  console.log("\n  Step 3: LLM correction (sequential)...");
  const correctedChunks: string[] = [];
  const llmStart = performance.now();

  for (const [index, textChunk] of chunks.entries()) {
    const chunkStartTime = performance.now();
    console.log(`    Chunk ${index + 1}/${chunks.length}...`);

    const response = await ai.models.generateContent({
      model,
      contents: correctionPrompt(textChunk),
    });

    const chunkEndTime = performance.now();
    const durationMs = chunkEndTime - chunkStartTime;

    // Extract token usage
    const usage = response.usageMetadata;
    const tokens: TokenUsage = {
      inputTokens: usage?.promptTokenCount ?? 0,
      outputTokens: usage?.candidatesTokenCount ?? 0,
    };

    chunkTimings.push({ index, durationMs, tokens });
    console.log(
      `      Done in ${(durationMs / 1000).toFixed(1)}s (${tokens.inputTokens}+${tokens.outputTokens} tokens)`,
    );

    if (response.text) {
      correctedChunks.push(response.text);
    }
  }

  const llmTotalMs = performance.now() - llmStart;

  // Step 4: Deduplication
  console.log("\n  Step 4: Deduplication...");
  const dedupStart = performance.now();
  const output = deduplicateChunks(correctedChunks, correctionChunking.overlap);
  const dedupMs = performance.now() - dedupStart;
  console.log(`    Completed in ${dedupMs.toFixed(0)}ms`);

  const wallClockMs = performance.now() - wallClockStart;

  // Calculate metrics
  console.log("\n  Measuring accuracy...");
  const accuracy = measureAccuracy(output, groundTruth);
  console.log(formatAccuracyMetrics(accuracy));

  // Calculate cost
  const costs = chunkTimings.map(ct =>
    calculateCost(model as ModelId, ct.tokens),
  );
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
    chunks: chunks.length,
    timing,
    cost: totalCost,
    accuracy,
    model,
  };
}

/**
 * Run baseline on all sample transcripts.
 */
async function runBaselineAll(): Promise<BaselineResult[]> {
  const results: BaselineResult[] = [];

  for (const sample of SAMPLE_TRANSCRIPTS) {
    const result = await runBaselineSingle(
      sample.raw,
      sample.truth,
      sample.name,
    );
    results.push(result);
  }

  return results;
}

/**
 * Dry run - show what would be processed without calling API.
 */
async function dryRun(): Promise<void> {
  console.log("=== DRY RUN ===\n");
  console.log("Sample transcripts to process:");

  for (const [index, sample] of SAMPLE_TRANSCRIPTS.entries()) {
    const rawFile = Bun.file(sample.raw);
    const truthFile = Bun.file(sample.truth);

    const rawExists = await rawFile.exists();
    const truthExists = await truthFile.exists();

    console.log(`\n${index + 1}. ${sample.name}`);
    console.log(`   Raw: ${sample.raw} (${rawExists ? "exists" : "MISSING"})`);
    console.log(
      `   Truth: ${sample.truth} (${truthExists ? "exists" : "MISSING"})`,
    );

    if (rawExists) {
      const rawText = await rawFile.text();
      const chunks = chunk(rawText, correctionChunking);
      console.log(`   Size: ${(rawText.length / 1024).toFixed(1)} KB`);
      console.log(`   Chunks: ${chunks.length}`);
    }
  }

  console.log(`\nModel: ${reviewModel}`);
  console.log("Chunking config:", correctionChunking);
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      all: { type: "boolean", default: false },
      transcript: { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
  });

  if (values["dry-run"]) {
    await dryRun();
    return;
  }

  let results: BaselineResult[];

  if (values.transcript !== undefined) {
    const index = Number.parseInt(values.transcript, 10);
    const sample = SAMPLE_TRANSCRIPTS[index];
    if (!sample) {
      console.error(`Invalid transcript index: ${index}`);
      console.error(`Valid range: 0-${SAMPLE_TRANSCRIPTS.length - 1}`);
      process.exit(1);
    }
    results = [await runBaselineSingle(sample.raw, sample.truth, sample.name)];
  } else if (values.all) {
    results = await runBaselineAll();
  } else {
    console.log("Usage:");
    console.log("  bun run experiments/runners/baseline.ts --all");
    console.log("  bun run experiments/runners/baseline.ts --transcript=0");
    console.log("  bun run experiments/runners/baseline.ts --dry-run");
    return;
  }

  // Calculate and print summary
  const summary = calculateSummary(results);
  printSummary(summary);

  // Write results
  await writeResults("baseline", results, summary);
}

main().catch(console.error);
