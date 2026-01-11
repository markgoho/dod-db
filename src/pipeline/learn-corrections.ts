/**
 * Automated learning from raw vs corrected transcript comparison.
 * Identifies corrections made by LLM and suggests additions to deterministic list.
 */

interface CorrectionSuggestion {
  original: string;
  corrected: string;
  count: number;
  category: 'capitalization' | 'spelling' | 'proper-noun' | 'biblical-term';
  examples: string[]; // Store raw text example contexts
  correctedExamples: string[]; // Store corrected text examples
  timestamps: string[]; // Store timestamps for examples
}

/**
 * Calculate Levenshtein distance between two strings.
 * Used to determine if two words are similar (likely a typo/mishearing)
 * vs completely different (likely sentence restructuring).
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );

  for (let i = 0; i <= m; i++) {
    const row = dp[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= n; j++) {
    const firstRow = dp[0];
    if (firstRow) firstRow[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const currentRow = dp[i];
      const prevRow = dp[i - 1];
      if (!currentRow || !prevRow) continue;

      if (str1[i - 1] === str2[j - 1]) {
        const val = prevRow[j - 1];
        currentRow[j] = val ?? 0;
      } else {
        const deletion = prevRow[j] ?? 0;
        const insertion = currentRow[j - 1] ?? 0;
        const substitution = prevRow[j - 1] ?? 0;
        currentRow[j] = Math.min(deletion + 1, insertion + 1, substitution + 1);
      }
    }
  }

  const lastRow = dp[m];
  return lastRow?.[n] ?? 0;
}

// Common English words to filter out (not candidates for deterministic corrections)
const COMMON_WORDS = new Set([
  'the',
  'of',
  'in',
  'to',
  'and',
  'a',
  'is',
  'it',
  'that',
  'be',
  'for',
  'on',
  'with',
  'as',
  'by',
  'at',
  'or',
  'an',
  'this',
  'from',
  'they',
  'we',
  'you',
  'he',
  'she',
  'was',
  'were',
  'been',
  'are',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'can',
  'but',
  'not',
  'what',
  'which',
  'who',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'some',
  'any',
  'more',
  'most',
  'other',
  'such',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'about',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'again',
  'once',
  'here',
  'there',
  'then',
  'now',
  'also',
  'being',
  'going',
  'people',
  'know',
  'think',
  'say',
  'get',
  'make',
  'go',
  'see',
  'come',
  'take',
  'give',
  'find',
  'tell',
  'ask',
  'work',
  'seem',
  'feel',
  'try',
  'leave',
  'call',
]);

// Biblical and theological terms (if we see these, they're likely good candidates)
const BIBLICAL_TERMS = new Set([
  'torah',
  'septuagint',
  'apocrypha',
  'deuteronomy',
  'genesis',
  'exodus',
  'leviticus',
  'numbers',
  'revelation',
  'apocalypse',
  'messiah',
  'yhwh',
  'yahweh',
  'elohim',
  'adonai',
  'gospel',
  'epistle',
  'testament',
  'apostle',
  'pharisee',
  'sadducee',
  'essene',
  'zealot',
  'synagogue',
  'sanhedrin',
  'pentateuch',
  'psalms',
  'proverbs',
  'prophets',
  'maccabees',
  'josephus',
  'philo',
  'talmud',
  'midrash',
  'mishnah',
  'aramaic',
  'hebrew',
  'koine',
  'byzantine',
  'alexandrian',
  'codex',
  'papyrus',
  'manuscript',
  'textual',
  'canonical',
  'apocryphal',
  'deuterocanonical',
]);

/**
 * Compare raw and corrected transcripts to identify LLM corrections.
 * Suggests which corrections should be added to the deterministic list.
 */
