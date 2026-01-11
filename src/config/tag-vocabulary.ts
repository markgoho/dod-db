/**
 * Tag vocabulary for deterministic pattern matching and canonical mapping.
 * This file defines the seed vocabulary of known tags that should be identified
 * in episode transcripts without needing LLM assistance.
 */

export interface TagDefinition {
	canonical: string;
	variations: string[];
	category: TagCategory;
}

export type TagCategory =
	| 'biblical-character'
	| 'biblical-place'
	| 'biblical-text'
	| 'theological-concept'
	| 'scholarly-term';

/**
 * Seed vocabulary generated from analysis of existing transcripts.
 * Contains 100+ high-value terms across all categories.
 *
 * Terms are organized by category for maintainability.
 * Variations (including common misspellings and alternative names)
 * are mapped to their canonical form.
 *
 * Vocabulary is continuously expanded via the learning loop:
 * 1. LLM discovers new terms in transcripts
 * 2. Review discovered tags
 * 3. Add valuable terms here for free deterministic matching in future episodes
 */
export const tagVocabulary: TagDefinition[] = [
	// BIBLICAL CHARACTERS (26 terms)
	{ canonical: 'Abraham', variations: ['Abram', "Abraham's"], category: 'biblical-character' },
	{ canonical: 'Isaac', variations: ["Isaac's"], category: 'biblical-character' },
	{ canonical: 'Jesus', variations: ["Jesus'", 'Christ'], category: 'biblical-character' },
	{ canonical: 'Moses', variations: ['Moshe', "Moses'", "Moses's"], category: 'biblical-character' },
	{ canonical: 'Adam', variations: ["Adam's"], category: 'biblical-character' },
	{ canonical: 'Eve', variations: [], category: 'biblical-character' },
	{ canonical: 'Lot', variations: ["Lot's"], category: 'biblical-character' },
	{ canonical: 'Paul', variations: ['Pauline'], category: 'biblical-character' },
	{ canonical: 'David', variations: ["David's"], category: 'biblical-character' },
	{ canonical: 'Jephthah', variations: [], category: 'biblical-character' },
	{ canonical: 'John of Patmos', variations: ['John the Revelator'], category: 'biblical-character' },
	{ canonical: 'Bart Ehrman', variations: [], category: 'biblical-character' },
	{ canonical: 'Hagar', variations: [], category: 'biblical-character' },
	{ canonical: 'Ishmael', variations: ['Ishmaelites'], category: 'biblical-character' },
	{ canonical: 'Ezekiel', variations: [], category: 'biblical-character' },
	{ canonical: 'Peter', variations: ['Simon Peter'], category: 'biblical-character' },
	{ canonical: 'James', variations: [], category: 'biblical-character' },
	{ canonical: 'John', variations: [], category: 'biblical-character' },
	{ canonical: 'Luke', variations: [], category: 'biblical-character' },
	{ canonical: 'Matthew', variations: [], category: 'biblical-character' },
	{ canonical: 'Noah', variations: ["Noah's"], category: 'biblical-character' },
	{ canonical: 'Jeremiah', variations: [], category: 'biblical-character' },
	{ canonical: 'Mary Magdalene', variations: ['Mary'], category: 'biblical-character' },
	{ canonical: 'Balaam', variations: [], category: 'biblical-character' },
	{ canonical: 'Daniel', variations: [], category: 'biblical-character' },
	{ canonical: 'Enoch', variations: [], category: 'biblical-character' },

	// BIBLICAL PLACES (12 terms)
	{ canonical: 'Jerusalem', variations: ['New Jerusalem'], category: 'biblical-place' },
	{ canonical: 'Sodom', variations: ['Sodom and Gomorrah'], category: 'biblical-place' },
	{ canonical: 'Gomorrah', variations: [], category: 'biblical-place' },
	{ canonical: 'Egypt', variations: ['Egyptian'], category: 'biblical-place' },
	{ canonical: 'Babylon', variations: ['Babylonian'], category: 'biblical-place' },
	{ canonical: 'Ugarit', variations: ['Ugaritic'], category: 'biblical-place' },
	{ canonical: 'Elephantine', variations: [], category: 'biblical-place' },
	{ canonical: 'Carthage', variations: [], category: 'biblical-place' },
	{ canonical: 'Dead Sea', variations: [], category: 'biblical-place' },
	{ canonical: 'Mount Gerizim', variations: ['Gerizim'], category: 'biblical-place' },
	{ canonical: 'Mount Ebal', variations: ['Ebal'], category: 'biblical-place' },
	{ canonical: 'Lachish', variations: ['Tel Lachish'], category: 'biblical-place' },

	// BIBLICAL TEXTS (20 terms)
	{ canonical: 'Torah', variations: ['Tora', 'Torrah'], category: 'biblical-text' },
	{ canonical: 'Hebrew Bible', variations: ['Old Testament', 'Tanakh'], category: 'biblical-text' },
	{ canonical: 'Septuagint', variations: ['LXX', 'Septuigent'], category: 'biblical-text' },
	{ canonical: 'Gospel of John', variations: ['John'], category: 'biblical-text' },
	{ canonical: 'Book of Revelation', variations: ['Revelation', 'Apocalypse'], category: 'biblical-text' },
	{ canonical: 'Genesis', variations: [], category: 'biblical-text' },
	{ canonical: 'Deuteronomy', variations: [], category: 'biblical-text' },
	{ canonical: 'Book of Job', variations: ['Job'], category: 'biblical-text' },
	{ canonical: 'Isaiah', variations: [], category: 'biblical-text' },
	{ canonical: 'Ezekiel', variations: [], category: 'biblical-text' },
	{ canonical: 'Judges', variations: [], category: 'biblical-text' },
	{ canonical: 'Dead Sea Scrolls', variations: [], category: 'biblical-text' },
	{ canonical: 'New Testament', variations: [], category: 'biblical-text' },
	{ canonical: 'Leviticus', variations: [], category: 'biblical-text' },
	{ canonical: 'Numbers', variations: [], category: 'biblical-text' },
	{ canonical: 'Kings', variations: ['1 Kings', '2 Kings'], category: 'biblical-text' },
	{ canonical: 'First Corinthians', variations: ['1 Corinthians'], category: 'biblical-text' },
	{ canonical: 'Exodus', variations: [], category: 'biblical-text' },
	{ canonical: 'King James Version', variations: ['KJV'], category: 'biblical-text' },
	{ canonical: 'Masoretic Text', variations: [], category: 'biblical-text' },

	// THEOLOGICAL CONCEPTS (27 terms)
	{ canonical: 'YHWH', variations: ['Yahweh', 'Adonai', 'the Lord'], category: 'theological-concept' },
	{ canonical: 'Asherah', variations: ['Athirat', 'Atiratu'], category: 'theological-concept' },
	{ canonical: 'El', variations: ['El Shaddai'], category: 'theological-concept' },
	{ canonical: 'Baal', variations: [], category: 'theological-concept' },
	{ canonical: 'Trinity', variations: ['Trinitarian'], category: 'theological-concept' },
	{ canonical: 'divine council', variations: ['heavenly household'], category: 'theological-concept' },
	{ canonical: 'resurrection', variations: [], category: 'theological-concept' },
	{ canonical: 'Rapture', variations: [], category: 'theological-concept' },
	{ canonical: 'Armageddon', variations: [], category: 'theological-concept' },
	{ canonical: 'apocalypse', variations: ['apocalyptic'], category: 'theological-concept' },
	{ canonical: 'Molek', variations: ['Molech', 'Moloch', 'mulk'], category: 'theological-concept' },
	{ canonical: 'child sacrifice', variations: ['firstborn sacrifice'], category: 'theological-concept' },
	{ canonical: 'circumcision', variations: ['circumcised'], category: 'theological-concept' },
	{ canonical: 'incarnation', variations: [], category: 'theological-concept' },
	{ canonical: 'corporeal deity', variations: ['anthropomorphic God'], category: 'theological-concept' },
	{ canonical: 'Israel', variations: ['Israelites'], category: 'theological-concept' },
	{ canonical: 'Bible', variations: [], category: 'theological-concept' },
	{ canonical: 'Easter', variations: [], category: 'theological-concept' },
	{ canonical: 'Christianity', variations: ['Christian', 'Christians'], category: 'theological-concept' },
	{ canonical: 'Hell', variations: ['Gehenna'], category: 'theological-concept' },
	{ canonical: 'Sheol', variations: [], category: 'theological-concept' },
	{ canonical: 'Satan', variations: ['the devil', 'devil'], category: 'theological-concept' },
	{ canonical: 'angel', variations: ['angels'], category: 'theological-concept' },
	{ canonical: 'monotheism', variations: ['monotheistic'], category: 'theological-concept' },
	{ canonical: 'gods', variations: ['goddesses'], category: 'theological-concept' },
	{ canonical: 'theology', variations: ['theological'], category: 'theological-concept' },
	{ canonical: 'univocality', variations: ['univocal'], category: 'theological-concept' },

	// SCHOLARLY TERMS (15 terms)
	{ canonical: 'textual criticism', variations: [], category: 'scholarly-term' },
	{ canonical: 'redaction criticism', variations: [], category: 'scholarly-term' },
	{ canonical: 'source criticism', variations: [], category: 'scholarly-term' },
	{ canonical: 'biblical canon', variations: ['canonicity'], category: 'scholarly-term' },
	{ canonical: 'provenance', variations: ['provenience', 'unprovenanced'], category: 'scholarly-term' },
	{ canonical: 'etiology', variations: ['etiological'], category: 'scholarly-term' },
	{ canonical: 'theophany', variations: ['ish theophany'], category: 'scholarly-term' },
	{ canonical: 'cognitive dissonance', variations: [], category: 'scholarly-term' },
	{ canonical: 'archaeology', variations: ['archaeological'], category: 'scholarly-term' },
	{ canonical: 'epigraphy', variations: ['epigraphers'], category: 'scholarly-term' },
	{ canonical: 'forgery', variations: ['forged', 'fake artifacts'], category: 'scholarly-term' },
	{ canonical: 'manuscript', variations: ['manuscripts'], category: 'scholarly-term' },
	{ canonical: 'historical criticism', variations: ['historical-critical method'], category: 'scholarly-term' },
	{ canonical: 'preterist interpretation', variations: ['preterism'], category: 'scholarly-term' },
	{ canonical: 'futurist interpretation', variations: ['futurism'], category: 'scholarly-term' },
];

/**
 * Build a lookup map from all searchable terms (canonical + variations) to their canonical forms.
 * This enables O(1) lookups during regex matching.
 *
 * @param vocab - Array of tag definitions
 * @returns Map where keys are lowercase searchable terms and values are canonical forms
 *
 * @example
 * const termMap = getAllSearchableTerms(tagVocabulary);
 * termMap.get('lxx') // Returns 'Septuagint'
 * termMap.get('septuagint') // Returns 'Septuagint'
 */
export function getAllSearchableTerms(vocab: TagDefinition[]): Map<string, string> {
	const termMap = new Map<string, string>();

	for (const def of vocab) {
		// Map canonical to itself (case-insensitive)
		termMap.set(def.canonical.toLowerCase(), def.canonical);

		// Map all variations to canonical (case-insensitive)
		for (const variation of def.variations) {
			termMap.set(variation.toLowerCase(), def.canonical);
		}
	}

	return termMap;
}
