/**
 * Review and approve high-confidence correction candidates.
 *
 * This script shows you corrections that have been identified across
 * multiple episodes and lets you approve them for addition to
 * src/config/corrections.ts
 *
 * Usage:
 *   bun run src/scripts/review-corrections.ts [--min-confidence 50]
 */

import {
  loadTracker,
  getHighConfidenceCandidates,
  type CorrectionCandidate,
} from '../pipeline/correction-tracker.js';

async function reviewCorrections(minConfidence = 50) {
  console.log('📋 Loading correction candidates...\n');

  const tracker = await loadTracker();
  const candidates = getHighConfidenceCandidates(tracker, minConfidence);

  if (candidates.length === 0) {
    console.log(
      '✨ No high-confidence candidates found yet. Process more episodes!\n',
    );
    console.log(
      `   Current threshold: ${minConfidence}% confidence (lower with --min-confidence)\n`,
    );
    return;
  }

  console.log(
    `Found ${candidates.length} candidates with ≥${minConfidence}% confidence:\n`,
  );
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Group by confidence level
  const highConfidence = candidates.filter((c) => c.confidence >= 70);
  const mediumConfidence = candidates.filter(
    (c) => c.confidence >= 60 && c.confidence < 70,
  );
  const lowConfidence = candidates.filter((c) => c.confidence < 60);

  if (highConfidence.length > 0) {
    console.log('🔥 HIGH CONFIDENCE (70-100%):');
    console.log('────────────────────────────\n');
    displayCandidates(highConfidence);
  }

  if (mediumConfidence.length > 0) {
    console.log('\n⚡ MEDIUM CONFIDENCE (60-69%):');
    console.log('──────────────────────────────\n');
    displayCandidates(mediumConfidence);
  }

  if (lowConfidence.length > 0) {
    console.log('\n✨ LOWER CONFIDENCE (50-59%):');
    console.log('────────────────────────────\n');
    displayCandidates(lowConfidence);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📝 TO ADD THESE TO CORRECTIONS:');
  console.log('──────────────────────────────\n');
  console.log('1. Open src/config/corrections.ts');
  console.log('2. Add the suggested rules from above');
  console.log(
    '3. Re-run past episodes to verify (use --force flag) or continue with new episodes\n',
  );
  console.log('💡 Tip: Start with HIGH confidence corrections first!\n');
}

function displayCandidates(candidates: CorrectionCandidate[]) {
  for (const candidate of candidates) {
    const categoryBadge = {
      'biblical-term': '📖',
      'proper-noun': '📛',
      spelling: '✏️',
      capitalization: '🔤',
    }[candidate.category];

    console.log(
      `${categoryBadge} ${candidate.original} → ${candidate.corrected}`,
    );
    console.log(`   Confidence: ${candidate.confidence}%`);
    console.log(
      `   Appears in: ${candidate.episodeCount} episode(s), ${candidate.totalOccurrences} time(s) total`,
    );
    console.log(`   Episodes: ${candidate.episodes.join(', ')}`);
    console.log(
      `   Suggested rule: [["${candidate.original}"], "${candidate.corrected}"],`,
    );
    console.log(`   Example: ${candidate.examples[0]}`);
    console.log('');
  }
}

// Parse command line args
const arguments_ = process.argv.slice(2);
let minConfidence = 50;

for (let index = 0; index < arguments_.length; index++) {
  const nextArgument = arguments_[index + 1];
  if (arguments_[index] === '--min-confidence' && nextArgument) {
    minConfidence = Number.parseInt(nextArgument, 10);
    if (Number.isNaN(minConfidence) || minConfidence < 0 || minConfidence > 100) {
      console.error('Error: --min-confidence must be between 0 and 100');
      process.exit(1);
    }
  }
}

reviewCorrections(minConfidence);