export async function analyzeCorrections(
  rawTranscript: string,
  correctedTranscript: string,
  episodeId?: string,
): Promise<void> {
  const rawLines = rawTranscript.split('\n').filter((l) => l.trim());
  const correctedLines = correctedTranscript
    .split('\n')
    .filter((l) => l.trim());

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

    // Skip if sentence length changed at all (even 1 word causes misalignment)
    // Word-by-word comparison only works when word count is identical
    if (rawWords.length !== correctedWords.length) {
      continue;
    }

    // Detect multi-word patterns
    for (let j = 0; j < correctedWords.length - 1; j++) {
      const correctedWord1Orig = correctedWords[j]?.replace(/[.,!?;:()[\]"]/g, '');
      const correctedWord2Orig = correctedWords[j + 1]?.replace(/[.,!?;:()[\]"]/g, '');
      const rawWord1Orig = rawWords[j]?.replace(/[.,!?;:()[\]"]/g, '');
      const rawWord2Orig = rawWords[j + 1]?.replace(/[.,!?;:()[\]"]/g, '');

      if (!correctedWord1Orig || !correctedWord2Orig || !rawWord1Orig || !rawWord2Orig) continue;

      const correctedWord1 = correctedWord1Orig.toLowerCase();
      const correctedWord2 = correctedWord2Orig.toLowerCase();
      const rawWord1 = rawWord1Orig.toLowerCase();
      const rawWord2 = rawWord2Orig.toLowerCase();

      // Check for 2-word capitalization patterns (e.g., "hebrew bible" → "Hebrew Bible")
      if (rawWord1 === correctedWord1 && rawWord2 === correctedWord2) {
        // Same words, check if only capitalization changed
        if (rawWord1Orig !== correctedWord1Orig || rawWord2Orig !== correctedWord2Orig) {
          // Capitalization change in a 2-word phrase
          const originalPhrase = rawWord1Orig + ' ' + rawWord2Orig;
          const correctedPhrase = correctedWord1Orig + ' ' + correctedWord2Orig;

          // Skip if it's common words
          if (COMMON_WORDS.has(rawWord1) || COMMON_WORDS.has(rawWord2)) continue;

          const key = `${originalPhrase.toLowerCase()}→${correctedPhrase.toLowerCase()}`;

          if (corrections.has(key)) {
            const suggestion = corrections.get(key)!;
            suggestion.count++;
            if (suggestion.examples.length < 3) {
              suggestion.examples.push(
                `"${rawWords.slice(Math.max(0, j - 2), j + 4).join(' ')}"`,
              );
              suggestion.correctedExamples.push(
                `"${correctedWords.slice(Math.max(0, j - 2), j + 4).join(' ')}"`,
              );
              suggestion.timestamps.push(timestamp);
            }
          } else {
            corrections.set(key, {
              original: originalPhrase,
              corrected: correctedPhrase,
              count: 1,
              category: 'capitalization',
              examples: [
                `"${rawWords.slice(Math.max(0, j - 2), j + 4).join(' ')}"`,
              ],
              correctedExamples: [
                `"${correctedWords.slice(Math.max(0, j - 2), j + 4).join(' ')}"`,
              ],
              timestamps: [timestamp],
            });
          }
        }
      }
    }

    // Simple word-by-word comparison
    const maxLength = Math.max(rawWords.length, correctedWords.length);
    for (let j = 0; j < maxLength; j++) {
      const rawWordOriginal = rawWords[j]?.replace(/[.,!?;:()[\]"]/g, '');
      const correctedWordOriginal = correctedWords[j]?.replace(
        /[.,!?;:()[\]"]/g,
        '',
      );

      if (!rawWordOriginal || !correctedWordOriginal) continue;

      const rawWord = rawWordOriginal.toLowerCase();
      const correctedWord = correctedWordOriginal.toLowerCase();

      if (rawWord !== correctedWord) {
        // Skip if it's a common English word (likely context-dependent)
        if (COMMON_WORDS.has(rawWord) || COMMON_WORDS.has(correctedWord)) {
          continue;
        }

        // Skip very short words (often artifacts)
        if (rawWord.length < 3 || correctedWord.length < 3) {
          continue;
        }

        // Determine category
        let category: CorrectionSuggestion['category'] = 'spelling';

        // Check if it's only a capitalization difference
        if (rawWord === correctedWord && rawWordOriginal !== correctedWordOriginal) {
          category = 'capitalization';
        }
        // Check if it's a biblical term
        else if (
          BIBLICAL_TERMS.has(rawWord) ||
          BIBLICAL_TERMS.has(correctedWord)
        ) {
          category = 'biblical-term';
        }
        // Check if it looks like a proper noun (capitalized in correction)
        else if (
          correctedWordOriginal[0] === correctedWordOriginal[0]?.toUpperCase() &&
          rawWordOriginal[0] !== rawWordOriginal[0]?.toUpperCase()
        ) {
          category = 'proper-noun';
        }

        // Found a correction
        // Use lowercase for key comparison, but preserve original case in stored values
        const key = `${rawWord}→${correctedWord}`;
        if (corrections.has(key)) {
          const suggestion = corrections.get(key)!;
          suggestion.count++;
          // Store up to 3 example contexts (both raw and corrected)
          if (suggestion.examples.length < 3) {
            suggestion.examples.push(
              `"${rawWords.slice(Math.max(0, j - 2), j + 3).join(' ')}"`,
            );
            suggestion.correctedExamples.push(
              `"${correctedWords.slice(Math.max(0, j - 2), j + 3).join(' ')}"`,
            );
            suggestion.timestamps.push(timestamp);
          }
        } else {
          corrections.set(key, {
            original: rawWordOriginal, // Preserve original case
            corrected: correctedWordOriginal, // Preserve corrected case
            count: 1,
            category,
            examples: [
              `"${rawWords.slice(Math.max(0, j - 2), j + 3).join(' ')}"`,
            ],
            correctedExamples: [
              `"${correctedWords.slice(Math.max(0, j - 2), j + 3).join(' ')}"`,
            ],
            timestamps: [timestamp],
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

  // Separate by category
  const capitalizations = Array.from(corrections.values())
    .filter((c) => c.category === 'capitalization')
    .sort((a, b) => b.count - a.count);

  const biblicalTerms = Array.from(corrections.values())
    .filter((c) => c.category === 'biblical-term')
    .sort((a, b) => b.count - a.count);

  const properNouns = Array.from(corrections.values())
    .filter((c) => c.category === 'proper-noun')
    .sort((a, b) => b.count - a.count);

  const spellingCorrections = Array.from(corrections.values())
    .filter((c) => c.category === 'spelling')
    .sort((a, b) => b.count - a.count);

  console.log('\n📚 Learning Report: LLM Corrections Analysis');
  console.log('==============================================\n');

  // Biblical/Theological Terms (HIGHEST PRIORITY)
  const highPriorityBiblical = biblicalTerms.filter((c) => c.count >= 2);
  if (highPriorityBiblical.length > 0) {
    console.log('🔥 BIBLICAL/THEOLOGICAL TERMS (2+ occurrences):');
    console.log('------------------------------------------------');
    console.log('These are EXCELLENT candidates for corrections.ts!\n');
    for (const correction of highPriorityBiblical) {
      console.log(`  ${correction.original} → ${correction.corrected}`);
      console.log(`    Occurrences: ${correction.count}`);
      console.log(
        `    Suggested rule: [["${correction.original}"], "${correction.corrected}"],`,
      );
      console.log(`    Example: ${correction.examples[0]}`);
      console.log('');
    }
  }

  // Proper Nouns
  const highPriorityNouns = properNouns.filter((c) => c.count >= 3);
  if (highPriorityNouns.length > 0) {
    console.log('📛 PROPER NOUNS (3+ occurrences):');
    console.log('----------------------------------');
    console.log('Review these - could be scholar names, places, etc.\n');
    for (const correction of highPriorityNouns) {
      console.log(
        `  ${correction.original} → ${correction.corrected} (${correction.count}x)`,
      );
      console.log(`    Example: ${correction.examples[0]}`);
      console.log('');
    }
  }

  // Capitalization patterns
  const frequentCapitalizations = capitalizations.filter((c) => c.count >= 3);
  if (frequentCapitalizations.length > 0) {
    console.log('🔤 CAPITALIZATION PATTERNS (3+ occurrences):');
    console.log('--------------------------------------------');
    console.log('These might be worth adding if they are specific terms.\n');
    for (const correction of frequentCapitalizations) {
      console.log(
        `  ${correction.original} → ${correction.corrected} (${correction.count}x)`,
      );
    }
    console.log('');
  }

  // Spelling corrections
  const highPrioritySpelling = spellingCorrections.filter((c) => c.count >= 3);
  if (highPrioritySpelling.length > 0) {
    console.log('✏️  SPELLING CORRECTIONS (3+ occurrences):');
    console.log('------------------------------------------');
    for (const correction of highPrioritySpelling) {
      console.log(
        `  ${correction.original} → ${correction.corrected} (${correction.count}x)`,
      );
      console.log(`    Example: ${correction.examples[0]}`);
      console.log('');
    }
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Total unique corrections: ${corrections.size}`);
  console.log(`  Biblical/Theological terms: ${biblicalTerms.length}`);
  console.log(`    └─ High priority (2+): ${highPriorityBiblical.length}`);
  console.log(`  Proper nouns: ${properNouns.length}`);
  console.log(`    └─ High priority (3+): ${highPriorityNouns.length}`);
  console.log(`  Capitalization patterns: ${capitalizations.length}`);
  console.log(
    `    └─ High priority (3+): ${frequentCapitalizations.length}`,
  );
  console.log(`  Spelling corrections: ${spellingCorrections.length}`);
  console.log(`    └─ High priority (3+): ${highPrioritySpelling.length}`);
  console.log(
    '\n💡 Focus on Biblical/Theological terms first - they have the highest ROI!\n',
  );

  // Update tracker with corrections from this episode
  if (episodeId) {
    const {
      loadTracker,
      saveTracker,
      updateTracker,
      getHighConfidenceCandidates,
    } = await import('./correction-tracker.js');

    // Filter corrections to only track high-quality candidates
    // We only want to track systematic transcription errors, not sentence reorganization
    const highQualityCandidates = Array.from(corrections.values()).filter(
      (c) => {
        // Skip very different words (likely sentence restructuring, not transcription errors)
        // Calculate Levenshtein distance as a ratio
        const maxLen = Math.max(c.original.length, c.corrected.length);
        const similarity = 1 - levenshteinDistance(c.original, c.corrected) / maxLen;

        // Only track if words are similar (>40% similar) OR it's a biblical term OR proper noun
        const isSimilar = similarity > 0.4;
        const isImportantCategory = c.category === 'biblical-term' || c.category === 'proper-noun';

        if (!isSimilar && !isImportantCategory) {
          return false;
        }

        // Skip if it appears only once in this episode (not systematic enough)
        if (c.count < 2) {
          return false;
        }

        return true;
      },
    );

    // Prepare corrections for tracker
    const allCorrections = highQualityCandidates.map((c) => ({
      original: c.original,
      corrected: c.corrected,
      category: c.category,
      count: c.count,
      examples: c.examples,
      correctedExamples: c.correctedExamples,
      timestamps: c.timestamps,
    }));

    // Load, update, and save tracker
    const tracker = await loadTracker();
    updateTracker(tracker, episodeId, allCorrections);
    await saveTracker(tracker);

    // Show high-confidence candidates across all episodes
    const highConfidence = getHighConfidenceCandidates(tracker, 50);

    if (highConfidence.length > 0) {
      console.log('\n⭐ HIGH-CONFIDENCE CANDIDATES (across all episodes):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(
        '🎯 These corrections appear in multiple episodes and are strong',
      );
      console.log('   candidates for adding to src/config/corrections.ts\n');

      for (const candidate of highConfidence.slice(0, 10)) {
        // Top 10
        const badge =
          candidate.confidence >= 70
            ? '🔥'
            : candidate.confidence >= 60
              ? '⚡'
              : '✨';
        console.log(
          `${badge} ${candidate.original} → ${candidate.corrected} (${candidate.confidence}% confidence)`,
        );
        console.log(
          `   Category: ${candidate.category} | Episodes: ${candidate.episodeCount} | Total: ${candidate.totalOccurrences}x`,
        );
        console.log(
          `   Suggested rule: [["${candidate.original}"], "${candidate.corrected}"],`,
        );
        console.log(`   Example: ${candidate.examples[0]}`);
        console.log('');
      }

      if (highConfidence.length > 10) {
        console.log(`   ... and ${highConfidence.length - 10} more\n`);
      }

      console.log('💾 Tracker updated: data/correction-candidates.json');
      console.log(
        '📝 Run "bun run src/scripts/review-corrections.ts" to review and approve\n',
      );
    } else {
      console.log(
        '\n💾 Tracker updated: data/correction-candidates.json (no high-confidence candidates yet)\n',
      );
    }
  }
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
