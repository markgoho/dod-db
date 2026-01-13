/**
 * Accuracy measurement functions for transcript correction experiments.
 */

export interface AccuracyMetrics {
  levenshteinDistance: number;
  levenshteinSimilarity: number; // 0-1, higher is better
  lineMatchPercentage: number;
  timestampPreservationRate: number;
  dataLossDetected: boolean;
  characterDelta: number; // output - expected length
}

export interface LineMismatch {
  line: number;
  expected: string;
  actual: string;
}

export interface LineMatchResult {
  matchingLines: number;
  totalLines: number;
  percentage: number;
  mismatches: LineMismatch[];
}

/**
 * Calculate Levenshtein distance between two strings.
 * Uses dynamic programming with O(min(m,n)) space optimization.
 */
export function levenshteinDistance(str1: string, str2: string): number {
  // Optimize by ensuring str1 is the shorter string
  if (str1.length > str2.length) {
    [str1, str2] = [str2, str1];
  }

  const m = str1.length;
  const n = str2.length;

  // Use single array for space optimization
  let previousRow = Array.from({ length: m + 1 }, (_, i) => i);
  let currentRow = Array.from<number>({ length: m + 1 });

  for (let j = 1; j <= n; j++) {
    currentRow[0] = j;

    for (let i = 1; i <= m; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      currentRow[i] = Math.min(
        (previousRow[i] ?? 0) + 1, // deletion
        (currentRow[i - 1] ?? 0) + 1, // insertion
        (previousRow[i - 1] ?? 0) + cost, // substitution
      );
    }

    // Swap rows
    [previousRow, currentRow] = [currentRow, previousRow];
  }

  return previousRow[m] ?? 0;
}

/**
 * Calculate Levenshtein similarity as a value between 0 and 1.
 * 1 means identical, 0 means completely different.
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;

  const distance = levenshteinDistance(str1, str2);
  return 1 - distance / maxLength;
}

/**
 * Compare two texts line by line.
 */
export function lineByLineMatch(
  output: string,
  groundTruth: string,
  maxMismatches = 10,
): LineMatchResult {
  const outputLines = output.split('\n');
  const truthLines = groundTruth.split('\n');

  let matching = 0;
  const mismatches: LineMismatch[] = [];

  const maxLines = Math.max(outputLines.length, truthLines.length);

  for (let i = 0; i < maxLines; i++) {
    const outLine = outputLines[i] ?? '';
    const truthLine = truthLines[i] ?? '';

    if (outLine === truthLine) {
      matching++;
    } else if (mismatches.length < maxMismatches) {
      mismatches.push({
        line: i + 1,
        expected: truthLine,
        actual: outLine,
      });
    }
  }

  return {
    matchingLines: matching,
    totalLines: maxLines,
    percentage: maxLines === 0 ? 100 : (matching / maxLines) * 100,
    mismatches,
  };
}

/**
 * Check timestamp preservation between input and output.
 */
export function checkTimestampPreservation(
  input: string,
  output: string,
): { inputCount: number; outputCount: number; preservationRate: number } {
  const timestampPattern = /\[(\d{1,2}:\d{2}:\d{2}(?:\.\d{3})?)\]/g;

  const inputMatches = input.match(timestampPattern) ?? [];
  const outputMatches = output.match(timestampPattern) ?? [];

  const inputTimestamps = new Set(inputMatches);
  const outputTimestamps = new Set(outputMatches);

  let preserved = 0;
  for (const ts of inputTimestamps) {
    if (outputTimestamps.has(ts)) preserved++;
  }

  return {
    inputCount: inputTimestamps.size,
    outputCount: outputTimestamps.size,
    preservationRate:
      inputTimestamps.size === 0 ? 1 : preserved / inputTimestamps.size,
  };
}

/**
 * Detect data loss by comparing output length to expected length.
 */
export function detectDataLoss(
  expected: string,
  actual: string,
  threshold = 0.9,
): { detected: boolean; ratio: number; characterDelta: number } {
  const ratio = expected.length === 0 ? 1 : actual.length / expected.length;
  return {
    detected: ratio < threshold,
    ratio,
    characterDelta: actual.length - expected.length,
  };
}

/**
 * Measure all accuracy metrics comparing output to ground truth.
 */
export function measureAccuracy(
  output: string,
  groundTruth: string,
  maxMismatches = 10,
): AccuracyMetrics {
  const levDistance = levenshteinDistance(output, groundTruth);
  const levSimilarity = levenshteinSimilarity(output, groundTruth);
  const lineMatch = lineByLineMatch(output, groundTruth, maxMismatches);
  const timestamps = checkTimestampPreservation(groundTruth, output);
  const dataLoss = detectDataLoss(groundTruth, output);

  return {
    levenshteinDistance: levDistance,
    levenshteinSimilarity: levSimilarity,
    lineMatchPercentage: lineMatch.percentage,
    timestampPreservationRate: timestamps.preservationRate,
    dataLossDetected: dataLoss.detected,
    characterDelta: dataLoss.characterDelta,
  };
}

/**
 * Format accuracy metrics for display.
 */
export function formatAccuracyMetrics(metrics: AccuracyMetrics): string {
  return [
    `Levenshtein Similarity: ${(metrics.levenshteinSimilarity * 100).toFixed(2)}%`,
    `Line Match: ${metrics.lineMatchPercentage.toFixed(2)}%`,
    `Timestamp Preservation: ${(metrics.timestampPreservationRate * 100).toFixed(2)}%`,
    `Character Delta: ${metrics.characterDelta > 0 ? '+' : ''}${metrics.characterDelta}`,
    metrics.dataLossDetected ? 'WARNING: Data loss detected!' : '',
  ]
    .filter(Boolean)
    .join('\n');
}
