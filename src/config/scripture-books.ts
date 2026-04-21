/**
 * Scripture book definitions for the Protestant canon plus deuterocanonical and Orthodox additions.
 * Used for detecting Bible references in podcast transcripts.
 */

/**
 * Book definition with optional LLM verification for ambiguous names.
 * When llmVerify is true, description is required to provide context for verification.
 */
export type BookDefinition =
  | {
      canonical: string;
      abbreviations: string[];
      variants: string[];
      testament: "old" | "new";
      llmVerify?: false;
    }
  | {
      canonical: string;
      abbreviations: string[];
      variants: string[];
      testament: "old" | "new";
      llmVerify: true;
      description: string;
    };

/**
 * The 82 books in this list: 55 Old Testament books and 27 New Testament books.
 * Includes the Protestant canon plus deuterocanonical and Orthodox additions.
 */
export const scriptureBooks: BookDefinition[] = [
  // ============================================
  // OLD TESTAMENT - 55 books
  // ============================================

  // Pentateuch (Torah)
  {
    canonical: "Genesis",
    abbreviations: ["Gen", "Ge", "Gn"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Exodus",
    abbreviations: ["Exod", "Ex", "Exo"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Leviticus",
    abbreviations: ["Lev", "Le", "Lv"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Numbers",
    abbreviations: ["Num", "Nu", "Nm", "Nb"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Deuteronomy",
    abbreviations: ["Deut", "Dt", "De"],
    variants: [],
    testament: "old",
  },

  // Historical Books
  {
    canonical: "Joshua",
    abbreviations: ["Josh", "Jos", "Jsh"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Judges",
    abbreviations: ["Judg", "Jdg", "Jg", "Jdgs"],
    variants: [],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Judges in the Hebrew Bible, covering the period between Joshua and the monarchy",
  },
  {
    canonical: "Ruth",
    abbreviations: ["Ru", "Rth"],
    variants: [],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Ruth in the Hebrew Bible, the story of Ruth the Moabite and her mother-in-law Naomi",
  },
  {
    canonical: "1 Samuel",
    abbreviations: ["1 Sam", "1Sam", "1Sa", "1S"],
    variants: ["1st Samuel", "First Samuel", "I Samuel", "I Sam"],
    testament: "old",
  },
  {
    canonical: "2 Samuel",
    abbreviations: ["2 Sam", "2Sam", "2Sa", "2S"],
    variants: ["2nd Samuel", "Second Samuel", "II Samuel", "II Sam"],
    testament: "old",
  },
  {
    canonical: "1 Kings",
    abbreviations: ["1 Kgs", "1Kgs", "1Ki", "1K"],
    variants: ["1st Kings", "First Kings", "I Kings", "I Kgs"],
    testament: "old",
  },
  {
    canonical: "2 Kings",
    abbreviations: ["2 Kgs", "2Kgs", "2 Ki", "2Ki", "2K"],
    variants: ["2nd Kings", "Second Kings", "II Kings", "II Kgs"],
    testament: "old",
  },
  {
    canonical: "1 Chronicles",
    abbreviations: ["1 Chr", "1Chr", "1Ch"],
    variants: ["1st Chronicles", "First Chronicles", "I Chronicles", "I Chr"],
    testament: "old",
  },
  {
    canonical: "2 Chronicles",
    abbreviations: ["2 Chr", "2Chr", "2Ch"],
    variants: [
      "2nd Chronicles",
      "Second Chronicles",
      "II Chronicles",
      "II Chr",
    ],
    testament: "old",
  },
  {
    canonical: "Ezra",
    abbreviations: ["Ezr"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Nehemiah",
    abbreviations: ["Neh", "Ne"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Tobit",
    abbreviations: ["Tob", "Tb"],
    variants: ["Book of Tobit"],
    testament: "old",
  },
  {
    canonical: "Judith",
    abbreviations: ["Jdt", "Jth"],
    variants: ["Book of Judith"],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Judith in the deuterocanon, about Judith and the defeat of Holofernes",
  },
  {
    canonical: "1 Esdras",
    abbreviations: ["1 Esd", "1Esd"],
    variants: ["First Esdras", "1st Esdras", "Greek Ezra", "Book of 1 Esdras"],
    testament: "old",
  },
  {
    canonical: "2 Esdras",
    abbreviations: ["2 Esd", "2Esd"],
    variants: [
      "Second Esdras",
      "2nd Esdras",
      "II Esdras",
      "Latin Esdras",
      "4 Ezra",
    ],
    testament: "old",
  },
  {
    canonical: "1 Maccabees",
    abbreviations: ["1 Macc", "1Macc"],
    variants: ["First Maccabees", "1st Maccabees", "I Maccabees"],
    testament: "old",
  },
  {
    canonical: "2 Maccabees",
    abbreviations: ["2 Macc", "2Macc"],
    variants: ["Second Maccabees", "2nd Maccabees", "II Maccabees"],
    testament: "old",
  },
  {
    canonical: "3 Maccabees",
    abbreviations: ["3 Macc", "3Macc"],
    variants: ["Third Maccabees", "3rd Maccabees", "III Maccabees"],
    testament: "old",
  },
  {
    canonical: "4 Maccabees",
    abbreviations: ["4 Macc", "4Macc"],
    variants: ["Fourth Maccabees", "4th Maccabees", "IV Maccabees"],
    testament: "old",
  },
  {
    canonical: "Esther",
    abbreviations: ["Esth", "Est", "Es"],
    variants: [],
    testament: "old",
  },

  // Wisdom/Poetry Books
  {
    canonical: "Job",
    abbreviations: ["Jb"],
    variants: [],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Job in the Hebrew Bible, about the righteous man Job who suffered",
  },
  {
    canonical: "Psalms",
    abbreviations: ["Ps", "Pss", "Psa", "Psm"],
    variants: ["Psalm"],
    testament: "old",
  },
  {
    canonical: "Proverbs",
    abbreviations: ["Prov", "Pro", "Pr", "Prv"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Ecclesiastes",
    abbreviations: ["Eccl", "Ecc", "Ec", "Qoh"],
    variants: ["Qoheleth", "Kohelet"],
    testament: "old",
  },
  {
    canonical: "Song of Solomon",
    abbreviations: ["Song", "SS", "Sg", "SOS", "Cant"],
    variants: ["Song of Songs", "Canticles", "Canticle of Canticles"],
    testament: "old",
  },
  {
    canonical: "Wisdom of Solomon",
    abbreviations: ["Wis", "Ws"],
    variants: ["Wisdom", "Book of Wisdom"],
    testament: "old",
  },
  {
    canonical: "Sirach",
    abbreviations: ["Sir"],
    variants: [
      "Ecclesiasticus",
      "Ben Sira",
      "Wisdom of Sirach",
      "Book of Sirach",
    ],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Sirach (Ecclesiasticus) in the deuterocanon, a wisdom text associated with Ben Sira",
  },

  // Major Prophets
  {
    canonical: "Isaiah",
    abbreviations: ["Isa", "Is"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Jeremiah",
    abbreviations: ["Jer", "Je", "Jr"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Lamentations",
    abbreviations: ["Lam", "La"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Baruch",
    abbreviations: ["Bar"],
    variants: ["Book of Baruch"],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Baruch in the deuterocanon, associated with Jeremiah's scribe Baruch",
  },
  {
    canonical: "Letter of Jeremiah",
    abbreviations: ["Let Jer", "EpJer"],
    variants: ["Epistle of Jeremiah"],
    testament: "old",
  },
  {
    canonical: "Ezekiel",
    abbreviations: ["Ezek", "Eze", "Ezk"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Daniel",
    abbreviations: ["Dan", "Da", "Dn"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Prayer of Azariah",
    abbreviations: [],
    variants: [
      "Song of the Three Young Men",
      "Song of the Three Holy Children",
      "Book of the Prayer of Azariah",
    ],
    testament: "old",
  },
  {
    canonical: "Susanna",
    abbreviations: ["Sus"],
    variants: ["Book of Susanna"],
    testament: "old",
    llmVerify: true,
    description:
      "The Book of Susanna in the Greek additions to Daniel, about Susanna and the two elders",
  },
  {
    canonical: "Bel and the Dragon",
    abbreviations: ["Bel"],
    variants: ["Book of Bel and the Dragon"],
    testament: "old",
  },

  // Minor Prophets
  {
    canonical: "Hosea",
    abbreviations: ["Hos", "Ho"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Joel",
    abbreviations: ["Jl"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Amos",
    abbreviations: ["Am"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Obadiah",
    abbreviations: ["Obad", "Ob"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Jonah",
    abbreviations: ["Jon", "Jnh"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Micah",
    abbreviations: ["Mic", "Mi"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Nahum",
    abbreviations: ["Nah", "Na"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Habakkuk",
    abbreviations: ["Hab", "Hb"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Zephaniah",
    abbreviations: ["Zeph", "Zep", "Zp"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Haggai",
    abbreviations: ["Hag", "Hg"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Zechariah",
    abbreviations: ["Zech", "Zec", "Zc"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Malachi",
    abbreviations: ["Mal", "Ml"],
    variants: [],
    testament: "old",
  },
  {
    canonical: "Prayer of Manasseh",
    abbreviations: ["Pr Man", "PrMan"],
    variants: ["Book of the Prayer of Manasseh"],
    testament: "old",
  },

  // ============================================
  // NEW TESTAMENT - 27 books
  // ============================================

  // Gospels
  {
    canonical: "Matthew",
    abbreviations: ["Matt", "Mt"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "Mark",
    abbreviations: ["Mk", "Mr"],
    variants: [],
    testament: "new",
    llmVerify: true,
    description:
      "The Gospel of Mark in the New Testament, the second Gospel, traditionally attributed to John Mark",
  },
  {
    canonical: "Luke",
    abbreviations: ["Lk", "Lu"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "John",
    abbreviations: ["Jn", "Jhn"],
    variants: ["Gospel of John"],
    testament: "new",
  },

  // History
  {
    canonical: "Acts",
    abbreviations: ["Ac"],
    variants: ["Acts of the Apostles"],
    testament: "new",
    llmVerify: true,
    description:
      "The Book of Acts (Acts of the Apostles) in the New Testament, the history of the early church",
  },

  // Pauline Epistles
  {
    canonical: "Romans",
    abbreviations: ["Rom", "Ro", "Rm"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "1 Corinthians",
    abbreviations: ["1 Cor", "1Cor", "1Co"],
    variants: [
      "1st Corinthians",
      "First Corinthians",
      "I Corinthians",
      "I Cor",
    ],
    testament: "new",
  },
  {
    canonical: "2 Corinthians",
    abbreviations: ["2 Cor", "2Cor", "2Co"],
    variants: [
      "2nd Corinthians",
      "Second Corinthians",
      "II Corinthians",
      "II Cor",
    ],
    testament: "new",
  },
  {
    canonical: "Galatians",
    abbreviations: ["Gal", "Ga"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "Ephesians",
    abbreviations: ["Eph", "Ephes"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "Philippians",
    abbreviations: ["Phil", "Php", "Pp"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "Colossians",
    abbreviations: ["Col", "Co"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "1 Thessalonians",
    abbreviations: ["1 Thess", "1Thess", "1Th"],
    variants: [
      "1st Thessalonians",
      "First Thessalonians",
      "I Thessalonians",
      "I Thess",
    ],
    testament: "new",
  },
  {
    canonical: "2 Thessalonians",
    abbreviations: ["2 Thess", "2Thess", "2Th"],
    variants: [
      "2nd Thessalonians",
      "Second Thessalonians",
      "II Thessalonians",
      "II Thess",
    ],
    testament: "new",
  },
  {
    canonical: "1 Timothy",
    abbreviations: ["1 Tim", "1Tim", "1Ti"],
    variants: ["1st Timothy", "First Timothy", "I Timothy", "I Tim"],
    testament: "new",
  },
  {
    canonical: "2 Timothy",
    abbreviations: ["2 Tim", "2Tim", "2Ti"],
    variants: ["2nd Timothy", "Second Timothy", "II Timothy", "II Tim"],
    testament: "new",
  },
  {
    canonical: "Titus",
    abbreviations: ["Tit", "Ti"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "Philemon",
    abbreviations: ["Phlm", "Phm", "Pm"],
    variants: [],
    testament: "new",
  },

  // General Epistles
  {
    canonical: "Hebrews",
    abbreviations: ["Heb"],
    variants: [],
    testament: "new",
  },
  {
    canonical: "James",
    abbreviations: ["Jas", "Jm"],
    variants: [],
    testament: "new",
    llmVerify: true,
    description:
      "The Epistle of James in the New Testament, traditionally attributed to James the brother of Jesus",
  },
  {
    canonical: "1 Peter",
    abbreviations: ["1 Pet", "1Pet", "1Pe", "1Pt", "1P"],
    variants: ["1st Peter", "First Peter", "I Peter", "I Pet"],
    testament: "new",
  },
  {
    canonical: "2 Peter",
    abbreviations: ["2 Pet", "2Pet", "2Pe", "2Pt", "2P"],
    variants: ["2nd Peter", "Second Peter", "II Peter", "II Pet"],
    testament: "new",
  },
  {
    canonical: "1 John",
    abbreviations: ["1 Jn", "1Jn", "1Jo", "1J"],
    variants: ["1st John", "First John", "I John", "I Jn"],
    testament: "new",
  },
  {
    canonical: "2 John",
    abbreviations: ["2 Jn", "2Jn", "2Jo", "2J"],
    variants: ["2nd John", "Second John", "II John", "II Jn"],
    testament: "new",
  },
  {
    canonical: "3 John",
    abbreviations: ["3 Jn", "3Jn", "3Jo", "3J"],
    variants: ["3rd John", "Third John", "III John", "III Jn"],
    testament: "new",
  },
  {
    canonical: "Jude",
    abbreviations: ["Jud", "Jd"],
    variants: [],
    testament: "new",
  },

  // Apocalyptic
  {
    canonical: "Revelation",
    abbreviations: ["Rev", "Re", "Rv"],
    variants: ["Apocalypse", "Apocalypse of John", "Book of Revelation"],
    testament: "new",
  },
];
