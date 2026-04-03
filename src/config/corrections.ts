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
  [["Dan McLellan", "Dan McLellen", "Dan McClelland"], "Dan McClellan"],

  // Biblical books
  [["Septuigent", "Septugiant", "Septuagent"], "Septuagint"],
  [["Deuteronomist"], "Deuteronomy"],

  // Hebrew terms (common mishearings)
  [["Berashit", "Beresheet"], "Bereshit"],
  [["Tora", "Torrah"], "Torah"],
  [["Yahweh", "Yahveh"], "YHWH"],

  // Greek terms
  [["LXX"], "Septuagint"],

  // Scholars
  [["Frank More Cross"], "Frank Moore Cross"],

  // Common theological terms
  [["cannon"], "canon"], // Will be reviewed in Pass 2 for context
  [["unprovidenced"], "unprovenanced"], // Episode 3: Lot's wife story
  [["tick tock"], "TikTok"], // proper-noun - confidence: 45%
  [["century ce"], "century CE"], // capitalization - confidence: 45%
  [["Masoretic text"], "Masoretic Text"], // capitalization - confidence: 25%
  [["pastoral epistles"], "Pastoral Epistles"], // capitalization - confidence: 20%
  [["Kaiser"], "Caesar"], // spelling - confidence: 20%
  [["Origin"], "Origen"], // spelling - confidence: 20%
  [["Migdol"], "Migdal"], // spelling - confidence: 20%
  [["katumua"], "Katumuwa"], // proper-noun - confidence: 25%
  [["common era"], "Common Era"], // capitalization - confidence: 20%
  [["Tyndall"], "Tyndale"], // spelling - confidence: 40%
  [["first Enoch"], "First Enoch"], // capitalization - confidence: 40%
  [["nephal"], "Niphal"], // proper-noun - confidence: 25%
  [["Euphrates river"], "Euphrates River"], // capitalization - confidence: 25%
  [["balaam"], "Balaam"], // capitalization - confidence: 20%
  [["Malach"], "Malak"], // spelling - confidence: 45%
  [["Halel"], "Helel"], // spelling - confidence: 20%
  [["priestly source"], "Priestly source"], // capitalization - confidence: 20%
  [["Pastoral epistles"], "Pastoral Epistles"], // capitalization - confidence: 20%
  [["shadim"], "shedim"], // spelling - confidence: 20%
  [["prais"], "praus"], // spelling - confidence: 20%
  [["Jacob Milgram"], "Jacob Milgrom"], // spelling - confidence: 20%
  [["James version"], "James Version"], // capitalization - confidence: 40%
  [["Antiochus IV epiphanies"], "Antiochus IV Epiphanes"], // proper-noun - confidence: 20%
  [["second Timothy"], "Second Timothy"], // capitalization - confidence: 20%
  [["Monogones Theos"], "Monogenes Theos"], // spelling - confidence: 25%
  [["Nazarite"], "Nazirite"], // spelling - confidence: 50%
  [["pornia"], "porneia"], // spelling - confidence: 45%
  [["first Timothy"], "First Timothy"], // capitalization - confidence: 40%
  [["second Maccabees"], "Second Maccabees"], // capitalization - confidence: 40%
  [["taking issue"], "Taking Issue"], // capitalization - confidence: 40%
  [["Leverett"], "Levirate"], // spelling - confidence: 30%
  [["Elephantini"], "Elephantine"], // spelling - confidence: 30%
  [["masoretic text"], "Masoretic Text"], // capitalization - confidence: 25%
  [["Olivet discourse"], "Olivet Discourse"], // capitalization - confidence: 25%
  [["Terrafim"], "Teraphim"], // spelling - confidence: 25%
  [["Kumran"], "Qumran"], // spelling - confidence: 20%
  [["Akilah"], "Aquila"], // spelling - confidence: 20%
];
