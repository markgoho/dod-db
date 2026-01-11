/**
 * Automated learning from raw vs corrected transcript comparison.
 * Identifies corrections made by LLM and suggests additions to deterministic list.
 */

interface CorrectionSuggestion {
  original: string;
  corrected: string;
  count: number;
}

/**
 * Compare raw and corrected transcripts to identify LLM corrections.
 * Suggests which corrections should be added to the deterministic list.
 */
export function analyzeCorrections(
  rawTranscript: string,
  correctedTranscript: string,
): void {
  const rawLines = rawTranscript.split('\n').filter((l) => l.trim());
  const correctedLines = correctedTranscript.split('\n').filter((l) => l.trim());

  // Build maps indexed by timestamp for alignment
  const rawByTimestamp = new Map<string, string>();
  const correctedByTimestamp = new Map<string, string>();

  for (const line of rawLines) {
    const timestamp = extractTimestamp(line);
    if (timestamp) {
      rawByTimestamp.set(timestamp, line);
    }
  }

  for (const line of correctedLines) {
    const timestamp = extractTimestamp(line);
    if (timestamp) {
      correctedByTimestamp.set(timestamp, line);
    }
  }

  // Track all corrections
  const corrections = new Map<string, CorrectionSuggestion>();

  // Compare by timestamp (handles line count mismatches)
  for (const [timestamp, rawLine] of rawByTimestamp) {
    const correctedLine = correctedByTimestamp.get(timestamp);
    if (!correctedLine || rawLine === correctedLine) continue;

    // Extract text content (after timestamp and speaker)
    const rawText = extractText(rawLine);
    const correctedText = extractText(correctedLine);

    if (!rawText || !correctedText) continue;

    // Find word-level differences
    const rawWords = rawText.split(/\s+/);
    const correctedWords = correctedText.split(/\s+/);

    // Simple word-by-word comparison
    const maxLength = Math.max(rawWords.length, correctedWords.length);
    for (let j = 0; j < maxLength; j++) {
      const rawWord = rawWords[j]?.replace(/[.,!?;:()[\]]/g, '').toLowerCase();
      const correctedWord = correctedWords[j]
        ?.replace(/[.,!?;:()[\]]/g, '')
        .toLowerCase();

      if (rawWord && correctedWord && rawWord !== correctedWord) {
        // Found a correction
        const key = `${rawWord}→${correctedWord}`;
        if (corrections.has(key)) {
          const suggestion = corrections.get(key)!;
          suggestion.count++;
        } else {
          corrections.set(key, {
            original: rawWord,
            corrected: correctedWord,
            count: 1,
          });
        }
      }
    }
  }

  // Print results
  if (corrections.size === 0) {
    console.log('\n✓ No corrections needed - transcript was already accurate!');
    return;
  }

  // Sort by frequency (most common first)
  const sortedCorrections = Array.from(corrections.values()).sort(
    (a, b) => b.count - a.count,
  );

  console.log('\n📚 Learning Report: LLM Corrections Made');
  console.log('==========================================\n');

  // High-priority suggestions (5+ occurrences)
  const highPriority = sortedCorrections.filter((c) => c.count >= 5);
  if (highPriority.length > 0) {
    console.log('🔥 HIGH PRIORITY (5+ occurrences) - Add to corrections.ts:');
    console.log('-----------------------------------------------------------');
    for (const correction of highPriority) {
      console.log(`  ${correction.original} → ${correction.corrected}`);
      console.log(`    Occurrences: ${correction.count}`);
      console.log(
        `    Suggested rule: [["${correction.original}"], "${correction.corrected}"],`,
      );
      console.log('');
    }
  }

  // Medium-priority suggestions (2-4 occurrences)
  const mediumPriority = sortedCorrections.filter(
    (c) => c.count >= 2 && c.count < 5,
  );
  if (mediumPriority.length > 0) {
    console.log('📌 MEDIUM PRIORITY (2-4 occurrences):');
    console.log('--------------------------------------');
    for (const correction of mediumPriority) {
      console.log(
        `  ${correction.original} → ${correction.corrected} (${correction.count}x)`,
      );
    }
    console.log('');
  }

  // Low-priority (1 occurrence)
  const lowPriority = sortedCorrections.filter((c) => c.count === 1);
  if (lowPriority.length > 0) {
    console.log(`ℹ️  Low priority (1 occurrence): ${lowPriority.length} items`);
    console.log('   (Not shown - only add if highly specific terms)\n');
  }

  // Summary
  console.log('Summary:');
  console.log(`  Total corrections: ${corrections.size}`);
  console.log(`  High priority: ${highPriority.length}`);
  console.log(`  Medium priority: ${mediumPriority.length}`);
  console.log(`  Low priority: ${lowPriority.length}`);
  console.log(
    '\n💡 Add high-priority rules to src/config/corrections.ts for faster processing!\n',
  );
}

/**
 * Extract timestamp from a transcript line
 */
function extractTimestamp(line: string): string | null {
  // Match: [HH:MM:SS.mmm] or [HH:MM:SS] with optional spaces
  const match = line.match(/^\[(\d{2}:\d{2}:\d{2}(?:\.\d{3})?)\]/);
  return match?.[1]?.replace(/\s+/g, '') ?? null; // Remove any spaces
}

/**
 * Extract text content from a transcript line (removes timestamp and speaker)
 */
function extractText(line: string): string | null {
  // Match: [HH:MM:SS.mmm] Speaker Name: text (with optional spaces in timestamp)
  const match = line.match(/^\[[\d:.\s]+\]\s+.+?:\s+(.+)$/);
  return match?.[1] ?? null;
}
