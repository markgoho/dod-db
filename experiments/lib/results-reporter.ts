/**
 * Results reporting and persistence utilities.
 */

import { OUTPUT_CONFIG } from "../config/experiment-config.js";
import type { AccuracyMetrics } from "./accuracy.js";
import type { CostBreakdown } from "./cost-calculator.js";

export type ExperimentType = "baseline" | "parallel" | "model-comparison";

export interface TimingMetrics {
  deterministicMs: number;
  chunkingMs: number;
  llmTotalMs: number;
  perChunkMs: number[];
  deduplicationMs: number;
  wallClockMs: number;
}

export interface BaselineResult {
  transcript: string;
  transcriptName: string;
  chunks: number;
  timing: TimingMetrics;
  cost: CostBreakdown;
  accuracy: AccuracyMetrics;
  model: string;
}

export interface ParallelResult {
  transcript: string;
  transcriptName: string;
  concurrency: number | "full";
  chunks: number;
  timing: {
    wallClockMs: number;
    totalProcessingMs: number;
    perChunkMs: number[];
  };
  cost: CostBreakdown;
  accuracy: AccuracyMetrics;
  speedupFactor: number;
  retries: number;
  errors: number;
  model: string;
}

export interface ModelComparisonResult {
  transcript: string;
  transcriptName: string;
  model: string;
  chunks: number;
  timing: TimingMetrics;
  cost: CostBreakdown;
  accuracy: AccuracyMetrics;
}

export interface ExperimentRun<T> {
  id: string;
  timestamp: string;
  experimentType: ExperimentType;
  gitCommit: string;
  environment: {
    bunVersion: string;
    platform: string;
  };
  results: T[];
  summary: {
    totalTranscripts: number;
    avgAccuracy: number;
    avgCostPerTranscript: number;
    avgTimePerTranscript: number;
    recommendations: string[];
  };
}

/**
 * Generate a unique experiment ID.
 */
export function generateExperimentId(): string {
  const timestamp = new Date().toISOString().replaceAll(/[:.]/g, "-");
  const random = Math.random().toString(36).slice(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Get environment information.
 */
export function getEnvironmentInfo(): ExperimentRun<unknown>["environment"] {
  return {
    bunVersion: Bun.version,
    platform: process.platform,
  };
}

/**
 * Get current git commit hash.
 */
export async function getGitCommit(): Promise<string> {
  try {
    const proc = Bun.spawn(["git", "rev-parse", "--short", "HEAD"], {
      stdout: "pipe",
    });
    const output = await new Response(proc.stdout).text();
    return output.trim();
  } catch {
    return "unknown";
  }
}

/**
 * Write experiment results to file.
 */
export async function writeResults<T>(
  experimentType: ExperimentType,
  results: T[],
  summary: ExperimentRun<T>["summary"],
): Promise<string> {
  const id = generateExperimentId();
  const gitCommit = await getGitCommit();

  const run: ExperimentRun<T> = {
    id,
    timestamp: new Date().toISOString(),
    experimentType,
    gitCommit,
    environment: getEnvironmentInfo(),
    results,
    summary,
  };

  const filename = `${experimentType}-${id}.json`;
  const filepath = `${OUTPUT_CONFIG.directory}/${filename}`;

  await Bun.write(filepath, JSON.stringify(run, null, 2));

  console.log(`\nResults written to: ${filepath}`);
  return filepath;
}

/**
 * Load previous experiment runs.
 */
export async function loadPreviousRuns<T>(
  experimentType: ExperimentType,
): Promise<Array<ExperimentRun<T>>> {
  const { readdir } = await import("node:fs/promises");

  try {
    const files = await readdir(OUTPUT_CONFIG.directory);
    const runs: Array<ExperimentRun<T>> = [];

    for (const file of files) {
      if (file.startsWith(experimentType) && file.endsWith(".json")) {
        const content = await Bun.file(
          `${OUTPUT_CONFIG.directory}/${file}`,
        ).text();
        runs.push(JSON.parse(content) as ExperimentRun<T>);
      }
    }

    return runs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch {
    return [];
  }
}

/**
 * Calculate summary statistics from results.
 */
export function calculateSummary(
  results: Array<{
    accuracy: AccuracyMetrics;
    cost: CostBreakdown;
    timing: { wallClockMs: number };
  }>,
): ExperimentRun<unknown>["summary"] {
  if (results.length === 0) {
    return {
      totalTranscripts: 0,
      avgAccuracy: 0,
      avgCostPerTranscript: 0,
      avgTimePerTranscript: 0,
      recommendations: [],
    };
  }

  const avgAccuracy =
    results.reduce((sum, r) => sum + r.accuracy.levenshteinSimilarity, 0) /
    results.length;
  const avgCost =
    results.reduce((sum, r) => sum + r.cost.totalCost, 0) / results.length;
  const avgTime =
    results.reduce((sum, r) => sum + r.timing.wallClockMs, 0) / results.length;

  const recommendations: string[] = [];

  if (avgAccuracy < 0.95) {
    recommendations.push(
      "Accuracy below 95% - consider reviewing model choice",
    );
  }
  if (avgCost > 0.01) {
    recommendations.push("Cost >$0.01/transcript - consider cheaper model");
  }

  return {
    totalTranscripts: results.length,
    avgAccuracy,
    avgCostPerTranscript: avgCost,
    avgTimePerTranscript: avgTime,
    recommendations,
  };
}

/**
 * Print summary to console.
 */
export function printSummary(summary: ExperimentRun<unknown>["summary"]): void {
  console.log("\n=== SUMMARY ===");
  console.log(`Transcripts processed: ${summary.totalTranscripts}`);
  console.log(`Average accuracy: ${(summary.avgAccuracy * 100).toFixed(2)}%`);
  console.log(`Average cost: $${summary.avgCostPerTranscript.toFixed(6)}`);
  console.log(
    `Average time: ${(summary.avgTimePerTranscript / 1000).toFixed(1)}s`,
  );

  if (summary.recommendations.length > 0) {
    console.log("\nRecommendations:");
    for (const rec of summary.recommendations) {
      console.log(`  - ${rec}`);
    }
  }
}
