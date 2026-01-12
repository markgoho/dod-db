/**
 * Tag vocabulary for deterministic pattern matching and canonical mapping.
 * This file defines the seed vocabulary of known tags that should be identified
 * in episode transcripts without needing LLM assistance.
 */

export type TagCategory =
	| 'character'
	| 'scholar'
	| 'place'
	| 'literature'
	| 'theology'
	| 'scholarship';

/**
 * Tag definition with optional LLM verification.
 * When llmVerify is true, description is required to provide context for verification.
 */
export type TagDefinition =
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify: true;
			description: string; // Required when llmVerify is true
	  }
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify?: false;
			description?: string; // Optional otherwise
	  };

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
	{ canonical: 'Abraham', variations: ['Abram', "Abraham's"], category: 'character' },
	{ canonical: 'Isaac', variations: ["Isaac's"], category: 'character' },
	{ canonical: 'Jesus', variations: ["Jesus'", 'Christ'], category: 'character' },
	{ canonical: 'Moses', variations: ['Moshe', "Moses'", "Moses's"], category: 'character' },
	{ canonical: 'Adam', variations: ["Adam's"], category: 'character' },
	{ canonical: 'Eve', variations: [], category: 'character' },
	{ canonical: 'Lot', variations: ["Lot's"], category: 'character' },
	{ canonical: 'Paul', variations: ['Pauline'], category: 'character' },
	{ canonical: 'Jephthah', variations: [], category: 'character' },
	{ canonical: 'John of Patmos', variations: ['John the Revelator'], category: 'character' },
	{ canonical: 'Bart Ehrman', variations: ['Ehrman'], category: 'scholar' },
	{ canonical: 'Hagar', variations: [], category: 'character' },
	{ canonical: 'Ishmael', variations: ['Ishmaelites'], category: 'character' },
	{ canonical: 'Ezekiel', variations: [], category: 'character' },
	{ canonical: 'Peter', variations: ['Simon Peter'], category: 'character' },
	{ canonical: 'James', variations: [], category: 'character' },
	{ canonical: 'John', variations: [], category: 'character' },
	{ canonical: 'Luke', variations: [], category: 'character' },
	{ canonical: 'Matthew', variations: [], category: 'character', llmVerify: true, description: 'Matthew the Apostle and Evangelist' },
	{ canonical: 'Noah', variations: ["Noah's"], category: 'character' },
	{ canonical: 'Jeremiah', variations: [], category: 'character' },
	{ canonical: 'Mary Magdalene', variations: ['Mary'], category: 'character' },
	{ canonical: 'Balaam', variations: [], category: 'character' },
	{ canonical: 'Daniel', variations: [], category: 'character', llmVerify: true, description: 'Daniel from the Book of Daniel' },
	{ canonical: 'Enoch', variations: [], category: 'character' },

	// BIBLICAL PLACES (12 terms)
	{ canonical: 'Jerusalem', variations: ['New Jerusalem'], category: 'place' },
	{ canonical: 'Sodom', variations: ['Sodom and Gomorrah'], category: 'place' },
	{ canonical: 'Gomorrah', variations: [], category: 'place' },
	{ canonical: 'Egypt', variations: ['Egyptian'], category: 'place' },
	{ canonical: 'Babylon', variations: ['Babylonian'], category: 'place' },
	{ canonical: 'Ugarit', variations: ['Ugaritic'], category: 'place' },
	{ canonical: 'Elephantine', variations: [], category: 'place' },
	{ canonical: 'Carthage', variations: [], category: 'place' },
	{ canonical: 'Dead Sea', variations: [], category: 'place' },
	{ canonical: 'Mount Gerizim', variations: ['Gerizim'], category: 'place' },
	{ canonical: 'Mount Ebal', variations: ['Ebal'], category: 'place' },
	{ canonical: 'Lachish', variations: ['Tel Lachish'], category: 'place' },

	// BIBLICAL TEXTS (20 terms)
	{ canonical: 'Torah', variations: ['Tora', 'Torrah'], category: 'literature' },
	{ canonical: 'Hebrew Bible', variations: ['Old Testament', 'Tanakh'], category: 'literature' },
	{ canonical: 'Septuagint', variations: ['LXX', 'Septuigent'], category: 'literature' },
	{ canonical: 'Gospel of John', variations: ['John'], category: 'literature' },
	{ canonical: 'Book of Revelation', variations: ['Revelation', 'Apocalypse'], category: 'literature' },
	{ canonical: 'Genesis', variations: [], category: 'literature' },
	{ canonical: 'Deuteronomy', variations: [], category: 'literature' },
	{ canonical: 'Book of Job', variations: ['Job'], category: 'literature' },
	{ canonical: 'Isaiah', variations: [], category: 'literature' },
	{ canonical: 'Ezekiel', variations: [], category: 'literature' },
	{ canonical: 'Judges', variations: [], category: 'literature' },
	{ canonical: 'Dead Sea Scrolls', variations: [], category: 'literature' },
	{ canonical: 'New Testament', variations: [], category: 'literature' },
	{ canonical: 'Leviticus', variations: [], category: 'literature' },
	{ canonical: 'Numbers', variations: [], category: 'literature' },
	{ canonical: 'Kings', variations: ['1 Kings', '2 Kings'], category: 'literature' },
	{ canonical: 'First Corinthians', variations: ['1 Corinthians'], category: 'literature' },
	{ canonical: 'Exodus', variations: [], category: 'literature' },
	{ canonical: 'King James Version', variations: ['KJV'], category: 'literature' },
	{ canonical: 'Masoretic Text', variations: [], category: 'literature' },

	// THEOLOGICAL CONCEPTS (27 terms)
	{ canonical: 'YHWH', variations: ['Yahweh', 'Adonai', 'the Lord'], category: 'theology' },
	{ canonical: 'Asherah', variations: ['Athirat', 'Atiratu'], category: 'character' },
	{ canonical: 'El', variations: ['El Shaddai'], category: 'character' },
	{ canonical: 'Baal', variations: [], category: 'character' },
	{ canonical: 'Trinity', variations: ['Trinitarian'], category: 'theology' },
	{ canonical: 'divine council', variations: ['heavenly household'], category: 'theology' },
	{ canonical: 'resurrection', variations: [], category: 'theology' },
	{ canonical: 'Rapture', variations: [], category: 'theology' },
	{ canonical: 'Armageddon', variations: [], category: 'theology' },
	{ canonical: 'apocalypse', variations: ['apocalyptic'], category: 'theology' },
	{ canonical: 'Molek', variations: ['Molech', 'Moloch', 'mulk'], category: 'character' },
	{ canonical: 'child sacrifice', variations: ['firstborn sacrifice'], category: 'theology' },
	{ canonical: 'circumcision', variations: ['circumcised'], category: 'theology' },
	{ canonical: 'incarnation', variations: [], category: 'theology' },
	{ canonical: 'corporeal deity', variations: ['anthropomorphic God'], category: 'theology' },
	{ canonical: 'Easter', variations: [], category: 'theology' },
	{ canonical: 'Christianity', variations: ['Christian', 'Christians'], category: 'theology' },
	{ canonical: 'Hell', variations: ['Gehenna'], category: 'place' },
	{ canonical: 'Sheol', variations: [], category: 'place' },
	{ canonical: 'Satan', variations: ['the devil', 'devil'], category: 'theology' },
	{ canonical: 'angel', variations: ['angels'], category: 'theology' },
	{ canonical: 'monotheism', variations: ['monotheistic'], category: 'theology' },
	{ canonical: 'gods', variations: ['goddesses'], category: 'theology' },
	{ canonical: 'theology', variations: ['theological'], category: 'theology' },
	{ canonical: 'univocality', variations: ['univocal'], category: 'scholarship' },

	// SCHOLARLY TERMS (15 terms)
	{ canonical: 'textual criticism', variations: [], category: 'scholarship' },
	{ canonical: 'redaction criticism', variations: [], category: 'scholarship' },
	{ canonical: 'source criticism', variations: [], category: 'scholarship' },
	{ canonical: 'biblical canon', variations: ['canonicity', 'canon'], category: 'scholarship' },
	{ canonical: 'provenance', variations: ['provenience', 'unprovenanced'], category: 'scholarship' },
	{ canonical: 'etiology', variations: ['etiological'], category: 'scholarship' },
	{ canonical: 'theophany', variations: ['ish theophany'], category: 'scholarship' },
	{ canonical: 'cognitive dissonance', variations: [], category: 'scholarship' },
	{ canonical: 'archaeology', variations: ['archaeological'], category: 'scholarship' },
	{ canonical: 'epigraphy', variations: ['epigraphers'], category: 'scholarship' },
	{ canonical: 'forgery', variations: ['forged', 'fake artifacts'], category: 'scholarship' },
	{ canonical: 'manuscript', variations: ['manuscripts'], category: 'scholarship' },
	{ canonical: 'historical criticism', variations: ['historical-critical method'], category: 'scholarship' },
	{ canonical: 'preterist interpretation', variations: ['preterism'], category: 'scholarship' },
	{ canonical: 'futurist interpretation', variations: ['futurism'], category: 'scholarship' },
	{ canonical: 'Judah', variations: ['Judahites', 'Judahite'], category: 'place' },
	{ canonical: 'Israel', variations: ['Israelites'], category: 'place' },
	{ canonical: 'inerrancy', variations: ['inerrant'], category: 'scholarship' },
	{ canonical: 'King David', variations: ['David'], category: 'character', llmVerify: true, description: 'King David of Israel' },
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
		// Map canonical to itself (preserves case for case-sensitive matching)
		termMap.set(def.canonical, def.canonical);

		// Map all variations to canonical (preserves case for case-sensitive matching)
		for (const variation of def.variations) {
			termMap.set(variation, def.canonical);
		}
	}

	return termMap;
}
