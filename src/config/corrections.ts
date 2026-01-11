/**
 * Correction rule: Array of common misspellings/variations maps to the correct term.
 * Example: [["Dan McLellan", "Dan McLellen"], "Dan McClellan"]
 */
export type CorrectionRule = [string[], string];

/**
 * Global deterministic corrections applied before LLM processing.
 * Format: [["variation1", "variation2"], "correct_term"]
 *
 * Rules are applied in order with case-insensitive whole-word matching.
 * First matching rule takes precedence.
 */
export const globalCorrections: CorrectionRule[] = [
  // Host names
  [['Dan McLellan', 'Dan McLellen', 'Dan McClelland'], 'Dan McClellan'],

  // Biblical books
  [['Septuigent', 'Septugiant', 'Septuagent'], 'Septuagint'],
  [['Deuteronomist'], 'Deuteronomy'],

  // Hebrew terms (common mishearings)
  [['Berashit', 'Beresheet'], 'Bereshit'],
  [['Tora', 'Torrah'], 'Torah'],
  [['Yahweh', 'Yahveh'], 'YHWH'],

  // Greek terms
  [['LXX'], 'Septuagint'],

  // Scholars
  [['Frank More Cross'], 'Frank Moore Cross'],

  // Common theological terms
  [['cannon'], 'canon'], // Will be reviewed in Pass 2 for context
  [['unprovidenced'], 'unprovenanced'], // Episode 3: Lot's wife story
  [['tick tock'], 'TikTok'], // proper-noun - confidence: 45%
  [['century ce'], 'century CE'], // capitalization - confidence: 45%
  [['Masoretic text'], 'Masoretic Text'], // capitalization - confidence: 25%
  [['pastoral epistles'], 'Pastoral Epistles'], // capitalization - confidence: 20%
  [['Kaiser'], 'Caesar'], // spelling - confidence: 20%
  [['Origin'], 'Origen'], // spelling - confidence: 20%
  [['Migdol'], 'Migdal'], // spelling - confidence: 20%
  [["katumua"], "Katumuwa"], // proper-noun - confidence: 25%
  [["common era"], "Common Era"], // capitalization - confidence: 20%
];
