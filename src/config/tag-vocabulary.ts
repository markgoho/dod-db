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
 * Tag status for the learning workflow.
 * - 'accepted': Verified tag, part of the core vocabulary
 * - 'proposed': Discovered by LLM, pending review
 * - 'rejected': Reviewed and rejected (kept for exclusion from future discovery)
 */
export type TagStatus = 'accepted' | 'proposed' | 'rejected';

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
			status: TagStatus;
	  }
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify?: false;
			description?: string; // Optional otherwise
			status: TagStatus;
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
	{ canonical: 'Abraham', variations: ['Abram', "Abraham's"], category: 'character', status: 'accepted' },
	{ canonical: 'Isaac', variations: ["Isaac's"], category: 'character', status: 'accepted' },
	{ canonical: 'Jesus', variations: ["Jesus'", 'Christ'], category: 'character', status: 'accepted' },
	{ canonical: 'Moses', variations: ['Moshe', "Moses'", "Moses's"], category: 'character', status: 'accepted' },
	{ canonical: 'Adam', variations: ["Adam's"], category: 'character', status: 'accepted' },
	{ canonical: 'Eve', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Lot', variations: ["Lot's"], category: 'character', status: 'accepted' },
	{ canonical: 'Paul', variations: ['Pauline'], category: 'character', status: 'accepted' },
	{ canonical: 'Jephthah', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'John of Patmos', variations: ['John the Revelator'], category: 'character', status: 'accepted' },
	{ canonical: 'Bart Ehrman', variations: ['Ehrman'], category: 'scholar', status: 'accepted' },
	{ canonical: 'Hagar', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Ishmael', variations: ['Ishmaelites'], category: 'character', status: 'accepted' },
	{ canonical: 'Ezekiel', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Peter', variations: ['Simon Peter'], category: 'character', status: 'accepted' },
	{ canonical: 'James', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'John', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Luke', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Matthew', variations: [], category: 'character', llmVerify: true, description: 'Matthew the Apostle and Evangelist', status: 'accepted' },
	{ canonical: 'Noah', variations: ["Noah's"], category: 'character', status: 'accepted' },
	{ canonical: 'Jeremiah', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Mary Magdalene', variations: ['Mary'], category: 'character', status: 'accepted' },
	{ canonical: 'Balaam', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Daniel', variations: [], category: 'character', llmVerify: true, description: 'Daniel from the Book of Daniel', status: 'accepted' },
	{ canonical: 'Enoch', variations: [], category: 'character', status: 'accepted' },

	// BIBLICAL PLACES (12 terms)
	{ canonical: 'Jerusalem', variations: ['New Jerusalem'], category: 'place', status: 'accepted' },
	{ canonical: 'Sodom', variations: ['Sodom and Gomorrah'], category: 'place', status: 'accepted' },
	{ canonical: 'Gomorrah', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Egypt', variations: ['Egyptian'], category: 'place', status: 'accepted' },
	{ canonical: 'Babylon', variations: ['Babylonian'], category: 'place', status: 'accepted' },
	{ canonical: 'Ugarit', variations: ['Ugaritic'], category: 'place', status: 'accepted' },
	{ canonical: 'Elephantine', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Carthage', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Dead Sea', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Mount Gerizim', variations: ['Gerizim'], category: 'place', status: 'accepted' },
	{ canonical: 'Mount Ebal', variations: ['Ebal'], category: 'place', status: 'accepted' },
	{ canonical: 'Lachish', variations: ['Tel Lachish'], category: 'place', status: 'accepted' },

	// BIBLICAL TEXTS (20 terms)
	{ canonical: 'Torah', variations: ['Tora', 'Torrah'], category: 'literature', status: 'accepted' },
	{ canonical: 'Hebrew Bible', variations: ['Old Testament', 'Tanakh'], category: 'literature', status: 'accepted' },
	{ canonical: 'Septuagint', variations: ['LXX', 'Septuigent'], category: 'literature', status: 'accepted' },
	{ canonical: 'Gospel of John', variations: ['John'], category: 'literature', status: 'accepted' },
	{ canonical: 'Book of Revelation', variations: ['Revelation', 'Apocalypse'], category: 'literature', status: 'accepted' },
	{ canonical: 'Genesis', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Deuteronomy', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Book of Job', variations: ['Job'], category: 'literature', status: 'accepted' },
	{ canonical: 'Isaiah', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Ezekiel', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Judges', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Dead Sea Scrolls', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'New Testament', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Leviticus', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Numbers', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Kings', variations: ['1 Kings', '2 Kings'], category: 'literature', status: 'accepted' },
	{ canonical: 'First Corinthians', variations: ['1 Corinthians'], category: 'literature', status: 'accepted' },
	{ canonical: 'Exodus', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'King James Version', variations: ['KJV'], category: 'literature', status: 'accepted' },
	{ canonical: 'Masoretic Text', variations: [], category: 'literature', status: 'accepted' },

	// THEOLOGICAL CONCEPTS (27 terms)
	{ canonical: 'YHWH', variations: ['Yahweh', 'Adonai', 'the Lord'], category: 'theology', status: 'accepted' },
	{ canonical: 'Asherah', variations: ['Athirat', 'Atiratu'], category: 'character', status: 'accepted' },
	{ canonical: 'El', variations: ['El Shaddai'], category: 'character', status: 'accepted' },
	{ canonical: 'Baal', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Trinity', variations: ['Trinitarian'], category: 'theology', status: 'accepted' },
	{ canonical: 'divine council', variations: ['heavenly household'], category: 'theology', status: 'accepted' },
	{ canonical: 'resurrection', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'Rapture', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'Armageddon', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'apocalypse', variations: ['apocalyptic'], category: 'theology', status: 'accepted' },
	{ canonical: 'Molek', variations: ['Molech', 'Moloch', 'mulk'], category: 'character', status: 'accepted' },
	{ canonical: 'child sacrifice', variations: ['firstborn sacrifice'], category: 'theology', status: 'accepted' },
	{ canonical: 'circumcision', variations: ['circumcised'], category: 'theology', status: 'accepted' },
	{ canonical: 'incarnation', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'corporeal deity', variations: ['anthropomorphic God'], category: 'theology', status: 'accepted' },
	{ canonical: 'Easter', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'Christianity', variations: ['Christian', 'Christians'], category: 'theology', status: 'accepted' },
	{ canonical: 'Hell', variations: ['Gehenna'], category: 'place', status: 'accepted' },
	{ canonical: 'Sheol', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Satan', variations: ['the devil', 'devil'], category: 'theology', status: 'accepted' },
	{ canonical: 'angel', variations: ['angels'], category: 'theology', status: 'accepted' },
	{ canonical: 'monotheism', variations: ['monotheistic'], category: 'theology', status: 'accepted' },
	{ canonical: 'gods', variations: ['goddesses'], category: 'theology', status: 'accepted' },
	{ canonical: 'theology', variations: ['theological'], category: 'theology', status: 'accepted' },
	{ canonical: 'univocality', variations: ['univocal'], category: 'scholarship', status: 'accepted' },

	// SCHOLARLY TERMS (15 terms)
	{ canonical: 'textual criticism', variations: [], category: 'scholarship', status: 'accepted' },
	{ canonical: 'redaction criticism', variations: [], category: 'scholarship', status: 'accepted' },
	{ canonical: 'source criticism', variations: [], category: 'scholarship', status: 'accepted' },
	{ canonical: 'biblical canon', variations: ['canonicity', 'canon'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'provenance', variations: ['provenience', 'unprovenanced'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'etiology', variations: ['etiological'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'theophany', variations: ['ish theophany'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'cognitive dissonance', variations: [], category: 'scholarship', status: 'accepted' },
	{ canonical: 'archaeology', variations: ['archaeological'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'epigraphy', variations: ['epigraphers'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'forgery', variations: ['forged', 'fake artifacts'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'manuscript', variations: ['manuscripts'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'historical criticism', variations: ['historical-critical method'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'preterist interpretation', variations: ['preterism'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'futurist interpretation', variations: ['futurism'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'Judah', variations: ['Judahites', 'Judahite'], category: 'place', status: 'accepted' },
	{ canonical: 'Israel', variations: ['Israelites'], category: 'place', status: 'accepted' },
	{ canonical: 'inerrancy', variations: ['inerrant'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'King David', variations: ['David'], category: 'character', llmVerify: true, description: 'King David of Israel', status: 'accepted' },
	{ canonical: 'Euphrates', variations: ['Euphrates River'], category: 'place', status: 'accepted' },
	{ canonical: 'Euphrates River', variations: [], category: 'place', status: 'rejected' },
	{ canonical: 'sons of God', variations: [], category: 'character', status: 'rejected' },
	{ canonical: '1 Enoch', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'Nephilim', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'giants', variations: [], category: 'character', status: 'rejected' },
	{ canonical: 'Book of Enoch', variations: ['1 Enoch'], category: 'literature', status: 'accepted' },
	{ canonical: 'Islam', variations: [], category: 'theology', status: 'accepted' },
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
