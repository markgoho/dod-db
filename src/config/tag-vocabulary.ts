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
  "character",
  "person",
  "place",
  "people",
  "literature",
  "theology",
  "scholarship",
  "religion",
  "event",
] as const;

/**
 * Tag category type inferred from TAG_CATEGORIES array.
 * This ensures the type stays in sync with the array automatically.
 */
export type TagCategory = (typeof TAG_CATEGORIES)[number];

/**
 * Tag status for the learning workflow.
 * - 'accepted': Verified tag, part of the core vocabulary
 * - 'proposed': Discovered by LLM, pending review
 * - 'rejected': Reviewed and rejected (kept for exclusion from future discovery)
 */
export type TagStatus = "accepted" | "proposed" | "rejected";

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
  {
    canonical: "Abraham",
    variations: ["Abram", "Abraham's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Isaac",
    variations: ["Isaac's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Jesus",
    variations: ["Jesus'", "Christ"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Moses",
    variations: ["Moshe", "Moses'", "Moses's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Adam",
    variations: ["Adam's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Eve",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Lot",
    variations: ["Lot's"],
    category: "character",
    status: "accepted",
    caseSensitive: true,
  },
  {
    canonical: "Paul",
    variations: ["Pauline"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Jephthah",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "John of Patmos",
    variations: ["John the Revelator"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Bart Ehrman",
    variations: ["Ehrman"],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Hagar",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Ishmael",
    variations: ["Ishmaelites"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Peter",
    variations: ["Simon Peter"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "James",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "James the brother of Jesus, not simply a reference to the epistle of James or a chapter and verse in James",
    status: "accepted",
  },
  {
    canonical: "John",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "John the Apostle and Evangelist, not simply a reference to the gospel of John or a chapter and verse in John",
    status: "accepted",
  },
  {
    canonical: "Luke",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Luke the Apostle and Evangelist, not simply a reference to the gospel of Luke or a chapter and verse in Luke",
    status: "accepted",
  },
  {
    canonical: "Matthew",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Matthew the Apostle and Evangelist, not simply a reference to the gospel of matthew or a chapter and verse in Matthew",
    status: "accepted",
  },
  {
    canonical: "Noah",
    variations: ["Noah's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Jeremiah",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Mary Magdalene",
    variations: ["Mary"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Balaam",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Daniel",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Daniel from the Book of Daniel",
    status: "accepted",
  },
  {
    canonical: "Enoch",
    variations: [],
    category: "character",
    status: "accepted",
  },

  // BIBLICAL PLACES (12 terms)
  {
    canonical: "Jerusalem",
    variations: ["New Jerusalem"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Sodom",
    variations: ["Sodom and Gomorrah"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Gomorrah",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Egypt",
    variations: ["Egyptian"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Babylon",
    variations: ["Babylonian"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Ugarit",
    variations: ["Ugaritic"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Elephantine",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Carthage",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Dead Sea",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Mount Gerizim",
    variations: ["Gerizim"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Mount Ebal",
    variations: ["Ebal"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Lachish",
    variations: ["Tel Lachish"],
    category: "place",
    status: "accepted",
  },

  // BIBLICAL TEXTS (20 terms)
  {
    canonical: "Torah",
    variations: ["Tora", "Torrah"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Septuagint",
    variations: ["LXX", "Septuigent"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Deuteronomy",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Dead Sea Scrolls",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "King James Version",
    variations: ["KJV"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Masoretic Text",
    variations: [],
    category: "literature",
    status: "accepted",
  },

  // THEOLOGICAL CONCEPTS (27 terms)
  {
    canonical: "YHWH",
    variations: ["Yahweh", "Adonai"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Asherah",
    variations: ["Athirat", "Atiratu"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "El",
    variations: ["El Shaddai"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Baal",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Trinity",
    variations: ["Trinitarian"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "divine council",
    variations: ["heavenly household"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Rapture",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Armageddon",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "apocalypse",
    variations: ["apocalyptic"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Molek",
    variations: ["Molech", "Moloch", "mulk"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "child sacrifice",
    variations: ["firstborn sacrifice"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "circumcision",
    variations: ["circumcised"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Easter",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Hell",
    variations: ["Gehenna"],
    category: "place",
    status: "accepted",
  },
  { canonical: "Sheol", variations: [], category: "place", status: "accepted" },
  {
    canonical: "Satan",
    variations: ["the devil", "devil"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "angel",
    variations: ["angels"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Monotheism",
    variations: ["monotheistic"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Univocality",
    variations: ["univocal", "non-univocal", "non-univocality"],
    category: "scholarship",
    status: "accepted",
  },

  // SCHOLARLY TERMS (15 terms)
  {
    canonical: "textual criticism",
    variations: [],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "redaction criticism",
    variations: [],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "source criticism",
    variations: [],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "biblical canon",
    variations: ["canonicity", "canon"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "provenance",
    variations: ["provenience", "unprovenanced"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "etiology",
    variations: ["etiological"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "theophany",
    variations: ["ish theophany"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "cognitive dissonance",
    variations: [],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "archaeology",
    variations: ["archaeological"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "epigraphy",
    variations: ["epigraphers"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "forgery",
    variations: ["forged", "fake artifacts"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "historical criticism",
    variations: ["historical-critical method"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "preterist interpretation",
    variations: ["preterism"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "futurist interpretation",
    variations: ["futurism"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "Judah",
    variations: ["Judahites", "Judahite"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Israel",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "inerrancy",
    variations: ["inerrant"],
    category: "scholarship",
    status: "accepted",
  },
  {
    canonical: "King David",
    variations: ["David"],
    category: "character",
    llmVerify: true,
    description: "King David of Israel",
    status: "accepted",
  },
  {
    canonical: "Euphrates",
    variations: ["Euphrates River"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Euphrates River",
    variations: [],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "sons of God",
    variations: [],
    category: "character",
    status: "rejected",
  },
  {
    canonical: "Nephilim",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "giants",
    variations: [],
    category: "character",
    status: "rejected",
  },
  {
    canonical: "Book of Enoch",
    variations: ["1 Enoch", "First Enoch"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Islam",
    variations: ["Muslim"],
    category: "religion",
    status: "accepted",
  },
  {
    canonical: "Cherubim",
    variations: [],
    category: "character",
    status: "accepted",
  },
  { canonical: "Syria", variations: [], category: "place", status: "accepted" },
  {
    canonical: "Samson",
    variations: [],
    category: "character",
    status: "accepted",
    llmVerify: true,
    description: "Samson from the Book of Judges",
  },
  {
    canonical: "Gideon",
    variations: [],
    category: "character",
    status: "accepted",
    llmVerify: true,
    description: "Gideon from the Book of Judges",
  },
  {
    canonical: "Gabriel",
    variations: ["Archangel Gabriel"],
    category: "character",
    status: "accepted",
    llmVerify: true,
    description: "Archangel Gabriel",
  },
  {
    canonical: "Michael",
    variations: ["Archangel Michael"],
    category: "character",
    status: "accepted",
    llmVerify: true,
    description: "Archangel Michael",
  },
  {
    canonical: "Jonah",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "from the bible, swallowed by a large fish",
    status: "accepted",
  },
  {
    canonical: "Nineveh",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Assyria",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Hezekiah",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "prophet",
    variations: [],
    category: "character",
    status: "rejected",
  },
  {
    canonical: "Tarshish",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Sennecherib",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Christian Nationalism",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Andrew Whitehead",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "bible",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "moral",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Ten Commandments",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "exodus 20",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "exodus 34",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "commandments",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "deuteronomy 5",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Ritual Decalogue",
    variations: ["ritual decalogue"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Ethical Decalogue",
    variations: ["ethical decalogue"],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "covenant code",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Talmud",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Moabites",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Ammonites",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Sarah",
    variations: [],
    category: "people",
    llmVerify: true,
    description: "Abraham's wife, mentioned in the Old Testament",
    status: "accepted",
  },
  {
    canonical: "Gentiles",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Lilith",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "often considered the first wife of Adam",
    status: "accepted",
  },
  {
    canonical: "Joseph",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "son of Jacob, sold into slavery in the Old Testament",
    status: "accepted",
  },
  {
    canonical: "Samaritans",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Amorites",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Cain",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "son of Adam, brother of Abel",
    status: "accepted",
  },
  {
    canonical: "Seth",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "third son of Adam, born after Cain killed Abel",
    status: "accepted",
  },
  {
    canonical: "Lamech",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Methuselah",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Jared",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "father of Enoch in the line of Adam",
    status: "accepted",
  },
  {
    canonical: "Athanasius of Alexandria",
    variations: ["Athanasius"],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Hebrews",
    variations: ["jews", "hebrews", "israelites"],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "rabbis",
    variations: [],
    category: "people",
    status: "rejected",
  },
  {
    canonical: "Romans",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Eschatology",
    variations: ["eschatological", "eschaton", "end times", "end time"],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "historicism",
    variations: [],
    category: "scholarship",
    status: "rejected",
  },
  {
    canonical: "prophecies",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "prophecy",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "temple",
    variations: [],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "Gaza",
    variations: ["gaza"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "scholars",
    variations: [],
    category: "person",
    status: "rejected",
  },
  {
    canonical: "studies",
    variations: [],
    category: "scholarship",
    status: "rejected",
  },
  {
    canonical: "disability studies",
    variations: [],
    category: "scholarship",
    status: "rejected",
  },
  {
    canonical: "spirit",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "gospels",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Belshazzar",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Nebuchadnezzar",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Antiochus IV Epiphanes",
    variations: ["Antiochus Epiphanes"],
    category: "person",
    llmVerify: true,
    description: "king of the Seleucid Empire",
    status: "accepted",
  },
  {
    canonical: "Cyrus the Great",
    variations: ["cyrus", "Cyrus the Persian"],
    category: "person",
    llmVerify: true,
    description: "Cyrus the Great, who founded the Achaemenid Empire in 550 BC",
    status: "accepted",
  },
  {
    canonical: "Nabonidus",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Qumran",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Medes",
    variations: [],
    category: "people",
    llmVerify: true,
    description:
      "people that lived in Median Kingdom that existed from the 7th century BCE until the mid-6th century BCE",
    status: "accepted",
  },
  {
    canonical: "Median Kingdom",
    variations: ["Media", "Median"],
    category: "place",
    llmVerify: true,
    description:
      "a political entity centered in Ecbatana that existed from the 7th century BCE until the mid-6th century BCE",
    status: "accepted",
  },
  {
    canonical: "epistles",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Papias of Hierapolis",
    variations: ["papias"],
    category: "person",
    llmVerify: true,
    description:
      "Greek Apostolic Father, Bishop of Hierapolis (modern Pamukkale, Turkey), and author who lived c. 60 – c. 130 AD",
    status: "accepted",
  },
  {
    canonical: "Pastoral Epistles",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Irenaeus",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "a Greek bishop noted for his role in guiding and expanding Christian communities in the southern regions of present-day France",
    status: "accepted",
  },
  {
    canonical: "Galilee",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Saint Titus",
    variations: ["Titus"],
    category: "character",
    llmVerify: true,
    description:
      "early Christian missionary and church leader, a companion and disciple of Paul the Apostle",
    status: "accepted",
  },
  {
    canonical: "Julius Wellhausen",
    variations: ["Wellhausen"],
    category: "person",
    llmVerify: true,
    description: "German biblical scholar and orientalist",
    status: "accepted",
  },
  {
    canonical: "King Josiah",
    variations: ["Josiah"],
    category: "character",
    llmVerify: true,
    description:
      "the 16th king of Judah (c. 640-609 BCE). Described as one of Judah’s most important kings",
    status: "accepted",
  },
  {
    canonical: "scribes",
    variations: [],
    status: "rejected",
    category: "people",
  },
  {
    canonical: "Bethlehem",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Wise Men",
    variations: [],
    category: "character",
    status: "rejected",
  },
  {
    canonical: "Herod the Great",
    variations: ["Herod"],
    category: "person",
    llmVerify: true,
    description:
      "Herod Ior Herod the Great (c.72- c. 4 BCE) was a Roman Jewish client king of the Herodian kingdom of Judea",
    status: "accepted",
  },
  {
    canonical: "Judaism",
    variations: [],
    category: "religion",
    status: "accepted",
  },
  {
    canonical: "Virgin Birth",
    variations: [],
    category: "theology",
    llmVerify: true,
    description:
      "referring specifically to the Virgin Birth of Mary, the mother of Jesus",
    status: "accepted",
  },
  {
    canonical: "gospel",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  { canonical: "east", variations: [], category: "place", status: "rejected" },
  {
    canonical: "Gospel of James",
    variations: ["protevangelium of james"],
    category: "literature",
    llmVerify: true,
    description:
      "a second-century infancy gospel telling of the miraculous conception of Mary, the mother of Jesus, her upbringing and marriage to Joseph, the journey of the couple to Bethlehem, the birth of Jesus, and events immediately following.",
    status: "accepted",
  },
  {
    canonical: "Judeans",
    variations: ["Judean"],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Persia",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "dragon",
    variations: [],
    category: "character",
    status: "rejected",
  },
  {
    canonical: "Codex Sinaiticus",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Theosis",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Anatolia",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "also known as Asia Minor, is the large peninsula forming the Asian part of modern-day Turkey",
    status: "accepted",
  },
  {
    canonical: "lake of fire",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Domitian",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Nero",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Roman emperor and the final emperor of the Julio-Claudian dynasty, reigning from AD 54 until his death in AD 68",
    status: "accepted",
  },
  {
    canonical: "King Saul",
    variations: ["Saul"],
    category: "character",
    llmVerify: true,
    description: "monarch of ancient Israel and Judah",
    status: "accepted",
  },
  {
    canonical: "Samuel",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "prophet, priest, and judge who led Israel during its transition from judges to monarchy, anointing both Israel's first king, Saul, and his successor, David",
    status: "accepted",
  },
  {
    canonical: "elohim",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Ham",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "son of Noah in the Old Testament",
    status: "accepted",
  },
  {
    canonical: "Canaan",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Japheth",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Shem",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Canaanites",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Africans",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "salt lake city",
    variations: [],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "Africa",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "divine",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "theos",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "son of god",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Council of Nicaea",
    variations: [],
    category: "event",
    status: "accepted",
  },
  {
    canonical: "Holy Spirit",
    variations: ["Holy Ghost"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "logos",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "ntsv",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Isaiah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "the prophet Isaiah from the book of Isaiah, not references to the text of the book",
    status: "accepted",
  },
  {
    canonical: "Bernhard Duhm",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Josephus",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Ken Ham",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Jennifer Bird",
    variations: ["Dr. Jennifer Bird"],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Essenes",
    variations: [],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "Masada",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Leningrad Codex",
    variations: [],
    category: "literature",
    status: "accepted",
  },
  {
    canonical: "Joshua",
    variations: ["Joshua's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Origen",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Helen Bond",
    variations: ["Dr. Helen Bond"],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "historical Jesus",
    variations: ["quest for the historical Jesus"],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "John the Baptist",
    variations: ["the Baptist"],
    category: "character",
    llmVerify: true,
    description:
      "Jewish preacher who baptized Jesus, executed by Herod Antipas",
    status: "accepted",
  },
  {
    canonical: "Gospel of Thomas",
    variations: ["Thomas"],
    category: "literature",
    llmVerify: true,
    description:
      "Non-canonical sayings gospel discovered at Nag Hammadi in 1945",
    status: "accepted",
  },
  {
    canonical: "Candida Moss",
    variations: ["Dr. Candida Moss"],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Tertius",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Aesop",
    variations: [],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "Pliny the Younger",
    variations: ["Pliny"],
    category: "person",
    llmVerify: true,
    description:
      "Roman author and administrator (61-113 CE) who wrote about early Christians",
    status: "accepted",
  },
  {
    canonical: "Clement of Rome",
    variations: ["Clement"],
    category: "person",
    llmVerify: true,
    description:
      "Early Christian bishop of Rome (late 1st century CE), traditionally the fourth pope",
    status: "accepted",
  },
  {
    canonical: "First Clement",
    variations: ["1 Clement"],
    category: "literature",
    llmVerify: true,
    description:
      "Letter from the church of Rome to Corinth, attributed to Clement (c. 96 CE)",
    status: "accepted",
  },
  {
    canonical: "Pontius Pilate",
    variations: ["Pilate"],
    category: "person",
    llmVerify: true,
    description:
      "Roman prefect of Judea (26-36 CE) who presided over the trial of Jesus",
    status: "accepted",
  },
  {
    canonical: "Passover",
    variations: ["Pesach"],
    category: "event",
    llmVerify: true,
    description:
      "Jewish festival commemorating the Israelites' exodus from Egypt",
    status: "accepted",
  },
  {
    canonical: "Bethany",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "Village near Jerusalem, home of Mary, Martha, and Lazarus in the Gospels",
    status: "accepted",
  },
  {
    canonical: "Synoptic Gospels",
    variations: ["Synoptics"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Judas Iscariot",
    variations: ["Judas"],
    category: "character",
    llmVerify: true,
    description:
      "One of Jesus' twelve apostles who betrayed him according to the Gospels",
    status: "accepted",
  },
  {
    canonical: "Garden of Gethsemane",
    variations: ["Gethsemane"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Sanhedrin",
    variations: ["the Sanhedrin"],
    category: "people",
    status: "accepted",
  },
  {
    canonical: "cognitive science",
    variations: ["cognitive science of religion"],
    category: "scholarship",
    status: "rejected",
  },
  {
    canonical: "Goliath",
    variations: ["Goliath's"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Philistines",
    variations: ["Philistine"],
    category: "people",
    llmVerify: true,
    description:
      "An ancient people who inhabited parts of Canaan, often in conflict with the Israelites",
    status: "accepted",
  },
  {
    canonical: "Elhanan son of Jair",
    variations: ["Elhanan"],
    category: "character",
    llmVerify: true,
    description:
      "Israelite warrior credited with killing Goliath in 2 Samuel 21:19",
    status: "accepted",
  },
  {
    canonical: "soul",
    variations: ["souls", "nephesh"],
    category: "theology",
    description:
      "In biblical contexts, the essence of a person that continues to exist after death, sometimes used synonymously with spirit; related to the Hebrew 'nephesh'",
    status: "proposed",
    addedInEpisode: 53,
  },
  {
    canonical: "Elijah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A prophet in the Hebrew Bible, known for his dramatic confrontations with Baal worshippers and his ascension to heaven in a chariot of fire",
    status: "accepted",
  },
  {
    canonical: "Ruach Elohim",
    variations: ["Ruach ha-Kodesh"],
    category: "theology",
    description:
      "Hebrew term meaning 'spirit of God,' often used in the Hebrew Bible to describe God's active power and presence",
    status: "proposed",
    addedInEpisode: 53,
  },
  {
    canonical: "Samaria",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Bethel",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "An ancient city in the Land of Israel, associated with Jacob's dream in Genesis and later a religious center",
    status: "accepted",
  },
  {
    canonical: "demons",
    variations: ["demon", "demon possession"],
    category: "theology",
    description:
      "Malevolent spiritual entities or agents believed to cause harm and influence human behavior",
    status: "proposed",
    addedInEpisode: 53,
  },
  {
    canonical: "ecstatic prophecy",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Barnabas",
    variations: ["Barnabus"],
    category: "character",
    llmVerify: true,
    description:
      "An early Christian disciple and missionary, often associated with Paul before their separation. Mentioned in the Book of Acts.",
    status: "accepted",
  },
  {
    canonical: "Council of Jerusalem",
    variations: ["Jerusalem Council"],
    category: "event",
    llmVerify: true,
    description:
      "A meeting in Jerusalem described in Acts 15, where early Christian leaders discussed the requirements for Gentile converts.",
    status: "accepted",
  },
  {
    canonical: "Silas",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A companion of Paul on his missionary journeys, mentioned in the Book of Acts.",
    status: "accepted",
  },
  {
    canonical: "Cornelius",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A Roman centurion who, according to the Book of Acts, converted to Christianity after a vision and an encounter with Peter.",
    status: "accepted",
  },
  {
    canonical: "Edom",
    variations: ["Idumea"],
    category: "place",
    llmVerify: true,
    description:
      "An ancient kingdom located southeast of Israel, often mentioned in the Hebrew Bible.",
    status: "accepted",
  },
  {
    canonical: "Pergamum",
    variations: ["Pergamos"],
    category: "place",
    llmVerify: true,
    description:
      "An ancient city in Anatolia (modern-day Turkey), mentioned in the Book of Revelation as one of the seven churches.",
    status: "accepted",
  },
  {
    canonical: "Ahaziah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "King of Judah whose death is recounted differently in 2 Kings and 2 Chronicles",
    status: "accepted",
  },
  {
    canonical: "Jehu",
    variations: [],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Joram",
    variations: ["Jehoram"],
    category: "character",
    llmVerify: true,
    description: "King of Israel who was assassinated by Jehu",
    status: "accepted",
  },
  {
    canonical: "NRSV",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Megiddo",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Capernaum",
    variations: [],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "sin",
    variations: ["sins"],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "forgiveness",
    variations: [],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Son of Man",
    variations: [],
    category: "theology",
    description:
      "Title used by Jesus in the Gospels, subject to debate regarding its meaning and application",
    status: "proposed",
    addedInEpisode: 55,
  },
  {
    canonical: "David Carr",
    variations: ["Carr"],
    category: "person",
    llmVerify: true,
    description:
      "Professor of Hebrew Bible at Union Theological Seminary, guest on the podcast",
    status: "accepted",
  },
  {
    canonical: "Tower of Babel",
    variations: ["Babel"],
    category: "character",
    status: "accepted",
  },
  {
    canonical: "Garden of Eden",
    variations: ["Eden"],
    category: "place",
    llmVerify: true,
    description:
      "The idyllic garden where Adam and Eve originally lived, according to Genesis",
    status: "accepted",
  },
  {
    canonical: "Priestly",
    variations: ["P", "Priestly source"],
    category: "scholarship",
    description:
      "Referring to the Priestly Source (P), one of the hypothesized sources of the Pentateuch",
    status: "proposed",
    addedInEpisode: 56,
  },
  {
    canonical: "Mesopotamian",
    variations: ["Mesopotamia"],
    category: "place",
    status: "accepted",
  },
  {
    canonical: "Flood",
    variations: ["the Flood"],
    category: "event",
    llmVerify: true,
    description: "A cataclysmic event in Genesis where Elohim floods the world",
    status: "accepted",
  },
  {
    canonical: "Primeval History",
    variations: [],
    category: "literature",
    description:
      "The first 11 chapters of Genesis, dealing with creation, the flood, and the origins of civilization",
    status: "proposed",
    addedInEpisode: 56,
  },
  {
    canonical: "firmament",
    variations: ["raqia"],
    category: "theology",
    description:
      "The solid dome separating the waters above from the waters beneath in ancient Near Eastern cosmology, particularly in Genesis 1",
    status: "proposed",
    addedInEpisode: 57,
  },
  {
    canonical: "psalm 82",
    variations: ["psalms 82"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "earth",
    variations: ["flat earth"],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "genesis 1",
    variations: ["genesis"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "job 26",
    variations: ["job"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "plato",
    variations: ["platonic"],
    category: "person",
    description: "Classical Greek philosopher",
    status: "proposed",
    addedInEpisode: 57,
  },
  {
    canonical: "William Tyndale",
    variations: ["Tyndale"],
    category: "person",
    status: "accepted",
  },
  {
    canonical: "rome",
    variations: ["roman"],
    category: "place",
    description:
      "Ancient city and former capital of the Roman Empire, located in present-day Italy; also the location of the Vatican",
    status: "proposed",
    addedInEpisode: 58,
  },
  {
    canonical: "Desiderius Erasmus",
    variations: ["erasmus's", "erasmus"],
    category: "person",
    llmVerify: true,
    description:
      "Desiderius Erasmus, a 16th-century Dutch Renaissance humanist, Catholic priest, social critic, teacher, and theologian",
    status: "accepted",
  },
  {
    canonical: "exodus 22",
    variations: ["exodus 22:8"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "niv",
    variations: [],
    category: "literature",
    description:
      "New International Version, a popular modern English translation of the Bible",
    status: "proposed",
    addedInEpisode: 58,
  },
  {
    canonical: "Sir Thomas More",
    variations: ["thomas more"],
    category: "person",
    llmVerify: true,
    description:
      "Sir Thomas More, an English lawyer, social philosopher, author, statesman, and Renaissance humanist",
    status: "accepted",
  },
  {
    canonical: "Latin Vulgate",
    variations: ["vulgate"],
    category: "literature",
    llmVerify: true,
    description:
      "The Latin Vulgate is a late fourth-century Latin translation of the Bible that became the Catholic Church's standard Latin translation",
    status: "accepted",
  },
  {
    canonical: "Martin Luther",
    variations: ["luther's", "luther"],
    category: "person",
    llmVerify: true,
    description:
      "Martin Luther was a German theologian, professor, pastor, priest, and church reformer of the 16th century",
    status: "accepted",
  },
  {
    canonical: "deuteronomy 32",
    variations: ["deuteronomy 32:8", "deuteronomy 32:43"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Textus Receptus",
    variations: ["receptus"],
    category: "literature",
    llmVerify: true,
    description:
      "A printed Greek text of the New Testament based on a collection of early manuscripts",
    status: "accepted",
  },
  {
    canonical: "genesis 2",
    variations: ["genesis 2:8"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "David Burnett",
    variations: ["Burnett"],
    category: "person",
    llmVerify: true,
    description:
      "Guest on the podcast and presenter at the Meanings and Ends of Monotheism conference.",
    status: "accepted",
  },
  {
    canonical: "Meanings and Ends of Monotheism",
    variations: ["conference"],
    category: "event",
    description:
      "A conference held at Brown University that was organized by Dan McClellan and David Burnett.",
    status: "proposed",
    addedInEpisode: 59,
  },
  {
    canonical: "Creation ex nihilo",
    variations: ["creatio ex nihilo"],
    category: "theology",
    description: "The doctrine that God created the universe from nothing.",
    status: "proposed",
    addedInEpisode: 59,
  },
  {
    canonical: "Unitarians",
    variations: ["Unitarian"],
    category: "religion",
    description:
      "A Christian theological movement that emphasizes the unity of God and rejects the Trinity.",
    status: "proposed",
    addedInEpisode: 59,
  },
  {
    canonical: "Second Temple period",
    variations: ["Second Temple"],
    category: "event",
    llmVerify: true,
    description:
      "The era in Jewish history between the rebuilding of the Jerusalem Temple and its destruction by the Romans.",
    status: "accepted",
  },
  {
    canonical: "Philo of Alexandria",
    variations: ["Philo"],
    category: "person",
    llmVerify: true,
    description:
      "A Hellenistic Jewish philosopher who lived in Alexandria, Egypt.",
    status: "accepted",
  },
  {
    canonical: "Debra Scoggins Ballentine",
    variations: ["Ballentine"],
    category: "person",
    llmVerify: true,
    description:
      "A scholar who presented a paper titled 'Translating Monotheism: How a Lens of Monotheism Impacts Translation'.",
    status: "accepted",
  },
  {
    canonical: "Hypostasis",
    variations: ["hypostases", "hypostatization"],
    category: "theology",
    llmVerify: true,
    description:
      "A technical term in theology and philosophy, referring to a distinct substance or entity, often used in discussions of the Trinity.",
    status: "accepted",
  },
  {
    canonical: "Athenagoras",
    variations: [],
    category: "person",
    llmVerify: true,
    description: "An early Christian apologist of the late 2nd century CE.",
    status: "accepted",
  },
  {
    canonical: "Pharisees",
    variations: [],
    category: "people",
    description:
      "A Jewish religious and political party in ancient Judea, known for their strict adherence to religious law",
    status: "proposed",
    addedInEpisode: 60,
  },
  {
    canonical: "textual",
    variations: [],
    category: "scholarship",
    status: "rejected",
  },
  {
    canonical: "Priscilla",
    variations: ["priska", "prisca"],
    category: "character",
    llmVerify: true,
    description:
      "A woman mentioned in the New Testament, associated with Aquila",
    status: "accepted",
  },
  {
    canonical: "Aquila",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A man mentioned in the New Testament, associated with Priscilla or Prisca/Priska",
    status: "accepted",
  },
  {
    canonical: "gil hicks-keaton",
    variations: ["jill hicks-keaton"],
    category: "person",
    status: "rejected",
  },
  {
    canonical: "nrsvue",
    variations: ["nrsv"],
    category: "literature",
    description:
      "New Revised Standard Version Updated Edition - a recent revision of the NRSV translation of the Bible",
    status: "proposed",
  },
  {
    canonical: "Southern Baptist Convention",
    variations: ["southern baptist"],
    category: "religion",
    status: "accepted",
  },
  {
    canonical: "numbers 5",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "James McGrath",
    variations: ["McGrath", "James F. McGrath"],
    category: "person",
    llmVerify: true,
    description:
      "Professor of New Testament at Butler University, scholar of John the Baptist and the Mandaeans",
    status: "accepted",
  },
  {
    canonical: "baptism",
    variations: ["baptized", "baptize"],
    category: "theology",
    llmVerify: true,
    description:
      "A religious ritual involving immersion in water, symbolizing purification or initiation",
    status: "accepted",
  },
  {
    canonical: "Elizabeth",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Mother of John the Baptist in the Gospel of Luke, wife of Zechariah",
    status: "accepted",
  },
  {
    canonical: "mandaeans",
    variations: ["mandaean"],
    category: "religion",
    description:
      "A Gnostic religious group that reveres John the Baptist, originating in Mesopotamia",
    status: "proposed",
    addedInEpisode: 61,
  },
  {
    canonical: "Gnostic",
    variations: ["Gnosticism"],
    category: "religion",
    llmVerify: true,
    description:
      "A religious movement emphasizing personal spiritual knowledge and a dualistic worldview",
    status: "accepted",
  },
  {
    canonical: "Herod Antipas",
    variations: ["Herod"],
    category: "person",
    llmVerify: true,
    description:
      "The son of Herod the Great, tetrarch of Galilee and Perea, who ordered the execution of John the Baptist",
    status: "accepted",
  },
  {
    canonical: "Herodias",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Wife of Herod Antipas who requested the beheading of John the Baptist",
    status: "accepted",
  },
  {
    canonical: "nag hammadi",
    variations: [],
    category: "place",
    description:
      "The location in upper Egypt where a collection of early Christian Gnostic texts were discovered in 1945",
    status: "proposed",
    addedInEpisode: 61,
  },
  {
    canonical: "epistemology",
    variations: [],
    category: "scholarship",
    description:
      "The branch of philosophy concerned with the theory of knowledge.",
    status: "proposed",
    addedInEpisode: 61,
  },
  {
    canonical: "asael",
    variations: ["Azael"],
    category: "character",
    description: "A fallen angel mentioned in the Book of Enoch",
    status: "proposed",
    addedInEpisode: 62,
  },
  {
    canonical: "nickelsburg",
    variations: ["George Nickelsburg"],
    category: "person",
    status: "rejected",
  },
  {
    canonical: "James VanderKam",
    variations: ["VanderKam"],
    category: "person",
    llmVerify: true,
    description:
      "James VanderKam, scholar known for his work on the Dead Sea Scrolls and 1 Enoch",
    status: "accepted",
  },
  {
    canonical: "Jacob",
    variations: ["Jacob's", "Jacobites"],
    category: "character",
    llmVerify: true,
    description:
      "Patriarch in Genesis, son of Isaac, father of the twelve tribes of Israel; his name is later changed to Israel",
    status: "accepted",
  },
  {
    canonical: "Esau",
    variations: ["Esau's"],
    category: "character",
    llmVerify: true,
    description:
      "Jacob's twin brother, son of Isaac, known for selling his birthright",
    status: "accepted",
  },
  {
    canonical: "Laban",
    variations: ["Laban's"],
    category: "character",
    description: "Father of Leah and Rachel, Jacob's uncle and father-in-law",
    status: "proposed",
    addedInEpisode: 63,
  },
  {
    canonical: "Rachel",
    variations: ["Rachel's"],
    category: "character",
    description: "Jacob's favorite wife, daughter of Laban",
    status: "proposed",
    addedInEpisode: 63,
  },
  {
    canonical: "Leah",
    variations: ["Leah's"],
    category: "character",
    description: "Jacob's first wife, daughter of Laban",
    status: "proposed",
    addedInEpisode: 63,
  },
  {
    canonical: "deborah",
    variations: ["Song of Deborah"],
    category: "character",
    description:
      "A prophet and judge in the Book of Judges, leads Israel to victory against the Canaanites",
    status: "proposed",
    addedInEpisode: 64,
  },
  {
    canonical: "sisera",
    variations: ["sisera's"],
    category: "character",
    description:
      "The commander of King Jabin's army in the Book of Judges, defeated by Deborah and killed by Jael",
    status: "proposed",
    addedInEpisode: 64,
  },
  {
    canonical: "King Jabin",
    variations: ["jabin"],
    category: "character",
    llmVerify: true,
    description:
      "King of Canaan in the Book of Judges, oppresses the Israelites",
    status: "accepted",
    addedInEpisode: 64,
  },
  {
    canonical: "jael",
    variations: ["yael"],
    category: "character",
    description:
      "A woman who kills Sisera in the Book of Judges, thus freeing Israel from the Canaanites",
    status: "proposed",
    addedInEpisode: 64,
  },
  {
    canonical: "barak",
    variations: ["baraq"],
    category: "character",
    description:
      "An Israelite military leader who assists Deborah in defeating the Canaanites in the Book of Judges",
    status: "proposed",
    addedInEpisode: 64,
  },
  {
    canonical: "Michael Kok",
    variations: [],
    category: "person",
    status: "rejected",
  },
  {
    canonical: "Baptist",
    variations: ["Baptists"],
    category: "religion",
    description:
      "A denomination of Protestant Christianity emphasizing believer's baptism",
    status: "proposed",
    addedInEpisode: 65,
  },
  {
    canonical: "Justin Martyr",
    variations: ["Justin"],
    category: "person",
    llmVerify: true,
    description:
      "An early Christian apologist and philosopher, known for his writings defending Christianity",
    status: "accepted",
  },
  {
    canonical: "Didache",
    variations: ["The Didache"],
    category: "literature",
    llmVerify: true,
    description:
      "An early Christian treatise containing instructions for Christian communities",
    status: "accepted",
  },
  {
    canonical: "Eusebius",
    variations: ["Eusebius of Caesarea"],
    category: "person",
    llmVerify: true,
    description:
      "A fourth-century church historian, known for his work on the history of the early church",
    status: "accepted",
  },
  {
    canonical: "Ignatius",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "An early second-century bishop of Antioch, known for his letters to various Christian communities",
    status: "accepted",
  },
  {
    canonical: "Theophilus",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "The person to whom the Gospel of Luke and the Book of Acts are addressed",
    status: "accepted",
  },
  {
    canonical: "salome",
    variations: [],
    category: "character",
    description: "A follower of Jesus who is mentioned in the Gospel of Mark",
    status: "proposed",
    caseSensitive: true,
    addedInEpisode: 65,
  },
  {
    canonical: "Jerome",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "A fourth-century church father, best known for translating the Bible into Latin (the Vulgate)",
    status: "accepted",
  },
  {
    canonical: "Richard Steiner",
    variations: ["Steiner"],
    category: "person",
    status: "rejected",
    addedInEpisode: 65,
  },
  {
    canonical: "Endor",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "Mentioned in the Bible as the place where Saul consulted a necromancer",
    status: "accepted",
  },
  {
    canonical: "Asia Minor",
    variations: [],
    category: "place",
    description:
      "A geographic region in southwestern Asia, corresponding to modern-day Turkey; important for early Christianity",
    status: "proposed",
    addedInEpisode: 66,
  },
  {
    canonical: "Louisiana",
    variations: [],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "Establishment Clause",
    variations: [],
    category: "event",
    status: "rejected",
    addedInEpisode: 66,
  },
  { canonical: "Texas", variations: [], category: "place", status: "rejected" },
  {
    canonical: "Supreme Court",
    variations: [],
    category: "event",
    status: "rejected",
  },
  {
    canonical: "First Amendment",
    variations: [],
    category: "event",
    status: "rejected",
    addedInEpisode: 66,
  },
  {
    canonical: "Red Scare",
    variations: [],
    category: "event",
    description:
      "A period of intense anti-communism in the United States during the 20th century",
    status: "proposed",
    addedInEpisode: 66,
  },
  {
    canonical: "Abigail",
    variations: [],
    category: "character",
    description:
      "One of David's wives, portrayed as virtuous and discerning; appears in 1 Samuel 25 and 2 Samuel 3",
    status: "proposed",
    addedInEpisode: 67,
  },
  {
    canonical: "Bathsheba",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Wife of Uriah the Hittite, later one of David's wives; their affair and its consequences are described in 2 Samuel 11-12",
    status: "accepted",
  },
  {
    canonical: "Absalom",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "David's son who led a rebellion against him; his story is told in 2 Samuel 13-19",
    status: "accepted",
  },
  {
    canonical: "Womanist Midrash",
    variations: [],
    category: "literature",
    description:
      "A book by Wil Gafney focusing on the women characters in the first 11 books of the Bible",
    status: "proposed",
    addedInEpisode: 67,
  },
  {
    canonical: "Wil Gafney",
    variations: [],
    category: "person",
    status: "rejected",
  },
  {
    canonical: "Jonathan",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Saul's son and David's close friend; their relationship is a prominent theme in 1 Samuel",
    status: "accepted",
  },
  {
    canonical: "Tamar",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Daughter-in-law of Judah, who disguised herself as a prostitute and tricked Judah into fulfilling his levirate duty, from Genesis 38",
    status: "accepted",
  },
  {
    canonical: "Onan",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Son of Judah who spilled his semen on the ground to avoid impregnating his brother's widow Tamar, from Genesis 38",
    status: "accepted",
  },
  {
    canonical: "Shelah",
    variations: ["Shelah's"],
    category: "character",
    description:
      "Youngest son of Judah who Tamar was promised to, but withheld from her",
    status: "proposed",
    addedInEpisode: 68,
  },
  {
    canonical: "Er",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Eldest son of Judah, who was killed by God for being wicked",
    status: "accepted",
  },
  {
    canonical: "Adullamite",
    variations: [],
    category: "people",
    description:
      "Inhabitant of Adullam, a town in the Shephelah region of Judah; Hirah, the friend of Judah, is identified as an Adullamite",
    status: "proposed",
    addedInEpisode: 68,
  },
  {
    canonical: "Ruth",
    variations: [],
    category: "literature",
    llmVerify: true,
    description:
      "Book in the Hebrew Bible that tells the story of Ruth, a Moabite woman, and her relationship with Boaz",
    status: "accepted",
  },
  {
    canonical: "Boaz",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Kinsman of Ruth's deceased husband who marries her and continues the family line; story told in the Book of Ruth",
    status: "accepted",
  },
  {
    canonical: "Genesis 38",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "2 Maccabees",
    variations: ["2nd Maccabees", "Second Maccabees"],
    category: "literature",
    llmVerify: true,
    description:
      "Deuterocanonical book recounting the Maccabean Revolt against the Seleucid Empire",
    status: "accepted",
  },
  {
    canonical: "Aristotle",
    variations: ["Aristotelian"],
    category: "person",
    status: "rejected",
    addedInEpisode: 70,
  },
  {
    canonical: "Bel and the Dragon",
    variations: ["Bel"],
    category: "literature",
    llmVerify: true,
    description:
      "Addition to the Book of Daniel in the Septuagint, featuring stories of Daniel confronting idols and a dragon",
    status: "accepted",
  },
  {
    canonical: "Second Century CE",
    variations: ["100s CE", "100 CE"],
    category: "event",
    status: "rejected",
  },
  {
    canonical: "Habakkuk",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Hebrew prophet, appears briefly in Bel and the Dragon to deliver food to Daniel in the lion's den",
    status: "accepted",
  },
  {
    canonical: "Darius",
    variations: [],
    category: "person",
    description:
      "Several Persian kings named Darius, one mentioned in the Book of Daniel",
    status: "proposed",
    addedInEpisode: 70,
  },
  {
    canonical: "Revelation 20",
    variations: ["Revelation"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Greece",
    variations: ["Greek"],
    category: "place",
    description:
      "Ancient civilization and empire, also referenced in the Book of Daniel and historical accounts.",
    status: "proposed",
    addedInEpisode: 71,
  },
  {
    canonical: "Second Coming",
    variations: ["second coming"],
    category: "theology",
    description:
      "The Christian belief that Jesus Christ will return to Earth at some point in the future.",
    status: "proposed",
    addedInEpisode: 71,
  },
  {
    canonical: "First Thessalonians 4:17",
    variations: ["1 Thessalonians 4:17"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Pre-tribulation",
    variations: ["pre-trib"],
    category: "theology",
    description:
      "Belief that the rapture will occur before the tribulation period.",
    status: "proposed",
    addedInEpisode: 71,
  },
  {
    canonical: "Post-tribulation",
    variations: ["post-trib"],
    category: "theology",
    description:
      "Belief that the rapture will occur after the tribulation period.",
    status: "proposed",
    addedInEpisode: 71,
  },
  {
    canonical: "Scofield Reference Bible",
    variations: ["Scofield Bible"],
    category: "literature",
    description:
      "A popular study Bible with commentary by Cyrus Scofield, which promoted dispensationalism.",
    status: "proposed",
    addedInEpisode: 71,
  },
  {
    canonical: "Naomi",
    variations: ["Naomi's"],
    category: "character",
    llmVerify: true,
    description:
      "The mother-in-law of Ruth in the Book of Ruth, she is a widow who returns to Bethlehem after the death of her husband and sons",
    status: "accepted",
  },
  {
    canonical: "Moab",
    variations: ["Moabite"],
    category: "place",
    llmVerify: true,
    description:
      "An ancient kingdom located east of the Dead Sea, often in conflict with Israel",
    status: "accepted",
  },
  {
    canonical: "Hesed",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "King Sennacherib",
    variations: ["Sennacherib"],
    category: "person",
    llmVerify: true,
    description:
      "King of Assyria from 705 to 681 BCE, known for his military campaigns and building projects",
    status: "accepted",
  },
  {
    canonical: "numbers",
    variations: ["book of numbers"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "ketef hinnom",
    variations: ["ketef hinnom silver scrolls"],
    category: "place",
    description:
      "An archaeological site near Jerusalem where ancient silver amulets with biblical inscriptions were discovered",
    status: "proposed",
    addedInEpisode: 73,
  },
  {
    canonical: "necromancer of endor",
    variations: [],
    category: "character",
    description:
      "A figure in the Book of Samuel who summons the spirit of Samuel for Saul",
    status: "proposed",
    addedInEpisode: 73,
  },
  {
    canonical: "exodus",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Leviticus",
    variations: ["Leviticus'"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 74,
  },
  {
    canonical: "Ezekiel 44",
    variations: ["Ezekiel"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Midianites",
    variations: [],
    category: "people",
    llmVerify: true,
    description:
      "Nomadic people living in Northwest Arabia, appearing in the narratives of Exodus and Judges.",
    status: "accepted",
    addedInEpisode: 74,
  },
  {
    canonical: "pharaoh",
    variations: [],
    category: "character",
    description:
      "Title used for the rulers of ancient Egypt, particularly in the context of the Exodus narrative.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "Aaron",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Moses' brother and spokesman, played a key role in the Exodus narrative.",
    status: "accepted",
  },
  {
    canonical: "signs and wonders",
    variations: [],
    category: "theology",
    description:
      "Miraculous events associated with divine intervention, particularly in the context of the Exodus plagues.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "plagues",
    variations: ["plague"],
    category: "event",
    description:
      "Series of disasters inflicted upon Egypt in the Book of Exodus to persuade Pharaoh to release the Israelites from slavery.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "nil",
    variations: [],
    category: "place",
    description:
      "Major river in Egypt, central to the narrative of the plagues in the Book of Exodus.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "red sea",
    variations: ["sea of reeds", "yam suf"],
    category: "place",
    description:
      "Sea crossed by the Israelites during the Exodus from Egypt, according to the biblical narrative.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "clement vii",
    variations: [],
    category: "person",
    description:
      "Pope during the 14th century, mentioned in the context of a letter about the Shroud of Turin.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "turin",
    variations: ["Torino"],
    category: "place",
    description: "City in northern Italy where the Shroud of Turin is housed.",
    status: "proposed",
    addedInEpisode: 75,
  },
  {
    canonical: "Acts",
    variations: ["Book of Acts"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Malachi",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Melchizedek",
    variations: ["Melchisedek"],
    category: "character",
    llmVerify: true,
    description:
      "A king and priest mentioned in Genesis 14 and Psalm 110, who blessed Abraham",
    status: "accepted",
  },
  {
    canonical: "Sapphira",
    variations: ["Sappheira"],
    category: "character",
    description:
      "Wife of Ananias in Acts 5, who conspired to deceive the apostles about the proceeds of a land sale",
    status: "proposed",
    addedInEpisode: 76,
  },
  {
    canonical: "Levites",
    variations: ["Levite"],
    category: "people",
    description:
      "Members of the tribe of Levi, who served as priests and temple workers in ancient Israel",
    status: "proposed",
    addedInEpisode: 76,
  },
  {
    canonical: "Achan",
    variations: [],
    category: "character",
    description:
      "An Israelite who violated the ban (herem) after the conquest of Jericho, as told in Joshua 7",
    status: "proposed",
    addedInEpisode: 76,
  },
  {
    canonical: "Divination",
    variations: ["divinatory"],
    category: "theology",
    description:
      "The practice of seeking knowledge of the future or the divine will through supernatural means.",
    status: "proposed",
    addedInEpisode: 73,
  },
  {
    canonical: "Apotropaic",
    variations: ["apotropaism"],
    category: "theology",
    description: "Having the power to avert evil influences or bad luck.",
    status: "proposed",
    addedInEpisode: 73,
  },
  {
    canonical: "1 Samuel",
    variations: ["First Samuel"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Numbers 6",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 73,
  },
  {
    canonical: "Ancient Near East",
    variations: [],
    category: "place",
    description:
      "A geographical region encompassing the area of modern-day Middle East",
    status: "proposed",
    addedInEpisode: 73,
  },
  {
    canonical: "Egyptians",
    variations: [],
    category: "people",
    status: "accepted",
    addedInEpisode: 73,
  },
  {
    canonical: "religion",
    variations: ["religio", "religions", "religious"],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "deity",
    variations: ["deities"],
    category: "theology",
    status: "rejected",
    addedInEpisode: 77,
  },
  {
    canonical: "Protestantism",
    variations: ["Protestant"],
    category: "religion",
    llmVerify: true,
    description:
      "A form of Christianity which originated with the Reformation.",
    status: "accepted",
    addedInEpisode: 77,
  },
  {
    canonical: "Catholicism",
    variations: ["Catholic", "Catholic Church"],
    category: "religion",
    status: "accepted",
    addedInEpisode: 77,
  },
  {
    canonical: "Deism",
    variations: ["deist", "deists"],
    category: "religion",
    llmVerify: true,
    description:
      "Belief in the existence of a supreme being, specifically of a creator who does not intervene in the universe.",
    status: "accepted",
    addedInEpisode: 77,
  },
  {
    canonical: "faith",
    variations: ["fide"],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "Christian",
    variations: ["Christians"],
    category: "religion",
    status: "rejected",
  },
  {
    canonical: "United States",
    variations: ["US"],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "christianity",
    variations: ["Christian", "Christians"],
    category: "religion",
    status: "rejected",
  },
  {
    canonical: "Luke 10",
    variations: ["Luke"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Global South",
    variations: ["global south"],
    category: "place",
    status: "rejected",
    addedInEpisode: 78,
  },
  {
    canonical: "Good Samaritan",
    variations: ["Good Samaritan story"],
    category: "character",
    status: "rejected",
    addedInEpisode: 78,
  },
  {
    canonical: "Utah",
    variations: ["Salt Lake City"],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "christian",
    variations: ["Christianity", "Christians"],
    category: "religion",
    description: "Adherent of Christianity",
    status: "proposed",
    addedInEpisode: 79,
  },
  {
    canonical: "The Reformation",
    variations: ["Reformationist", "Reformationism"],
    category: "event",
    llmVerify: true,
    description:
      "16th-century religious and political upheaval that divided Western Christianity and challenged papal authority.",
    status: "accepted",
    addedInEpisode: 79,
  },
  {
    canonical: "evangelicalism",
    variations: ["evangelical", "evangelicals"],
    category: "religion",
    description:
      "A Protestant movement emphasizing personal conversion, biblical authority, and evangelism.",
    status: "proposed",
    addedInEpisode: 79,
  },
  {
    canonical: "orthodoxy",
    variations: ["Orthodoxy"],
    category: "theology",
    description:
      "A set of beliefs or doctrines accepted as true and normative for a community of faith.",
    status: "proposed",
    addedInEpisode: 79,
  },
  {
    canonical: "donald trump",
    variations: ["trump"],
    category: "person",
    status: "rejected",
  },
  {
    canonical: "cs lewis",
    variations: ["lewis"],
    category: "person",
    status: "rejected",
    addedInEpisode: 79,
  },
  {
    canonical: "world war ii",
    variations: ["World War II"],
    category: "event",
    status: "rejected",
  },
  {
    canonical: "omniscience",
    variations: [],
    category: "theology",
    description:
      "The state of knowing everything; a characteristic often attributed to God",
    status: "proposed",
    addedInEpisode: 80,
  },
  {
    canonical: "omnipotence",
    variations: [],
    category: "theology",
    description:
      "The state of being all-powerful; a characteristic often attributed to God",
    status: "proposed",
    addedInEpisode: 80,
  },
  {
    canonical: "omnipresence",
    variations: [],
    category: "theology",
    description:
      "The state of being everywhere at once; a characteristic often attributed to God",
    status: "proposed",
    addedInEpisode: 80,
  },
  {
    canonical: "acts 15",
    variations: ["Acts, chapter 15"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "hebrew bible",
    variations: ["old testament"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "amos",
    variations: ["Book of Amos"],
    category: "character",
    status: "rejected",
  },
  {
    canonical: "Rev Karla Kamstra",
    variations: ["Karla", "@RevKarla"],
    category: "person",
    status: "rejected",
    addedInEpisode: 82,
  },
  {
    canonical: "patriarchy",
    variations: [],
    category: "theology",
    status: "rejected",
    addedInEpisode: 82,
  },
  {
    canonical: "Kentucky",
    variations: [],
    category: "place",
    status: "rejected",
    addedInEpisode: 82,
  },
  {
    canonical: "psalm",
    variations: ["psalms", "psalmist"],
    category: "literature",
    description:
      "A sacred song or hymn, especially one of those contained in the biblical Book of Psalms",
    status: "proposed",
    addedInEpisode: 83,
  },
  {
    canonical: "mark",
    variations: ["Gospel of Mark"],
    category: "literature",
    description:
      "The second book of the New Testament, one of the Synoptic Gospels",
    status: "proposed",
    addedInEpisode: 83,
  },
  {
    canonical: "elisha",
    variations: ["elias"],
    category: "character",
    description: "A prophet in the Hebrew Bible, successor to Elijah",
    status: "proposed",
    addedInEpisode: 83,
  },
  {
    canonical: "church of the holy sepulcher",
    variations: ["holy sepulcher"],
    category: "place",
    description:
      "A church located in the Christian Quarter of the Old City of Jerusalem, considered one of the holiest sites in Christianity",
    status: "proposed",
    addedInEpisode: 83,
  },
  {
    canonical: "garden tomb",
    variations: ["garden tomb association", "Gordon's Calvary"],
    category: "place",
    description:
      "A rock-cut tomb in Jerusalem, proposed by some as the site of Jesus' burial and resurrection",
    status: "proposed",
    addedInEpisode: 83,
  },
  {
    canonical: "Constantine",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Roman Emperor who legalized Christianity in the 4th century CE",
    status: "accepted",
    addedInEpisode: 83,
  },
  {
    canonical: "new testament",
    variations: ["nt"],
    category: "literature",
    description:
      "The second major part of the Christian biblical canon, comprising 27 books",
    status: "proposed",
    addedInEpisode: 84,
  },
  {
    canonical: "daimon",
    variations: ["daimons"],
    category: "theology",
    description:
      "A Greek term for a divine power or spirit, not necessarily evil, but influential",
    status: "proposed",
    addedInEpisode: 84,
  },
  {
    canonical: "daimonia",
    variations: ["daimoniois"],
    category: "theology",
    description:
      "Plural form of 'daimonion' in Greek, referring to a multitude of divine powers or spirits",
    status: "proposed",
    addedInEpisode: 84,
  },
  {
    canonical: "jubilees",
    variations: [],
    category: "literature",
    description:
      "An ancient Jewish religious work of 50 chapters, considered canonical by Ethiopian Orthodox Church",
    status: "proposed",
    addedInEpisode: 84,
  },
  {
    canonical: "Beelzebul",
    variations: ["beelzebub"],
    category: "character",
    llmVerify: true,
    description:
      "A name for the devil, possibly derived from Baal-Zebub, meaning 'Lord of the Flies'",
    status: "accepted",
    addedInEpisode: 84,
  },
  {
    canonical: "Logan Williams",
    variations: ["Logan"],
    category: "person",
    description:
      "Kirby Laing Research Fellow in New Testament at Aberdeen in Scotland, guest on Data Over Dogma",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "New Testament Studies",
    variations: [],
    category: "literature",
    description:
      "Academic journal for biblical scholarship, where Logan Williams published his article",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "Scotland",
    variations: [],
    category: "place",
    description:
      "Country in northwest Europe; Logan Williams is a Research Fellow in Aberdeen, Scotland",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "Aberdeen",
    variations: [],
    category: "place",
    description: "City in Scotland where Logan Williams is a Research Fellow",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "kosher laws",
    variations: ["kashrut"],
    category: "theology",
    description:
      "Dietary rules in Judaism concerning which foods may be eaten and how they must be prepared",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "Mark 7",
    variations: ["Mark, chapter seven"],
    category: "literature",
    description:
      "Chapter 7 of the Gospel of Mark, discusses purity laws and traditions of the elders",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "purity laws",
    variations: ["purity ideas"],
    category: "theology",
    description:
      "Jewish regulations concerning ritual purity and impurity, involve practices of cleansing and separation",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "Matt Thiessen",
    variations: ["Thiessen"],
    category: "person",
    description: "Biblical scholar who wrote 'Jesus and the Forces of Death'",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "ritual impurity",
    variations: ["impurity"],
    category: "theology",
    description:
      "Religious concept of uncleanness that can be transmitted and ameliorated through ritual actions",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "Leviticus 11",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 85,
  },
  {
    canonical: "Westcott and Hort",
    variations: ["Hort", "Westcott"],
    category: "person",
    description:
      "Two 19th-century biblical scholars who produced a critical edition of the Greek New Testament",
    status: "proposed",
    addedInEpisode: 85,
  },
  {
    canonical: "Horus",
    variations: ["Ra Horakhty"],
    category: "character",
    description:
      "Egyptian sky god, sometimes conflated with Ra as Ra Horakhty (sun god)",
    status: "proposed",
    addedInEpisode: 86,
  },
  {
    canonical: "Dionysus",
    variations: ["Dionysian"],
    category: "character",
    description: "Greek god of wine, fertility, theatre, and religious ecstasy",
    status: "proposed",
    addedInEpisode: 86,
  },
  {
    canonical: "Flavius Josephus",
    variations: ["Josephus", "Flavius"],
    category: "person",
    llmVerify: true,
    description:
      "Jewish historian who lived in the 1st century CE and wrote about the history of the Jewish people and the Jewish-Roman War",
    status: "accepted",
    addedInEpisode: 86,
  },
  {
    canonical: "Winter solstice",
    variations: ["solstice"],
    category: "event",
    description:
      "The day of the year with the fewest hours of sunlight, marking the sun's southernmost point",
    status: "proposed",
    addedInEpisode: 86,
  },
  {
    canonical: "Mithra",
    variations: ["Mithras"],
    category: "character",
    description: "God of Zoroastrianism, later popular in the Roman Empire",
    status: "proposed",
    addedInEpisode: 86,
  },
  {
    canonical: "Krishna",
    variations: [],
    category: "character",
    description: "Major deity in Hinduism",
    status: "proposed",
    addedInEpisode: 86,
  },
  {
    canonical: "Attis",
    variations: [],
    category: "character",
    description: "Phrygian consort of Cybele",
    status: "proposed",
    addedInEpisode: 86,
  },
  {
    canonical: "Nazareth",
    variations: ["Nazarene"],
    category: "place",
    description:
      "Town in Galilee where Jesus grew up, often associated with his identity",
    status: "proposed",
    addedInEpisode: 87,
  },
  {
    canonical: "Magi",
    variations: ["Magi's"],
    category: "character",
    description:
      "Wise men who visited Jesus after his birth, bringing gifts and paying homage",
    status: "proposed",
    addedInEpisode: 87,
  },
  {
    canonical: "Shepherds",
    variations: [],
    category: "character",
    description:
      "Figures who were visited by angels and told of Jesus' birth in the Gospel of Luke",
    status: "proposed",
    addedInEpisode: 87,
  },
  {
    canonical: "Second Kings",
    variations: ["2 Kings", "Kings"],
    category: "literature",
    description:
      "Book in the Hebrew Bible/Old Testament that describes the history of the Israelite kingdoms",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "Chronicles",
    variations: [],
    category: "literature",
    description:
      "Books in the Hebrew Bible retelling the history of ancient Israel and Judah",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "Book of the Law",
    variations: [],
    category: "literature",
    description:
      "A scroll discovered in the Temple during Josiah's reign, traditionally identified with Deuteronomy",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "Wadi Kidron",
    variations: [],
    category: "place",
    description:
      "Valley east of Jerusalem, mentioned in connection with Josiah's reforms",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "People of Judah",
    variations: [],
    category: "people",
    description: "Inhabitants of the kingdom of Judah",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "First Temple period",
    variations: [],
    category: "event",
    description:
      "The time period in Israelite history from the building of Solomon's Temple until its destruction by the Babylonians",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "Deuteronomistic",
    variations: [],
    category: "scholarship",
    description:
      "Relating to the Deuteronomistic History, a scholarly construct describing a series of books sharing a common theological perspective",
    status: "proposed",
    addedInEpisode: 88,
  },
  {
    canonical: "Proverbs",
    variations: [],
    category: "literature",
    description:
      "A book of wisdom literature in the Hebrew Bible, traditionally attributed to King Solomon",
    status: "proposed",
    addedInEpisode: 89,
  },
  {
    canonical: "wisdom",
    variations: [],
    category: "theology",
    description:
      "The quality of having experience, knowledge, and good judgment; the ability to apply knowledge.",
    status: "proposed",
    addedInEpisode: 89,
  },
  {
    canonical: "first corinthians",
    variations: ["1 corinthians", "first corinthians 5", "1 corinthians 5"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 89,
  },
  {
    canonical: "flesh",
    variations: [],
    category: "theology",
    description: "The physical body, often contrasted with the spirit or soul.",
    status: "proposed",
    addedInEpisode: 89,
  },
  {
    canonical: "universalism",
    variations: [],
    category: "theology",
    description:
      "The theological belief that all people will ultimately be saved.",
    status: "proposed",
    addedInEpisode: 89,
  },
  {
    canonical: "eisegesis",
    variations: ["eisegesis'"],
    category: "scholarship",
    description:
      "The interpretation of a text by reading one's own ideas into it",
    status: "proposed",
    addedInEpisode: 90,
  },
  {
    canonical: "exegesis",
    variations: ["exegesis'"],
    category: "scholarship",
    description:
      "Critical explanation or interpretation of a text, especially of scripture.",
    status: "proposed",
    addedInEpisode: 90,
  },
  {
    canonical: "genesis 3",
    variations: ["Genesis 3"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 90,
  },
  {
    canonical: "adam and eve",
    variations: ["Adam and Eve"],
    category: "character",
    description: "The first man and woman in the Bible, according to Genesis.",
    status: "proposed",
    addedInEpisode: 90,
  },
  {
    canonical: "abel",
    variations: ["Abel"],
    category: "character",
    description:
      "The son of Adam and Eve who was murdered by his brother Cain.",
    status: "proposed",
    addedInEpisode: 90,
  },
  {
    canonical: "April Ajoy",
    variations: ["Ajoy"],
    category: "person",
    status: "rejected",
    addedInEpisode: 91,
  },
  {
    canonical: "satanic",
    variations: ["Satan"],
    category: "theology",
    description: "Related to Satan or Satanism; considered evil or demonic",
    status: "proposed",
    addedInEpisode: 91,
  },
  {
    canonical: "America",
    variations: ["American"],
    category: "place",
    status: "rejected",
    addedInEpisode: 91,
  },
  {
    canonical: "Curse of Cain",
    variations: [],
    category: "theology",
    description:
      "The mark or curse placed on Cain after he murdered Abel, often misinterpreted as dark skin",
    status: "proposed",
    addedInEpisode: 92,
  },
  {
    canonical: "Susanna",
    variations: [],
    category: "character",
    description:
      "Main character in the Book of Susanna, falsely accused of adultery by two elders",
    status: "proposed",
    caseSensitive: true,
    addedInEpisode: 92,
  },
  {
    canonical: "Apocrypha",
    variations: ["Apocryphal"],
    category: "literature",
    llmVerify: true,
    description:
      "Biblical books and passages considered canonical by some Christians but not by Protestants or Jews",
    status: "accepted",
    addedInEpisode: 92,
  },
  {
    canonical: "Curse of Ham",
    variations: [],
    category: "theology",
    description:
      "Misinterpretation of the curse placed on Canaan, son of Ham, used to justify slavery",
    status: "proposed",
    addedInEpisode: 92,
  },
  {
    canonical: "Joachim",
    variations: [],
    category: "character",
    description: "Husband of Susanna in the Book of Susanna.",
    status: "proposed",
    addedInEpisode: 92,
  },
  {
    canonical: "Exodus 21",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 93,
  },
  {
    canonical: "Hammurabi's law",
    variations: [],
    category: "literature",
    description:
      "A Babylonian legal code of ancient Mesopotamia, dating back to c. 1754 BC, containing laws and punishments.",
    status: "proposed",
    addedInEpisode: 93,
  },
  {
    canonical: "Eglon",
    variations: [],
    category: "character",
    description:
      "King of Moab who oppressed Israel, assassinated by Ehud in the Book of Judges.",
    status: "proposed",
    addedInEpisode: 93,
  },
  {
    canonical: "David Wright",
    variations: [],
    category: "person",
    description:
      "Biblical scholar and author known for his work on the relationship between biblical law and ancient Near Eastern legal codes.",
    status: "proposed",
    addedInEpisode: 93,
  },
  {
    canonical: "People",
    variations: [],
    category: "people",
    status: "rejected",
    addedInEpisode: 93,
  },
  {
    canonical: "Theological",
    variations: [],
    category: "theology",
    status: "rejected",
    addedInEpisode: 93,
  },
  {
    canonical: "Cathars",
    variations: ["Catharism"],
    category: "religion",
    description:
      "Members of a Christian dualist movement that flourished in Southern Europe during the 12th-14th centuries.",
    status: "proposed",
    addedInEpisode: 94,
  },
  {
    canonical: "Arius",
    variations: ["Arian"],
    category: "person",
    llmVerify: true,
    description:
      "A Christian presbyter from Alexandria whose teachings about the nature of Christ were condemned as heresy at the Council of Nicaea",
    status: "accepted",
    addedInEpisode: 94,
  },
  {
    canonical: "Jericho",
    variations: ["walls of Jericho"],
    category: "place",
    description:
      "Ancient city in the Jordan River Valley, famous for its walls being toppled in the Book of Joshua.",
    status: "proposed",
    addedInEpisode: 95,
  },
  {
    canonical: "Genesis 9",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 95,
  },
  {
    canonical: "Speaker Johnson",
    variations: [],
    category: "person",
    description:
      "Mike Johnson, current Speaker of the House of Representatives",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "speaker of the house",
    variations: [],
    category: "person",
    description:
      "The presiding officer of the House of Representatives, currently Mike Johnson.",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "sadducees",
    variations: [],
    category: "people",
    description:
      "A Jewish sect during the Second Temple period, associated with the priestly aristocracy and Temple administration.",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "romans 13",
    variations: [],
    category: "literature",
    description:
      "Chapter 13 of the Epistle to the Romans, discussing submission to governing authorities.",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "Turkey",
    variations: ["Turkish"],
    category: "place",
    description:
      "A country in Eurasia, site of the Durupinar formation, which Ron Wyatt claimed was Noah's Ark.",
    status: "proposed",
    addedInEpisode: 97,
  },
  {
    canonical: "Ron Wyatt",
    variations: ["Wyatt"],
    category: "person",
    description:
      "An amateur archaeologist known for his claims about finding biblical artifacts",
    status: "proposed",
    addedInEpisode: 97,
  },
  {
    canonical: "Durupinar site",
    variations: ["Durupinar"],
    category: "place",
    description:
      "A geological formation in Turkey that some claim is the remains of Noah's Ark.",
    status: "proposed",
    addedInEpisode: 97,
  },
  {
    canonical: "Saudi Arabia",
    variations: ["Saudi Arabian"],
    category: "place",
    description:
      "A country in the Middle East, location of Jabal Maqla and Jebel al-Lawz, mountains proposed as Mount Sinai.",
    status: "proposed",
    addedInEpisode: 97,
  },
  {
    canonical: "King Solomon",
    variations: ["Solomon"],
    category: "character",
    description:
      "A biblical king of Israel, son of David, known for his wisdom and building the First Temple in Jerusalem.",
    status: "proposed",
    addedInEpisode: 97,
  },
  {
    canonical: "Mount Sinai",
    variations: ["Mounts Sinai"],
    category: "place",
    description:
      "The mountain where Moses received the Ten Commandments from God, according to the Book of Exodus.",
    status: "proposed",
    addedInEpisode: 97,
  },
  {
    canonical: "Hosea",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 97,
  },
  {
    canonical: "hades",
    variations: [],
    category: "theology",
    description:
      "In Greek mythology and the New Testament, Hades is the underworld, the abode of the dead.",
    status: "proposed",
    addedInEpisode: 98,
  },
  {
    canonical: "Proto-Gospel of James",
    variations: ["Protevangelium of James"],
    category: "literature",
    description:
      "Also known as the Protevangelium of James, a 2nd-century infancy gospel expanding on the birth and early life of Mary",
    status: "proposed",
    addedInEpisode: 99,
  },
  {
    canonical: "Galatians",
    variations: ["Galatians 1"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 99,
  },
  {
    canonical: "Tanakh",
    variations: [],
    category: "literature",
    description:
      "The Hebrew Bible consisting of the Torah (Law), Nevi'im (Prophets), and Ketuvim (Writings)",
    status: "proposed",
    addedInEpisode: 99,
  },
  {
    canonical: "Philemon",
    variations: ["Philemon 1", "Philemon's"],
    category: "literature",
    description:
      "A short Pauline epistle in the New Testament, addressed to Philemon regarding his slave Onesimus",
    status: "proposed",
    addedInEpisode: 100,
  },
  {
    canonical: "Onesimus",
    variations: ["Onesimus'"],
    category: "character",
    description:
      "A slave belonging to Philemon, mentioned in the New Testament epistle of the same name; Paul intercedes on his behalf",
    status: "proposed",
    addedInEpisode: 100,
  },
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
export function getAllSearchableTerms(
  vocab: TagDefinition[],
): Map<string, string> {
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
