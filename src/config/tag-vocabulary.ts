/**
 * Tag vocabulary for deterministic pattern matching and canonical mapping.
 * This file defines the seed vocabulary of known tags that should be identified
 * in episode transcripts without needing LLM assistance.
 */

/**
 * All available tag categories.
 * This is the single source of truth for tag categories used throughout the system.
 */
export const TAG_CATEGORIES = [
	'character',
	'person',
	'place',
	'people',
	'literature',
	'theology',
	'scholarship',
	'religion',
	'event',
] as const;

/**
 * Tag category type inferred from TAG_CATEGORIES array.
 * This ensures the type stays in sync with the array automatically.
 */
export type TagCategory = typeof TAG_CATEGORIES[number];

/**
 * Tag status for the learning workflow.
 * - 'accepted': Verified tag, part of the core vocabulary
 * - 'proposed': Discovered by LLM, pending review
 * - 'rejected': Reviewed and rejected (kept for exclusion from future discovery)
 */
export type TagStatus = 'accepted' | 'proposed' | 'rejected';

/**
 * Tag definition with optional LLM verification and case sensitivity.
 * When llmVerify is true, description is required to provide context for verification.
 * When caseSensitive is true, matching is case-sensitive (default: false for case-insensitive).
 */
export type TagDefinition =
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify: true;
			description: string; // Required when llmVerify is true
			status: TagStatus;
			caseSensitive?: boolean; // Default: false (case-insensitive)
			addedInEpisode?: number; // Episode number where this tag was first discovered
	  }
	| {
			canonical: string;
			variations: string[];
			category: TagCategory;
			llmVerify?: false;
			description?: string; // Optional otherwise
			status: TagStatus;
			caseSensitive?: boolean; // Default: false (case-insensitive)
			addedInEpisode?: number; // Episode number where this tag was first discovered
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
	{ canonical: 'Lot', variations: ["Lot's"], category: 'character', status: 'accepted', caseSensitive: true },
	{ canonical: 'Paul', variations: ['Pauline'], category: 'character', status: 'accepted' },
	{ canonical: 'Jephthah', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'John of Patmos', variations: ['John the Revelator'], category: 'character', status: 'accepted' },
	{ canonical: 'Bart Ehrman', variations: ['Ehrman'], category: 'person', status: 'accepted' },
	{ canonical: 'Hagar', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Ishmael', variations: ['Ishmaelites'], category: 'character', status: 'accepted' },
	{ canonical: 'Ezekiel', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Peter', variations: ['Simon Peter'], category: 'character', status: 'accepted' },
	{ canonical: 'James', variations: [], category: 'character', llmVerify: true, description: 'James the brother of Jesus, not simply a reference to the epistle of James or a chapter and verse in James', status: 'accepted' },
	{ canonical: 'John', variations: [], category: 'character', llmVerify: true, description: 'John the Apostle and Evangelist, not simply a reference to the gospel of John or a chapter and verse in John', status: 'accepted' },
	{ canonical: 'Luke', variations: [], category: 'character', llmVerify: true, description: 'Luke the Apostle and Evangelist, not simply a reference to the gospel of Luke or a chapter and verse in Luke', status: 'accepted' },
	{ canonical: 'Matthew', variations: [], category: 'character', llmVerify: true, description: 'Matthew the Apostle and Evangelist, not simply a reference to the gospel of matthew or a chapter and verse in Matthew', status: 'accepted' },
	{ canonical: 'Noah', variations: ["Noah's"], category: 'character', status: 'accepted' },
	{ canonical: 'Jeremiah', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Mary Magdalene', variations: ['Mary'], category: 'character', status: 'accepted' },
	{ canonical: 'Balaam', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Daniel', variations: [], category: 'character', llmVerify: true, description: 'Daniel from the Book of Daniel', status: 'accepted' },
	{ canonical: 'Book of Daniel', variations: [], category: 'literature', llmVerify: true, description: 'References to the book of Daniel, chapters, verses, stories, languages contained within', status: 'accepted' },
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
	{ canonical: 'Book of Job', variations: ['Job'], category: 'literature', llmVerify: true, description: 'The book of Job in the old testament, not merely a reference to the character Job', status: 'accepted', caseSensitive: true },
	{ canonical: 'Ezekiel', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Judges', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Dead Sea Scrolls', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'New Testament', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Leviticus', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Numbers', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Kings', variations: ['1 Kings', '2 Kings'], category: 'literature', status: 'accepted' },
	{ canonical: 'First Corinthians', variations: ['1 Corinthians'], category: 'literature', status: 'accepted' },
	{ canonical: 'Book of Exodus', variations: ['Exodus'], category: 'literature', llmVerify: true, description: 'The book of Exodus in the old testament, not merely a reference to the event of exodus', status: 'accepted', caseSensitive: true },
	{ canonical: 'King James Version', variations: ['KJV'], category: 'literature', status: 'accepted' },
	{ canonical: 'Masoretic Text', variations: [], category: 'literature', status: 'accepted' },

	// THEOLOGICAL CONCEPTS (27 terms)
	{ canonical: 'YHWH', variations: ['Yahweh', 'Adonai', 'the Lord', 'ancient of days'], category: 'character', status: 'accepted' },
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
	{ canonical: 'Monotheism', variations: ['monotheistic'], category: 'theology', status: 'accepted' },
	{ canonical: 'gods', variations: ['goddesses'], category: 'theology', status: 'accepted' },
	{ canonical: 'theology', variations: ['theological'], category: 'theology', status: 'accepted' },
	{ canonical: 'Univocality', variations: ['univocal', 'non-univocal', 'non-univocality'], category: 'scholarship', status: 'accepted' },

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
	{ canonical: 'Israel', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'inerrancy', variations: ['inerrant'], category: 'scholarship', status: 'accepted' },
	{ canonical: 'King David', variations: ['David'], category: 'character', llmVerify: true, description: 'King David of Israel', status: 'accepted' },
	{ canonical: 'Euphrates', variations: ['Euphrates River'], category: 'place', status: 'accepted' },
	{ canonical: 'Euphrates River', variations: [], category: 'place', status: 'rejected' },
	{ canonical: 'sons of God', variations: [], category: 'character', status: 'rejected' },
	{ canonical: 'Nephilim', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'giants', variations: [], category: 'character', status: 'rejected' },
	{ canonical: 'Book of Enoch', variations: ['1 Enoch', 'First Enoch'], category: 'literature', status: 'accepted' },
	{ canonical: 'Islam', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'Cherubim', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Syria', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Samson', variations: [], category: 'character', status: 'accepted', llmVerify: true, description: 'Samson from the Book of Judges' },
	{ canonical: 'Gideon', variations: [], category: 'character', status: 'accepted', llmVerify: true, description: 'Gideon from the Book of Judges' },
	{ canonical: 'Psalm', variations: ['Psalms', 'Book of Psalms'], category: 'literature', status: 'accepted' },
	{ canonical: 'Gabriel', variations: ['Archangel Gabriel'], category: 'character', status: 'accepted', llmVerify: true, description: 'Archangel Gabriel' },
	{ canonical: 'Michael', variations: ['Archangel Michael'], category: 'character', status: 'accepted', llmVerify: true, description: 'Archangel Michael' },
	{ canonical: 'Jude', variations: ['Book of Jude'], category: 'literature', status: 'accepted' },
	{ canonical: 'Jonah', variations: [], category: 'character', llmVerify: true, description: 'from the bible, swallowed by a large fish', status: 'accepted' },
	{ canonical: 'Nineveh', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Assyria', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Book of Jonah', variations: [], category: 'literature', llmVerify: true, description: 'not the character from the book, but the book itself', status: 'accepted' },
	{ canonical: 'Hezekiah', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'prophet', variations: [], category: 'character', status: 'rejected' },
	{ canonical: 'Tarshish', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Sennecherib', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Christian Nationalism', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'Andrew Whitehead', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'bible', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'moral', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'Ten Commandments', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'exodus 20', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'exodus 34', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'commandments', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'deuteronomy 5', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'Ritual Decalogue', variations: ["ritual decalogue"], category: 'literature', status: 'accepted' },
	{ canonical: 'Ethical Decalogue', variations: ["ethical decalogue"], category: 'literature', status: 'accepted' },
	{ canonical: 'covenant code', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'philo', variations: [], category: 'person', status: 'rejected' },
	{ canonical: 'Talmud', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Moabites', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Ammonites', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Sarah', variations: [], category: 'people', llmVerify: true, description: 'Abraham\'s wife, mentioned in the Old Testament', status: 'accepted' },
	{ canonical: 'Gentiles', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Lilith', variations: [], category: 'character', llmVerify: true, description: 'often considered the first wife of Adam', status: 'accepted' },
	{ canonical: 'Joseph', variations: [], category: 'character', llmVerify: true, description: 'son of Jacob, sold into slavery in the Old Testament', status: 'accepted' },
	{ canonical: 'Samaritans', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Amorites', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Cain', variations: [], category: 'character', llmVerify: true, description: 'son of Adam, brother of Abel', status: 'accepted' },
	{ canonical: 'Seth', variations: [], category: 'character', llmVerify: true, description: 'third son of Adam, born after Cain killed Abel', status: 'accepted' },
	{ canonical: 'Lamech', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Methuselah', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Jared', variations: [], category: 'character', llmVerify: true, description: 'father of Enoch in the line of Adam', status: 'accepted' },
	{ canonical: 'Athanasius of Alexandria', variations: ['Athanasius'], category: 'person', status: 'accepted' },
	{ canonical: 'Hebrews', variations: ['jews', 'hebrews', 'israelites'], category: 'people', status: 'accepted' },
	{ canonical: 'rabbis', variations: [], category: 'people', status: 'rejected' },
	{ canonical: 'Romans', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Gospel of Mark', variations: ['Mark'], category: 'literature', llmVerify: true, description: 'the gospel of mark, second book of the christian new testament', status: 'accepted' },
	{ canonical: 'Eschatology',  variations: ['eschatological', 'eschaton', 'end times', 'end time'], category: 'theology', status: 'accepted' },
	{ canonical: 'historicism', variations: [], category: 'scholarship', status: 'rejected' },
	{ canonical: 'prophecies', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'prophecy', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'temple', variations: [], category: 'place', status: 'rejected' },
	{ canonical: '1 Thessalonians', variations: ['1 thessalonians', 'First Thessalonians'], category: 'literature', llmVerify: true, description: 'the letter written to the church at Thessalonica', status: 'accepted' },
	{ canonical: 'Gaza', variations: ['gaza'], category: 'place', status: 'accepted' },
	{ canonical: '2 Corinthians', variations: ['2nd Corinthians', 'second corinthians'], category: 'literature', status: 'accepted' },
	{ canonical: 'scholars', variations: [], category: 'person', status: 'rejected' },
	{ canonical: 'studies', variations: [], category: 'scholarship', status: 'rejected' },
	{ canonical: 'disability studies', variations: [], category: 'scholarship', status: 'rejected' },
	{ canonical: 'spirit', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'gospels', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'Belshazzar', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Nebuchadnezzar', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Antiochus IV Epiphanes', variations: ['Antiochus Epiphanes'], category: 'person', llmVerify: true, description: 'king of the Seleucid Empire', status: 'accepted' },
	{ canonical: 'Cyrus the Great', variations: ['cyrus', 'Cyrus the Persian'], category: 'person', llmVerify: true, description: 'Cyrus the Great, who founded the Achaemenid Empire in 550 BC', status: 'accepted' },
	{ canonical: 'Nabonidus', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Qumran', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Medes', variations: [], category: 'people', llmVerify: true, description: 'people that lived in Median Kingdom that existed from the 7th century BCE until the mid-6th century BCE', status: 'accepted' },
	{ canonical: 'Median Kingdom', variations: ['Media', 'Median'], category: 'place', llmVerify: true, description: 'a political entity centered in Ecbatana that existed from the 7th century BCE until the mid-6th century BCE', status: 'accepted' },
	{ canonical: 'epistles', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: '1 Timothy', variations: ['first timothy'], category: 'literature', llmVerify: true, description: 'the first letter from paul to timothy', status: 'accepted' },
	{ canonical: '2nd Timothy', variations: ['second timothy'], category: 'literature', status: 'accepted' },
	{ canonical: 'Papias of Hierapolis', variations: ['papias'], category: 'person', llmVerify: true, description: 'Greek Apostolic Father, Bishop of Hierapolis (modern Pamukkale, Turkey), and author who lived c. 60 – c. 130 AD', status: 'accepted' },
	{ canonical: 'Pastoral Epistles', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Irenaeus', variations: [], category: 'person', llmVerify: true, description: 'a Greek bishop noted for his role in guiding and expanding Christian communities in the southern regions of present-day France', status: 'accepted' },
	{ canonical: 'Galilee', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Book of Acts', variations: ['Acts', 'Acts of the Apostles'], category: 'literature', llmVerify: true, description: 'the new testament book traditionally attributed to Luke', status: 'accepted' },
	{ canonical: 'Saint Titus', variations: ['Titus'], category: 'character', llmVerify: true, description: 'early Christian missionary and church leader, a companion and disciple of Paul the Apostle', status: 'accepted' },
	{ canonical: 'Julius Wellhausen', variations: ['Wellhausen'], category: 'person', llmVerify: true, description: 'German biblical scholar and orientalist', status: 'accepted' },
	{ canonical: 'Philistines', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'King Josiah', variations: ['Josiah'], category: 'character', llmVerify: true, description: 'the 16th king of Judah (c. 640-609 BCE). Described as one of Judah’s most important kings', status: 'accepted' },
  { canonical: 'scribes', variations: [], status: 'rejected', category: 'people'},
	{ canonical: 'Bethlehem', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Wise Men', variations: [], category: 'character', status: 'rejected' },
	{ canonical: 'Herod the Great', variations: ['Herod'], category: 'person', llmVerify: true, description: 'Herod Ior Herod the Great (c.72- c. 4 BCE) was a Roman Jewish client king of the Herodian kingdom of Judea', status: 'accepted' },
	{ canonical: 'Gospel of Matthew', variations: ['Matthew'], category: 'literature', llmVerify: true, description: 'a direct reference to the book of matthew, chapter and verse, or generically to the first book of the new testament and NOT referring to the person Matthew in the new testament', status: 'accepted' },
	{ canonical: 'Dr. Aaron Adair', variations: ['Aaron Adair'], category: 'person', status: 'accepted' },
	{ canonical: 'Judaism', variations: [], category: 'religion', status: 'accepted' },
	{ canonical: 'Virgin Birth', variations: [], category: 'theology', llmVerify: true, description: 'referring specifically to the Virgin Birth of Mary, the mother of Jesus', status: 'accepted' },
	{ canonical: 'gospel', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'east', variations: [], category: 'place', status: 'rejected' },
	{ canonical: 'Gospel of James', variations: ['protevangelium of james'], category: 'literature', llmVerify: true, description: 'a second-century infancy gospel telling of the miraculous conception of Mary, the mother of Jesus, her upbringing and marriage to Joseph, the journey of the couple to Bethlehem, the birth of Jesus, and events immediately following.', status: 'accepted' },
	{ canonical: 'Judeans', variations: ['Judean'], category: 'people', status: 'accepted' },
	{ canonical: 'Persia', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'dragon', variations: [], category: 'character', status: 'rejected' },
	{ canonical: 'Codex Sinaiticus', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Theosis', variations: [], category: 'theology', status: 'accepted' },
	{ canonical: 'Anatolia', variations: [], category: 'place', llmVerify: true, description: 'also known as Asia Minor, is the large peninsula forming the Asian part of modern-day Turkey', status: 'accepted' },
	{ canonical: 'lake of fire', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'Domitian', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Nero', variations: [], category: 'person', llmVerify: true, description: 'Roman emperor and the final emperor of the Julio-Claudian dynasty, reigning from AD 54 until his death in AD 68', status: 'accepted' },
	{ canonical: 'King Saul', variations: ['Saul'], category: 'character', llmVerify: true, description: 'monarch of ancient Israel and Judah', status: 'accepted' },
	{ canonical: 'Samuel', variations: [], category: 'character', llmVerify: true, description: 'prophet, priest, and judge who led Israel during its transition from judges to monarchy, anointing both Israel\'s first king, Saul, and his successor, David', status: 'accepted' },
	{ canonical: 'elohim', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'Italy', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Seattle', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Ham', variations: [], category: 'character', llmVerify: true, description: 'son of Noah in the Old Testament', status: 'accepted' },
	{ canonical: 'Canaan', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Japheth', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Shem', variations: [], category: 'character', status: 'accepted' },
	{ canonical: 'Canaanites', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Book of Proverbs', variations: ['proverbs'], category: 'literature', llmVerify: true, description: 'specifically referencing the book of the old testament thought to be written by Solomon', status: 'accepted' },
	{ canonical: '1 Peter', variations: ['first peter', '1st peter'], category: 'literature', llmVerify: true, description: 'reference to the new testament book 1st Peter', status: 'accepted' },
	{ canonical: 'Africans', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'salt lake city', variations: [], category: 'place', status: 'rejected' },
	{ canonical: 'Africa', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'divine', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'theos', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'son of god', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'Council of Nicaea', variations: [], category: 'event', status: 'accepted' },
	{ canonical: 'Holy Spirit', variations: ['Holy Ghost'], category: 'character', status: 'accepted' },
	{ canonical: 'logos', variations: [], category: 'theology', status: 'rejected' },
	{ canonical: 'ntsv', variations: [], category: 'literature', status: 'rejected' },
	{ canonical: 'Book of Isaiah', variations: ['isaiah', 'first isaiah', 'deutero-isaiah', 'third isaiah'], category: 'literature', llmVerify: true, description: 'the book of Isaiah, references to chapters and verses, or general discussion about the written text', status: 'accepted' },
  { canonical: 'Isaiah', variations: [], category: 'character', llmVerify: true, description: 'the prophet Isaiah from the book of Isaiah, not references to the text of the book', status: 'accepted' },
	{ canonical: 'Bernhard Duhm', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Josephus', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Ken Ham', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Jennifer Bird', variations: ['Dr. Jennifer Bird'], category: 'person', status: 'accepted' },
	{ canonical: 'Essenes', variations: [], category: 'people', status: 'accepted' },
	{ canonical: 'Masada', variations: [], category: 'place', status: 'accepted' },
	{ canonical: 'Leningrad Codex', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Joshua', variations: ['Joshua\'s'], category: 'character', status: 'accepted' },
	{ canonical: 'Zechariah', variations: [], category: 'literature', status: 'accepted' },
	{ canonical: 'Origen', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Helen Bond', variations: ['Dr. Helen Bond'], category: 'person', status: 'accepted' },
	{ canonical: 'historical Jesus', variations: ['quest for the historical Jesus'], category: 'theology', status: 'rejected' },
	{ canonical: 'John the Baptist', variations: ['the Baptist'], category: 'character', llmVerify: true, description: 'Jewish preacher who baptized Jesus, executed by Herod Antipas', status: 'accepted' },
	{ canonical: 'Gospel of Thomas', variations: ['Thomas'], category: 'literature', llmVerify: true, description: 'Non-canonical sayings gospel discovered at Nag Hammadi in 1945', status: 'accepted' },
	{ canonical: 'Candida Moss', variations: ['Dr. Candida Moss'], category: 'person', status: 'accepted' },
	{ canonical: 'Tertius', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Aesop', variations: [], category: 'person', status: 'accepted' },
	{ canonical: 'Pliny the Younger', variations: ['Pliny'], category: 'person', llmVerify: true, description: 'Roman author and administrator (61-113 CE) who wrote about early Christians', status: 'accepted' },
	{ canonical: 'Clement of Rome', variations: ['Clement'], category: 'person', llmVerify: true, description: 'Early Christian bishop of Rome (late 1st century CE), traditionally the fourth pope', status: 'accepted' },
	{ canonical: 'First Clement', variations: ['1 Clement'], category: 'literature', llmVerify: true, description: 'Letter from the church of Rome to Corinth, attributed to Clement (c. 96 CE)', status: 'accepted' },
	{ canonical: 'Pontius Pilate', variations: ['Pilate'], category: 'person', llmVerify: true, description: 'Roman prefect of Judea (26-36 CE) who presided over the trial of Jesus', status: 'accepted' },
	{ canonical: 'Holy Week', variations: [], category: 'event', status: 'accepted' },
	{ canonical: 'Passover', variations: ['Pesach'], category: 'event', llmVerify: true, description: 'Jewish festival commemorating the Israelites\' exodus from Egypt', status: 'accepted' },
	{ canonical: 'Bethany', variations: [], category: 'place', llmVerify: true, description: 'Village near Jerusalem, home of Mary, Martha, and Lazarus in the Gospels', status: 'accepted' },
	{ canonical: 'Synoptic Gospels', variations: ['Synoptics'], category: 'literature', status: 'rejected' },
	{ canonical: 'Judas Iscariot', variations: ['Judas'], category: 'character', llmVerify: true, description: 'One of Jesus\' twelve apostles who betrayed him according to the Gospels', status: 'accepted' },
	{ canonical: 'Garden of Gethsemane', variations: ['Gethsemane'], category: 'place', status: 'accepted' },
	{ canonical: 'Sanhedrin', variations: ['the Sanhedrin'], category: 'people', status: 'accepted' },
	{ canonical: 'cognitive science', variations: ['cognitive science of religion'], category: 'scholarship', status: 'rejected' },
];

/**
 * Build a lookup map from all searchable terms (canonical + variations) to their canonical forms.
 * This enables O(1) lookups during regex matching.
 * Case sensitivity is handled during regex creation based on the caseSensitive flag.
 *
 * @param vocab - Array of tag definitions
 * @returns Map where keys are searchable terms and values are canonical forms
 *
 * @example
 * const termMap = getAllSearchableTerms(tagVocabulary);
 * termMap.get('LXX') // Returns 'Septuagint'
 * termMap.get('Septuagint') // Returns 'Septuagint'
 */
export function getAllSearchableTerms(vocab: TagDefinition[]): Map<string, string> {
	const termMap = new Map<string, string>();

	for (const def of vocab) {
		// Map canonical to itself
		termMap.set(def.canonical, def.canonical);

		// Map all variations to canonical
		for (const variation of def.variations) {
			termMap.set(variation, def.canonical);
		}
	}

	return termMap;
}
