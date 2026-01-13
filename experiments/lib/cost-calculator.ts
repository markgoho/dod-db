/**
 * Cost calculation utilities using official Gemini API pricing.
 */

import { MODEL_PRICING, type ModelId } from '../config/experiment-config.js';

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface CostBreakdown {
  inputTokens: number;
  outputTokens: number;
  inputCost: number; // USD
  outputCost: number; // USD
  totalCost: number; // USD
  model: string;
}

/**
 * Calculate cost for a given model and token usage.
 * Uses official Gemini pricing (per 1M tokens).
 *
 * @param model - The model ID
 * @param usage - Token counts from API response usageMetadata
 * @returns Cost breakdown in USD
 */
export function calculateCost(model: ModelId, usage: TokenUsage): CostBreakdown {
  const pricing = MODEL_PRICING[model];

  const inputCost = (usage.inputTokens * pricing.input) / 1_000_000;
  const outputCost = (usage.outputTokens * pricing.output) / 1_000_000;

  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    model,
  };
}

/**
 * Aggregate costs from multiple API calls.
 */
export function aggregateCosts(costs: CostBreakdown[]): CostBreakdown {
  if (costs.length === 0) {
    return {
      inputTokens: 0,
      outputTokens: 0,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      model: 'none',
    };
  }

  const model = costs[0]?.model ?? 'unknown';

  let inputTokens = 0;
  let outputTokens = 0;
  let inputCost = 0;
  let outputCost = 0;
  let totalCost = 0;

  for (const cost of costs) {
    inputTokens += cost.inputTokens;
    outputTokens += cost.outputTokens;
    inputCost += cost.inputCost;
    outputCost += cost.outputCost;
    totalCost += cost.totalCost;
  }

  return { inputTokens, outputTokens, inputCost, outputCost, totalCost, model };
}

/**
 * Format cost for display.
 */
export function formatCost(cost: CostBreakdown): string {
  return [
    `Model: ${cost.model}`,
    `Input: ${cost.inputTokens.toLocaleString()} tokens ($${cost.inputCost.toFixed(6)})`,
    `Output: ${cost.outputTokens.toLocaleString()} tokens ($${cost.outputCost.toFixed(6)})`,
    `Total: $${cost.totalCost.toFixed(6)}`,
  ].join('\n');
}

/**
 * Compare costs between two models.
 */
export function compareCosts(
  cost1: CostBreakdown,
  cost2: CostBreakdown,
): { savings: number; savingsPercent: number; cheaper: string } {
  const savings = cost1.totalCost - cost2.totalCost;
  const savingsPercent =
    cost1.totalCost === 0 ? 0 : (savings / cost1.totalCost) * 100;
  const cheaper = savings > 0 ? cost2.model : cost1.model;

  return { savings: Math.abs(savings), savingsPercent: Math.abs(savingsPercent), cheaper };
}
