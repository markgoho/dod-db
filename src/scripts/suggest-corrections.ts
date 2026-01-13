/**
 * Helper script to suggest deterministic corrections based on LLM corrections.
 *
 * Usage:
 * 1. Run correction pipeline on a transcript
 * 2. Note the suggested corrections that appear
 * 3. Run this script to see what the original terms were
 * 4. Add high-frequency corrections to src/config/corrections.ts
 *
 * Example:
 *   bun run src/scripts/suggest-corrections.ts "data/transcripts/episode-1.txt" "Torah"
 */

async function suggestCorrections(originalPath: string, correctedTerm: string) {
  const original = await Bun.file(originalPath).text();

  // Find lines containing the corrected term in the original
  const lines = original.split('\n');
  const matchingLines: string[] = [];

  for (const line of lines) {
    // Look for similar terms (case-insensitive, fuzzy)
    const lowerLine = line.toLowerCase();
    const lowerTerm = correctedTerm.toLowerCase();

    // Simple heuristic: find words that start with same letters
    const words = lowerLine.split(/\s+/);
    for (const word of words) {
      // Remove punctuation
      const cleanWord = word.replaceAll(/[.,!?;:()[\]]/g, '');
      if (
        cleanWord.startsWith(lowerTerm.slice(0, 3)) &&
        cleanWord !== lowerTerm
      ) {
        matchingLines.push(`${cleanWord} → ${correctedTerm}`);
      }
    }
  }

  // Deduplicate
  const unique = [...new Set(matchingLines)];

  if (unique.length > 0) {
    console.log(`\nSuggested correction rule for "${correctedTerm}":\n`);
    const originals = unique.map((s) => s.split(' → ')[0]);
    console.log(`  [${JSON.stringify(originals)}, "${correctedTerm}"],\n`);
    console.log(`Found ${unique.length} variant(s):`);
    for (const match of unique) {
      console.log(`  ${match}`);
    }
  } else {
    console.log(
      `\nNo obvious variants found for "${correctedTerm}" in original transcript.`,
    );
    console.log(`The term may have been corrected deterministically already.`);
  }
}

const [, , originalPath, correctedTerm] = process.argv;

if (!originalPath || !correctedTerm) {
  console.log(
    'Usage: bun run src/scripts/suggest-corrections.ts <original-transcript-path> <corrected-term>',
  );
  console.log('\nExample:');
  console.log(
    '  bun run src/scripts/suggest-corrections.ts data/transcripts/episode-1.txt "Torah"',
  );
  process.exit(1);
}

suggestCorrections(originalPath, correctedTerm);
