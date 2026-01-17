#!/usr/bin/env bun
/**
 * Verification script for experiment results.
 *
 * Compares experiment outputs to ensure correctness and no regressions.
 *
 * Usage:
 *   bun run experiments/runners/verify-results.ts
 *   bun run experiments/runners/verify-results.ts --baseline=<file>
 */

import { readdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import {
  ACCURACY_THRESHOLDS,
  OUTPUT_CONFIG,
} from "../config/experiment-config.js";
import type {
  BaselineResult,
  ExperimentRun,
  ModelComparisonResult,
  ParallelResult,
} from "../lib/results-reporter.js";

interface VerificationResult {
  file: string;
  type: string;
  passed: boolean;
  issues: string[];
  summary: {
    transcripts: number;
    avgAccuracy: number;
    avgCost: number;
    avgTime: number;
  };
}

/**
 * Load all result files from the results directory.
 */
async function loadAllResults(): Promise<Map<string, ExperimentRun<unknown>>> {
  const results = new Map<string, ExperimentRun<unknown>>();

  try {
    const files = await readdir(OUTPUT_CONFIG.directory);

    for (const file of files) {
      if (!file.endsWith(".json")) continue;

      const filepath = `${OUTPUT_CONFIG.directory}/${file}`;
      const content = await Bun.file(filepath).text();
      const run = JSON.parse(content) as ExperimentRun<unknown>;
      results.set(file, run);
    }
  } catch (error) {
    console.error("Error loading results:", error);
  }

  return results;
}

/**
 * Verify baseline results.
 */
function verifyBaseline(
  run: ExperimentRun<BaselineResult>,
): VerificationResult {
  const issues: string[] = [];
  const results = run.results;

  for (const result of results) {
    // Check accuracy thresholds
    if (
      result.accuracy.levenshteinSimilarity <
      ACCURACY_THRESHOLDS.minLevenshteinSimilarity
    ) {
      issues.push(
        `${result.transcriptName}: Low accuracy ${(result.accuracy.levenshteinSimilarity * 100).toFixed(1)}%`,
      );
    }

    // Check timestamp preservation
    if (
      result.accuracy.timestampPreservationRate <
      ACCURACY_THRESHOLDS.minTimestampPreservation
    ) {
      issues.push(
        `${result.transcriptName}: Low timestamp preservation ${(result.accuracy.timestampPreservationRate * 100).toFixed(1)}%`,
      );
    }

    // Check for data loss
    if (result.accuracy.dataLossDetected) {
      issues.push(`${result.transcriptName}: Data loss detected!`);
    }
  }

  const avgAccuracy =
    results.reduce((s, r) => s + r.accuracy.levenshteinSimilarity, 0) /
    results.length;
  const avgCost =
    results.reduce((s, r) => s + r.cost.totalCost, 0) / results.length;
  const avgTime =
    results.reduce((s, r) => s + r.timing.wallClockMs, 0) / results.length;

  return {
    file: "",
    type: "baseline",
    passed: issues.length === 0,
    issues,
    summary: {
      transcripts: results.length,
      avgAccuracy,
      avgCost,
      avgTime,
    },
  };
}

/**
 * Verify parallel results against baseline.
 */
function verifyParallel(
  run: ExperimentRun<ParallelResult>,
  baseline?: ExperimentRun<BaselineResult>,
): VerificationResult {
  const issues: string[] = [];
  const results = run.results;

  for (const result of results) {
    // Check accuracy thresholds
    if (
      result.accuracy.levenshteinSimilarity <
      ACCURACY_THRESHOLDS.minLevenshteinSimilarity
    ) {
      issues.push(
        `${result.transcriptName}: Low accuracy ${(result.accuracy.levenshteinSimilarity * 100).toFixed(1)}%`,
      );
    }

    // Check for errors
    if (result.errors > 0) {
      issues.push(
        `${result.transcriptName}: ${result.errors} errors during processing`,
      );
    }

    // Compare to baseline if available
    if (baseline) {
      const baselineResult = baseline.results.find(
        r => r.transcript === result.transcript,
      );
      if (baselineResult) {
        const accuracyDiff =
          result.accuracy.levenshteinSimilarity -
          baselineResult.accuracy.levenshteinSimilarity;
        if (accuracyDiff < -0.001) {
          // 0.1% regression
          issues.push(
            `${result.transcriptName}: Accuracy regression of ${(Math.abs(accuracyDiff) * 100).toFixed(2)}% vs baseline`,
          );
        }
      }
    }
  }

  const avgAccuracy =
    results.reduce((s, r) => s + r.accuracy.levenshteinSimilarity, 0) /
    results.length;
  const avgCost =
    results.reduce((s, r) => s + r.cost.totalCost, 0) / results.length;
  const avgTime =
    results.reduce((s, r) => s + r.timing.wallClockMs, 0) / results.length;

  return {
    file: "",
    type: "parallel",
    passed: issues.length === 0,
    issues,
    summary: {
      transcripts: results.length,
      avgAccuracy,
      avgCost,
      avgTime,
    },
  };
}

/**
 * Verify model comparison results.
 */
function verifyModelComparison(
  run: ExperimentRun<ModelComparisonResult>,
): VerificationResult {
  const issues: string[] = [];
  const results = run.results;

  for (const result of results) {
    // Check accuracy thresholds
    if (
      result.accuracy.levenshteinSimilarity <
      ACCURACY_THRESHOLDS.minLevenshteinSimilarity
    ) {
      issues.push(
        `${result.model} - ${result.transcriptName}: Low accuracy ${(result.accuracy.levenshteinSimilarity * 100).toFixed(1)}%`,
      );
    }

    // Check for data loss
    if (result.accuracy.dataLossDetected) {
      issues.push(
        `${result.model} - ${result.transcriptName}: Data loss detected!`,
      );
    }
  }

  const avgAccuracy =
    results.reduce((s, r) => s + r.accuracy.levenshteinSimilarity, 0) /
    results.length;
  const avgCost =
    results.reduce((s, r) => s + r.cost.totalCost, 0) / results.length;
  const avgTime =
    results.reduce((s, r) => s + r.timing.wallClockMs, 0) / results.length;

  return {
    file: "",
    type: "model-comparison",
    passed: issues.length === 0,
    issues,
    summary: {
      transcripts: results.length,
      avgAccuracy,
      avgCost,
      avgTime,
    },
  };
}

/**
 * Find the most recent baseline run.
 */
function findLatestBaseline(
  runs: Map<string, ExperimentRun<unknown>>,
): ExperimentRun<BaselineResult> | undefined {
  const baselineRuns = [...runs.entries()]
    .filter(([_, run]) => run.experimentType === "baseline")
    .sort(([_, a], [__, b]) => b.timestamp.localeCompare(a.timestamp));

  return baselineRuns[0]?.[1] as ExperimentRun<BaselineResult> | undefined;
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      baseline: { type: "string" },
    },
  });

  console.log("=== EXPERIMENT VERIFICATION ===\n");

  const runs = await loadAllResults();

  if (runs.size === 0) {
    console.log("No results found in", OUTPUT_CONFIG.directory);
    console.log("Run experiments first:");
    console.log("  bun run experiments/runners/baseline.ts --all");
    return;
  }

  console.log(`Found ${runs.size} result file(s)\n`);

  // Find baseline for comparison
  let baseline: ExperimentRun<BaselineResult> | undefined;
  if (values.baseline) {
    const content = await Bun.file(values.baseline).text();
    baseline = JSON.parse(content) as ExperimentRun<BaselineResult>;
    console.log(`Using specified baseline: ${values.baseline}\n`);
  } else {
    baseline = findLatestBaseline(runs);
    if (baseline) {
      console.log(`Using latest baseline from: ${baseline.timestamp}\n`);
    }
  }

  const verifications: VerificationResult[] = [];

  // Verify each run
  for (const [file, run] of runs) {
    let result: VerificationResult;

    switch (run.experimentType) {
      case "baseline": {
        result = verifyBaseline(run as ExperimentRun<BaselineResult>);
        break;
      }
      case "parallel": {
        result = verifyParallel(run as ExperimentRun<ParallelResult>, baseline);
        break;
      }
      case "model-comparison": {
        result = verifyModelComparison(
          run as ExperimentRun<ModelComparisonResult>,
        );
        break;
      }
      default: {
        continue;
      }
    }

    result.file = file;
    verifications.push(result);
  }

  // Print results
  console.log("Results:");
  console.log("-".repeat(80));

  for (const v of verifications) {
    const status = v.passed ? "PASS" : "FAIL";
    const statusColor = v.passed ? "\u001B[32m" : "\u001B[31m";
    console.log(`\n${statusColor}[${status}]\u001B[0m ${v.file}`);
    console.log(`  Type: ${v.type}`);
    console.log(`  Transcripts: ${v.summary.transcripts}`);
    console.log(`  Avg Accuracy: ${(v.summary.avgAccuracy * 100).toFixed(2)}%`);
    console.log(`  Avg Cost: $${v.summary.avgCost.toFixed(6)}`);
    console.log(`  Avg Time: ${(v.summary.avgTime / 1000).toFixed(1)}s`);

    if (v.issues.length > 0) {
      console.log("  Issues:");
      for (const issue of v.issues) {
        console.log(`    - ${issue}`);
      }
    }
  }

  // Summary
  const passed = verifications.filter(v => v.passed).length;
  const failed = verifications.filter(v => !v.passed).length;

  console.log("\n" + "=".repeat(80));
  console.log(`\nSummary: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
