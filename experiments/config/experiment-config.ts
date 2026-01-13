/**
 * Experiment configuration for LLM correction optimization.
 */

// Official Gemini pricing (per 1M tokens) as of January 2025
export const MODEL_PRICING = {
  'gemini-2.0-flash': { input: 0.1, output: 0.4 },
  'gemini-2.5-flash': { input: 0.3, output: 2.5 },
  'gemini-3-flash-preview': { input: 0.5, output: 3 },
} as const;

export type ModelId = keyof typeof MODEL_PRICING;

export const MODELS_TO_TEST: ModelId[] = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
];

// Sample transcripts for experiments (diverse set)
export const SAMPLE_TRANSCRIPTS = [
  {
    name: 'Episode 1 - In the Beginning',
    raw: 'data/transcripts/2023-04-08-episode-1-april-8-2023-in-the-beginning-raw.txt',
    truth: 'data/transcripts/2023-04-08-episode-1-april-8-2023-in-the-beginning.txt',
    sizeBytes: 86_176,
    characteristics: ['longest', 'foundational episode', 'many Hebrew terms'],
  },
  {
    name: 'Episode 4 - Ehrmageddon with Bart Ehrman',
    raw: 'data/transcripts/2023-05-01-episode-4-may-1-2023-ehrmageddon-with-bart-ehrman-raw.txt',
    truth: 'data/transcripts/2023-05-01-episode-4-may-1-2023-ehrmageddon-with-bart-ehrman.txt',
    sizeBytes: 67_927,
    characteristics: ['guest episode', 'textual criticism focus'],
  },
  {
    name: 'Episode 5 - Betrayed by Dan Brown',
    raw: 'data/transcripts/2023-05-08-episode-5-may-8-2023-betrayed-by-dan-brown-raw.txt',
    truth: 'data/transcripts/2023-05-08-episode-5-may-8-2023-betrayed-by-dan-brown.txt',
    sizeBytes: 64_292,
    characteristics: ['shorter episode', 'pop culture references'],
  },
  {
    name: 'Episode 10 - Adam and Steve',
    raw: 'data/transcripts/2023-06-12-episode-10-june-12-2023-adam-and-steve-what-the-bible-says-about-homosexuality-raw.txt',
    truth: 'data/transcripts/2023-06-12-episode-10-june-12-2023-adam-and-steve-what-the-bible-says-about-homosexuality.txt',
    sizeBytes: 86_655,
    characteristics: ['complex theological terms', 'Greek terms'],
  },
  {
    name: 'Apostlepalooza',
    raw: 'data/transcripts/2023-07-24-apostlepalooza-raw.txt',
    truth: 'data/transcripts/2023-07-24-apostlepalooza.txt',
    sizeBytes: 78_128,
    characteristics: ['special episode', 'multiple topics', 'fast-paced'],
  },
] as const;

// Concurrency levels to test
export const CONCURRENCY_LEVELS = [2, 4, 8, 'full'] as const;
export type ConcurrencyLevel = number | 'full';

// Accuracy thresholds for validation
export const ACCURACY_THRESHOLDS = {
  minLevenshteinSimilarity: 0.95,
  minLineMatchPercentage: 90,
  minTimestampPreservation: 0.99,
  dataLossThreshold: 0.9, // Alert if output < 90% of expected length
} as const;

// Parallel processing config
export const PARALLEL_CONFIG = {
  retryAttempts: 3,
  retryDelayMs: 1000,
  rateLimitPerMinute: 60,
} as const;

// Output config
export const OUTPUT_CONFIG = {
  directory: 'experiments/results',
  includeDetailedMismatches: true,
  maxMismatchesToLog: 10,
} as const;
