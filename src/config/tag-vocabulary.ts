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
  "miscellaneous",
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
      episodes?: number[]; // Episode numbers where this tag appears
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
      episodes?: number[]; // Episode numbers where this tag appears
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
  {
    canonical: "Abraham",
    variations: ["Abram", "Abraham's"],
    category: "character",
    status: "accepted",
    episodes: [
      1, 2, 3, 4, 6, 15, 16, 19, 20, 21, 26, 28, 29, 36, 42, 44, 46, 55, 56, 58,
      59, 63, 64, 69, 76, 81, 92, 93, 95, 98, 104, 108, 111, 115, 118, 121, 129,
      133, 137, 139,
    ],
  },
  {
    canonical: "Isaac",
    variations: ["Isaac's"],
    category: "character",
    status: "accepted",
    episodes: [
      1, 2, 13, 21, 23, 28, 33, 36, 42, 59, 62, 63, 64, 75, 104, 111, 118, 121,
      124, 126,
    ],
  },
  {
    canonical: "Moses",
    variations: ["Moshe", "Moses'", "Moses's"],
    category: "character",
    status: "accepted",
    episodes: [
      1, 7, 11, 14, 16, 17, 18, 20, 21, 22, 24, 25, 28, 33, 36, 38, 39, 42, 45,
      46, 54, 55, 56, 58, 59, 60, 63, 66, 67, 69, 75, 84, 85, 90, 93, 95, 97,
      99, 100, 103, 104, 105, 108, 109, 111, 112, 115, 116, 117, 120, 122, 123,
      126, 127, 129, 130, 133, 134, 137, 138,
    ],
  },
  {
    canonical: "Adam",
    variations: ["Adam's"],
    category: "character",
    status: "accepted",
    episodes: [
      1, 2, 3, 10, 14, 18, 20, 22, 27, 29, 34, 37, 41, 52, 54, 56, 58, 60, 61,
      62, 78, 80, 90, 92, 104, 107, 112, 116, 120, 125, 131, 135, 137, 139,
    ],
  },
  {
    canonical: "Eve",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [
      1, 3, 10, 14, 18, 22, 29, 41, 52, 56, 57, 60, 62, 78, 80, 81, 90, 92, 95,
      109, 116, 120, 135, 137, 139,
    ],
  },
  {
    canonical: "Paul",
    variations: ["Saul"],
    category: "character",
    llmVerify: true,
    description:
      "Author of new testament books, lived in the first century, is supposed to have seen Jesus on the road to Damascus",
    status: "accepted",
    episodes: [
      1, 4, 6, 10, 12, 15, 16, 17, 19, 26, 30, 31, 32, 33, 35, 39, 41, 42, 44,
      48, 49, 50, 52, 54, 57, 59, 60, 64, 69, 70, 71, 73, 76, 78, 80, 86, 87,
      89, 91, 94, 96, 99, 100, 101, 104, 106, 107, 108, 110, 113, 114, 116, 120,
      122, 123, 124, 126, 128, 130, 132, 133, 134, 135, 136, 137, 138, 139, 140,
      141, 142, 144, 145, 146, 147, 148, 150, 151, 153, 156, 157,
    ],
  },
  {
    canonical: "Jephthah",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [2, 7, 36, 63, 64, 111, 121],
  },
  {
    canonical: "John of Patmos",
    variations: ["John the Revelator"],
    category: "character",
    status: "accepted",
    episodes: [4, 9, 39, 99, 119],
  },
  {
    canonical: "Hagar",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [3, 28, 55, 108, 129, 133],
  },
  {
    canonical: "Ishmael",
    variations: ["Ishmaelites"],
    category: "character",
    status: "accepted",
    episodes: [3, 18, 20, 22, 35, 74, 118],
  },
  {
    canonical: "Peter",
    variations: ["Simon Peter"],
    category: "character",
    status: "accepted",
    episodes: [
      4, 6, 12, 13, 16, 27, 28, 29, 35, 37, 41, 43, 45, 48, 49, 50, 52, 54, 55,
      69, 72, 76, 77, 79, 83, 84, 86, 94, 98, 99, 102, 104, 112, 113, 116, 119,
      124, 131, 132, 136,
    ],
  },
  {
    canonical: "James",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "James the brother of Jesus, not simply a reference to the epistle of James or a chapter and verse in James",
    status: "accepted",
    episodes: [
      1, 4, 6, 8, 9, 11, 12, 13, 16, 17, 18, 20, 22, 25, 26, 33, 35, 38, 54, 80,
      86, 94, 99, 104,
    ],
  },
  {
    canonical: "John",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "John the Apostle and Evangelist, not simply a reference to the gospel of John or a chapter and verse in John",
    status: "accepted",
    episodes: [83, 86, 98, 99, 100, 102, 107, 110, 112, 119, 128, 137],
  },
  {
    canonical: "Luke",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Luke the Apostle and Evangelist, not simply a reference to the gospel of Luke or a chapter and verse in Luke",
    status: "accepted",
    episodes: [
      10, 11, 12, 16, 17, 18, 19, 23, 25, 32, 35, 38, 43, 46, 48, 49, 54, 60,
      69, 80, 83, 84, 97, 99, 100, 112, 131, 132, 133, 137,
    ],
  },
  {
    canonical: "Matthew",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Matthew the Apostle and Evangelist, not simply a reference to the gospel of matthew or a chapter and verse in Matthew",
    status: "accepted",
    episodes: [
      4, 6, 10, 11, 12, 15, 16, 17, 19, 25, 26, 32, 35, 37, 38, 41, 43, 86, 96,
      99, 110, 112, 128,
    ],
  },
  {
    canonical: "Noah",
    variations: ["Noah's"],
    category: "character",
    status: "accepted",
    episodes: [
      3, 20, 22, 27, 41, 56, 62, 78, 81, 92, 93, 95, 97, 98, 101, 116, 122, 124,
      127, 131,
    ],
  },
  {
    canonical: "Jeremiah",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [
      2, 7, 11, 15, 20, 23, 32, 33, 34, 36, 45, 56, 92, 94, 113, 119, 120, 126,
      127, 130, 133,
    ],
  },
  {
    canonical: "Mary Magdalene",
    variations: ["Mary"],
    category: "character",
    status: "accepted",
    episodes: [
      5, 12, 14, 16, 23, 28, 37, 38, 48, 49, 50, 52, 54, 55, 66, 72, 84, 87, 91,
      94, 99, 123, 127, 128, 133, 136,
    ],
  },
  {
    canonical: "Lydia",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A woman mentioned in the New Testament, especially in Acts 16, associated with the early Jesus movement.",
    status: "accepted",
    episodes: [12, 153],
  },
  {
    canonical: "Balaam",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [18, 29, 39, 46, 84, 123],
  },
  {
    canonical: "Daniel",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Daniel from the Book of Daniel",
    status: "accepted",
    episodes: [
      4, 7, 11, 15, 19, 20, 28, 32, 34, 44, 45, 50, 58, 62, 70, 71, 92, 115,
      118, 119, 123, 130, 132, 133, 134, 135, 137, 143, 147, 152, 157, 158,
    ],
  },
  {
    canonical: "Enoch",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [
      15, 20, 27, 28, 38, 45, 57, 62, 84, 90, 95, 98, 104, 123, 124, 131,
    ],
  },
  {
    canonical: "Jerusalem",
    variations: ["New Jerusalem"],
    category: "place",
    status: "accepted",
    episodes: [
      2, 4, 6, 7, 8, 10, 11, 12, 13, 15, 21, 24, 27, 29, 32, 33, 34, 35, 36, 37,
      38, 39, 40, 43, 45, 46, 48, 50, 54, 55, 56, 57, 60, 61, 64, 65, 66, 67,
      69, 72, 73, 76, 78, 80, 83, 84, 86, 87, 88, 90, 93, 95, 97, 98, 99, 100,
      101, 102, 107, 112, 113, 115, 116, 117, 118, 119, 126, 127, 128, 129, 130,
      133, 135, 137, 139,
    ],
  },
  {
    canonical: "Sodom",
    variations: ["Sodom and Gomorrah"],
    category: "place",
    status: "accepted",
    episodes: [3, 10, 27, 28, 46, 54, 93, 104, 114, 124, 129, 137],
  },
  {
    canonical: "Gomorrah",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [129],
  },
  {
    canonical: "Babylon",
    variations: ["Babylonian"],
    category: "place",
    status: "accepted",
    episodes: [
      1, 2, 4, 7, 11, 13, 18, 20, 21, 22, 24, 28, 32, 34, 36, 37, 43, 45, 46,
      56, 61, 67, 70, 71, 72, 73, 81, 88, 92, 97, 99, 104, 105, 112, 113, 115,
      117, 118, 120, 126, 127, 130, 133, 135,
    ],
  },
  {
    canonical: "Ugarit",
    variations: ["Ugaritic"],
    category: "place",
    status: "accepted",
    episodes: [
      1, 2, 7, 18, 21, 28, 39, 45, 56, 63, 66, 76, 84, 90, 92, 115, 124, 125,
      130, 135,
    ],
  },
  {
    canonical: "Elephantine",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "an island in the Nile river that was home to a Jewish community in antiquity",
    status: "accepted",
    episodes: [2, 59, 66, 75, 117],
  },
  {
    canonical: "Carthage",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [2, 21, 73, 119],
  },
  {
    canonical: "Dead Sea",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [3, 7, 13, 18, 34, 45, 55, 58, 62, 95, 97, 122, 125, 137],
  },
  {
    canonical: "Mount Gerizim",
    variations: ["Gerizim"],
    category: "place",
    status: "accepted",
    episodes: [3, 33, 45],
  },
  {
    canonical: "Mount Ebal",
    variations: ["Ebal"],
    category: "place",
    status: "accepted",
    episodes: [3, 45],
  },
  {
    canonical: "Torah",
    variations: ["Tora", "Torrah"],
    category: "literature",
    status: "accepted",
    episodes: [
      11, 14, 19, 24, 36, 40, 45, 56, 61, 71, 73, 74, 85, 99, 100, 105, 117,
      123, 130,
    ],
  },
  {
    canonical: "Septuagint",
    variations: ["LXX", "Septuigent"],
    category: "literature",
    status: "accepted",
    episodes: [
      7, 10, 11, 16, 18, 19, 20, 25, 27, 28, 31, 35, 38, 39, 42, 45, 46, 48, 54,
      57, 58, 59, 62, 67, 70, 80, 81, 83, 84, 85, 87, 92, 94, 99, 100, 104, 118,
      122, 124, 125, 126, 128, 129, 130, 134, 135, 137, 139, 140, 141, 142, 144,
      147, 150, 151, 153, 155, 158,
    ],
  },
  {
    canonical: "Deuteronomy",
    variations: [],
    category: "literature",
    status: "accepted",
    episodes: [
      1, 2, 3, 7, 9, 11, 13, 19, 21, 22, 25, 28, 33, 36, 39, 41, 42, 45, 46, 55,
      58, 59, 62, 65, 68, 71, 73, 74, 76, 84, 85, 87, 88, 92, 93, 97, 99, 102,
      104, 106, 108, 110, 113, 115, 116, 117, 119, 123, 124, 125, 126, 129, 133,
      134,
    ],
  },
  {
    canonical: "Dead Sea Scrolls",
    variations: [],
    category: "literature",
    status: "accepted",
    episodes: [
      1, 3, 6, 7, 11, 14, 18, 19, 20, 25, 34, 37, 45, 51, 55, 58, 61, 62, 73,
      83, 99, 100, 104, 110, 122, 123, 125, 129, 137, 139,
    ],
  },
  {
    canonical: "King James Bible",
    variations: ["KJV", "King James Version"],
    category: "literature",
    status: "accepted",
    episodes: [
      1, 7, 11, 12, 14, 15, 16, 17, 18, 20, 21, 22, 23, 27, 29, 31, 32, 34, 35,
      37, 40, 41, 42, 46, 50, 52, 53, 55, 57, 58, 59, 60, 62, 63, 65, 66, 71,
      72, 82, 83, 84, 85, 88, 93, 95, 97, 98, 99, 101, 102, 104, 106, 110, 113,
      114, 115, 117, 122, 125, 126, 127, 129, 131, 132, 133, 134, 141, 142, 146,
      151, 154, 155, 157,
    ],
  },
  {
    canonical: "Masoretic Text",
    variations: [],
    category: "literature",
    status: "accepted",
    episodes: [
      2, 7, 11, 20, 21, 45, 58, 66, 80, 83, 99, 104, 122, 125, 132, 134, 150,
      151, 152, 155,
    ],
  },
  {
    canonical: "YHWH",
    variations: ["Yahweh", "Adonai"],
    category: "character",
    status: "accepted",
    episodes: [
      1, 2, 3, 4, 7, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 25, 27, 28, 29,
      30, 32, 33, 34, 35, 36, 39, 40, 41, 42, 43, 44, 45, 46, 52, 53, 54, 55,
      57, 58, 59, 60, 62, 63, 64, 65, 66, 68, 69, 70, 71, 72, 73, 74, 75, 76,
      80, 81, 82, 85, 87, 88, 90, 94, 95, 102, 104, 105, 106, 111, 113, 114,
      115, 116, 117, 118, 120, 121, 123, 124, 126, 127, 129, 133, 135, 137, 139,
    ],
  },
  {
    canonical: "Asherah",
    variations: ["Athirat", "Atiratu"],
    category: "character",
    status: "accepted",
    episodes: [1, 2, 7, 14, 33, 66, 73, 88, 117, 123, 124, 126, 127, 129, 133],
  },
  {
    canonical: "Baal",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [
      1, 2, 5, 7, 13, 18, 21, 28, 32, 33, 40, 44, 53, 59, 66, 70, 81, 84, 86,
      88, 104, 115, 123, 126, 129, 133, 135,
    ],
  },
  {
    canonical: "Trinity",
    variations: [],
    category: "theology",
    status: "accepted",
    episodes: [
      2, 3, 4, 5, 6, 8, 26, 34, 40, 42, 45, 53, 58, 69, 79, 104, 124, 128, 148,
      149,
    ],
  },
  {
    canonical: "divine council",
    variations: ["heavenly household"],
    category: "theology",
    status: "accepted",
    episodes: [1, 2, 3, 7, 18, 19, 28, 57, 58, 59, 81, 88, 105, 118, 120, 124],
  },
  {
    canonical: "Rapture",
    variations: [],
    category: "theology",
    status: "accepted",
    episodes: [4, 26, 27, 32, 34, 54, 71, 82, 84, 91, 119],
  },
  {
    canonical: "Armageddon",
    variations: [],
    category: "theology",
    status: "accepted",
    episodes: [4, 119],
  },
  {
    canonical: "Molek",
    variations: ["Molech", "Moloch", "mulk"],
    category: "character",
    status: "accepted",
    episodes: [2, 21, 28, 81, 132, 139],
  },
  {
    canonical: "child sacrifice",
    variations: ["firstborn sacrifice"],
    category: "theology",
    status: "accepted",
    episodes: [2, 15, 21, 27, 93, 132],
  },
  {
    canonical: "Circumcision",
    variations: ["circumcise"],
    category: "theology",
    status: "accepted",
    episodes: [26, 31, 33, 54, 61, 62, 85, 111, 112, 125, 146],
  },
  {
    canonical: "Easter",
    variations: [],
    category: "theology",
    status: "accepted",
    episodes: [5, 11, 34, 37, 48, 50, 69, 106, 109, 119],
  },
  {
    canonical: "Hell",
    variations: ["Gehenna", "Sheol"],
    category: "place",
    status: "accepted",
    episodes: [
      8, 9, 15, 17, 19, 25, 27, 31, 32, 39, 40, 41, 43, 50, 52, 54, 62, 63, 67,
      71, 73, 74, 83, 84, 85, 86, 87, 89, 90, 91, 93, 94, 98, 103, 105, 106,
      108, 109, 112, 114, 117, 120, 122, 123, 124, 125, 126, 133, 136, 137, 140,
      144, 147, 148, 154, 156, 157, 158,
    ],
  },
  {
    canonical: "Sheol",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [15, 67, 84, 89, 98, 108, 120],
  },
  {
    canonical: "Satan",
    variations: ["devil"],
    category: "theology",
    status: "accepted",
    episodes: [
      1, 9, 15, 17, 18, 27, 28, 29, 32, 33, 37, 39, 50, 53, 54, 62, 66, 68, 73,
      76, 84, 89, 90, 91, 94, 98, 99, 113, 114, 120, 122, 124, 125, 130, 132,
      133, 137, 142, 145, 147, 148, 150, 152, 158,
    ],
  },
  {
    canonical: "Monotheism",
    variations: ["monotheistic"],
    category: "theology",
    status: "accepted",
    episodes: [
      1, 5, 7, 9, 13, 19, 36, 42, 58, 59, 70, 77, 86, 104, 117, 126, 149,
    ],
  },
  {
    canonical: "Univocality",
    variations: ["univocal", "non-univocal", "non-univocality"],
    category: "scholarship",
    status: "accepted",
    episodes: [
      4, 6, 10, 15, 23, 29, 32, 33, 40, 44, 46, 52, 55, 57, 58, 60, 71, 74, 80,
      89, 90, 101, 104, 108, 110, 113, 117, 118, 122, 132, 133, 135, 137,
    ],
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
    episodes: [1, 8, 12],
  },
  {
    canonical: "provenance",
    variations: ["provenience", "unprovenanced"],
    category: "scholarship",
    status: "accepted",
    episodes: [3, 42, 104],
  },
  {
    canonical: "etiology",
    variations: ["etiological"],
    category: "scholarship",
    status: "accepted",
    episodes: [
      3, 10, 14, 15, 27, 38, 41, 44, 73, 81, 84, 90, 111, 116, 120, 121, 139,
    ],
  },
  {
    canonical: "theophany",
    variations: ["ish theophany"],
    category: "scholarship",
    status: "accepted",
    episodes: [2, 3, 43, 120],
  },
  {
    canonical: "cognitive dissonance",
    variations: [],
    category: "scholarship",
    status: "accepted",
    episodes: [4, 78, 89, 91, 132],
  },
  {
    canonical: "epigraphy",
    variations: ["epigraphers"],
    category: "scholarship",
    status: "accepted",
    episodes: [3, 13, 107],
  },
  {
    canonical: "forgery",
    variations: ["forged", "fake artifacts"],
    category: "scholarship",
    status: "accepted",
    episodes: [3, 26, 56, 86, 97, 104, 128],
  },
  {
    canonical: "historical criticism",
    variations: ["historical-critical method"],
    category: "scholarship",
    status: "accepted",
    episodes: [101],
  },
  {
    canonical: "futurist interpretation",
    variations: ["futurism"],
    category: "scholarship",
    status: "accepted",
    episodes: [4, 32, 119],
  },
  {
    canonical: "Judah",
    variations: ["Judahites", "Judahite"],
    category: "place",
    status: "accepted",
    episodes: [
      1, 2, 7, 11, 13, 14, 18, 24, 29, 33, 36, 38, 39, 40, 43, 46, 53, 55, 56,
      57, 61, 63, 64, 65, 67, 68, 71, 72, 73, 74, 76, 80, 81, 87, 88, 92, 97,
      102, 103, 104, 105, 108, 111, 112, 113, 114, 115, 116, 117, 118, 120, 121,
      122, 123, 125, 126, 130, 133, 135, 139,
    ],
  },
  {
    canonical: "inerrancy",
    variations: ["inerrant"],
    category: "scholarship",
    status: "accepted",
    episodes: [
      4, 6, 15, 29, 34, 45, 46, 53, 55, 60, 61, 79, 89, 90, 101, 104, 113, 117,
      118, 119, 137,
    ],
  },
  {
    canonical: "David",
    variations: ["King David"],
    category: "character",
    llmVerify: true,
    description: "King David of Israel",
    status: "accepted",
    episodes: [
      3, 6, 7, 10, 13, 15, 18, 26, 30, 36, 37, 40, 41, 46, 48, 52, 54, 55, 56,
      64, 66, 67, 69, 72, 78, 80, 83, 84, 86, 87, 88, 93, 96, 105, 110, 111,
      116, 118, 121, 123, 125, 127, 129, 132, 133, 139, 141, 145, 148, 150, 154,
      155, 156,
    ],
  },
  {
    canonical: "Euphrates",
    variations: ["Euphrates River"],
    category: "place",
    status: "accepted",
    episodes: [4, 9, 27, 28, 39, 107, 157],
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
    episodes: [15, 18, 27, 37, 56, 62, 84, 95, 104, 124, 135],
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
    llmVerify: true,
    description:
      "ancient Jewish apocalyptic religious text, ascribed by tradition to the patriarch Enoch",
    status: "accepted",
    episodes: [
      6, 10, 11, 15, 18, 19, 20, 27, 28, 45, 55, 57, 62, 84, 98, 104, 120, 124,
      136, 137, 142, 157, 158,
    ],
  },
  {
    canonical: "Islam",
    variations: ["Muslim"],
    category: "religion",
    status: "accepted",
    episodes: [27, 28, 41, 59, 61, 66, 77, 96, 106, 124, 135, 137, 138],
  },
  {
    canonical: "Syria",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [
      1, 2, 7, 11, 16, 21, 28, 34, 54, 56, 62, 71, 81, 86, 87, 97, 109, 112,
      115, 123, 138,
    ],
  },
  {
    canonical: "Samson",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Samson from the Book of Judges",
    status: "accepted",
    episodes: [28, 36, 61, 63, 64, 68, 93, 111, 129],
  },
  {
    canonical: "Gideon",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Gideon from the Book of Judges",
    status: "accepted",
    episodes: [28, 36, 55, 67, 129],
  },
  {
    canonical: "Gabriel",
    variations: ["Archangel Gabriel"],
    category: "character",
    llmVerify: true,
    description: "Archangel Gabriel",
    status: "accepted",
    episodes: [28, 48, 84, 87, 136],
  },
  {
    canonical: "Michael",
    variations: ["Archangel Michael"],
    category: "character",
    llmVerify: true,
    description: "Archangel Michael",
    status: "accepted",
    episodes: [7, 16, 28, 34, 58, 71, 80, 84],
  },
  {
    canonical: "Jonah",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "from the bible, swallowed by a large fish",
    status: "accepted",
    episodes: [11, 17, 29, 50, 54, 72, 109, 118, 121],
  },
  {
    canonical: "Nineveh",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [3, 13, 29, 36, 54, 72, 88, 104, 118, 121],
  },
  {
    canonical: "Assyria",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [7, 13, 29, 36, 56, 71, 72, 88, 105, 120, 133],
  },
  {
    canonical: "Hezekiah",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [3, 7, 13, 21, 29, 36, 43, 72, 88, 105, 125, 133],
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
    episodes: [29],
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
    episodes: [4, 9, 30, 67, 79, 82, 88, 91, 93, 96, 102, 108, 113, 118, 130],
  },
  {
    canonical: "Andrew Whitehead",
    variations: [],
    category: "person",
    status: "accepted",
    episodes: [30],
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
    canonical: "Talmud",
    variations: [],
    category: "literature",
    status: "accepted",
    episodes: [24, 33, 61, 67, 85, 110, 137],
  },
  {
    canonical: "Moabites",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [3, 7, 18, 21, 81, 114, 116],
  },
  {
    canonical: "Ammonites",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [3, 18, 21, 36, 45, 81, 95, 111, 114, 139],
  },
  {
    canonical: "Sarah",
    variations: ["sarai"],
    category: "people",
    llmVerify: true,
    description: "Abraham's wife, mentioned in the Old Testament",
    status: "accepted",
    episodes: [3, 11, 14, 16, 19, 28, 40, 108, 121],
  },
  {
    canonical: "Gentiles",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [
      10, 19, 26, 33, 37, 38, 43, 44, 54, 62, 64, 80, 85, 89, 107, 110, 114,
      116,
    ],
  },
  {
    canonical: "Lilith",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "often considered the first wife of Adam",
    status: "accepted",
    episodes: [10, 14, 73],
  },
  {
    canonical: "Joseph",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "son of Jacob, sold into slavery in the Old Testament",
    status: "accepted",
    episodes: [
      1, 18, 20, 22, 41, 56, 68, 74, 109, 115, 127, 138, 139, 149, 150, 157,
    ],
  },
  {
    canonical: "Samaritans",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [3, 12, 33, 97],
  },
  {
    canonical: "Amorites",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [18, 21, 33, 46, 111, 129],
  },
  {
    canonical: "Cain",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "son of Adam, brother of Abel",
    status: "accepted",
    episodes: [20, 22, 56, 62, 90, 92, 95, 131],
  },
  {
    canonical: "Seth",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "third son of Adam, born after Cain killed Abel",
    status: "accepted",
    episodes: [20, 22, 27, 28, 62, 90, 95, 124],
  },
  {
    canonical: "Lamech",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [20, 56, 62, 90, 95, 98, 131],
  },
  {
    canonical: "Methuselah",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [20, 62, 95],
  },
  {
    canonical: "Jared",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "father of Enoch in the line of Adam",
    status: "accepted",
    episodes: [20, 62, 95],
  },
  {
    canonical: "Athanasius of Alexandria",
    variations: ["Athanasius"],
    category: "person",
    status: "accepted",
    episodes: [4, 5, 20, 39, 48, 50, 94, 98, 119, 122, 128],
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
    episodes: [
      4, 5, 6, 10, 16, 19, 23, 24, 26, 30, 33, 34, 35, 37, 39, 41, 43, 45, 48,
      49, 50, 52, 59, 60, 70, 76, 86, 87, 89, 96, 100, 107, 112, 113, 114, 122,
      124, 134, 136, 139,
    ],
  },
  {
    canonical: "Eschatology",
    variations: ["eschatological", "eschaton", "end times", "end time"],
    category: "theology",
    status: "accepted",
    episodes: [
      19, 25, 27, 32, 34, 39, 45, 48, 62, 71, 79, 98, 101, 104, 107, 115, 118,
      119, 132, 138,
    ],
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
    episodes: [32, 46, 63, 98],
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
    episodes: [34, 130],
  },
  {
    canonical: "Nebuchadnezzar",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [34, 45, 92, 113, 126, 130],
  },
  {
    canonical: "Antiochus IV Epiphanes",
    variations: ["Antiochus Epiphanes"],
    category: "person",
    llmVerify: true,
    description: "king of the Seleucid Empire",
    status: "accepted",
    episodes: [32, 34, 50, 62, 70, 71, 87, 112, 119, 123],
  },
  {
    canonical: "Cyrus the Great",
    variations: ["cyrus", "Cyrus the Persian"],
    category: "person",
    llmVerify: true,
    description: "Cyrus the Great, who founded the Achaemenid Empire in 550 BC",
    status: "accepted",
    episodes: [30, 34, 43, 70, 71, 99, 115, 130, 133],
  },
  {
    canonical: "Qumran",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [
      3, 6, 22, 33, 34, 45, 61, 62, 83, 85, 94, 95, 123, 129, 131, 137,
    ],
  },
  {
    canonical: "Medes",
    variations: [],
    category: "people",
    llmVerify: true,
    description:
      "people that lived in Median Kingdom that existed from the 7th century BCE until the mid-6th century BCE",
    status: "accepted",
    episodes: [34],
  },
  {
    canonical: "Median Kingdom",
    variations: ["Media", "Median"],
    category: "place",
    llmVerify: true,
    description:
      "a political entity centered in Ecbatana that existed from the 7th century BCE until the mid-6th century BCE",
    status: "accepted",
    episodes: [34, 70],
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
    episodes: [15, 16, 35, 48, 49, 69, 119],
  },
  {
    canonical: "Irenaeus",
    variations: ["Irenaeus of Lyons"],
    category: "person",
    llmVerify: true,
    description:
      "a Greek bishop noted for his role in guiding and expanding Christian communities in the southern regions of present-day France",
    status: "accepted",
    episodes: [35, 58, 69, 120, 122, 134],
  },
  {
    canonical: "Galilee",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [
      7, 11, 12, 13, 16, 20, 25, 28, 35, 40, 43, 48, 50, 55, 64, 69, 73, 81, 84,
      86, 87, 94, 99, 101, 128,
    ],
  },
  {
    canonical: "Saint Titus",
    variations: ["Titus"],
    category: "character",
    llmVerify: true,
    description:
      "early Christian missionary and church leader, a companion and disciple of Paul the Apostle",
    status: "accepted",
    episodes: [6, 26, 29, 35, 48, 60, 99, 138],
  },
  {
    canonical: "Josiah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "the 16th king of Judah (c. 640-609 BCE). Described as one of Judah’s most important kings",
    status: "accepted",
    episodes: [
      7, 31, 36, 40, 46, 64, 72, 88, 102, 117, 123, 125, 126, 145, 146, 155,
    ],
  },
  {
    canonical: "scribes",
    variations: [],
    category: "people",
    status: "rejected",
  },
  {
    canonical: "Bethlehem",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [11, 37, 38, 43, 52, 72, 87, 88, 121],
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
    episodes: [37, 43, 45, 50, 54, 59, 86, 87, 96, 106],
  },
  {
    canonical: "Judaism",
    variations: [],
    category: "religion",
    status: "accepted",
    episodes: [
      1, 5, 7, 9, 10, 11, 14, 15, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 33,
      34, 37, 38, 41, 42, 43, 44, 45, 46, 48, 50, 52, 53, 54, 58, 59, 61, 62,
      65, 66, 70, 71, 73, 76, 78, 80, 81, 83, 84, 85, 86, 92, 94, 96, 97, 98,
      99, 102, 108, 110, 111, 112, 117, 118, 119, 120, 123, 124, 126, 128, 130,
      132, 133, 134, 135, 136, 137, 139,
    ],
  },
  {
    canonical: "Virgin Birth",
    variations: [],
    category: "theology",
    llmVerify: true,
    description:
      "referring specifically to the Virgin Birth of Mary, the mother of Jesus",
    status: "accepted",
    episodes: [5, 37, 69],
  },
  {
    canonical: "gospel",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "east",
    variations: [],
    category: "place",
    status: "rejected",
  },
  {
    canonical: "Gospel of James",
    variations: [
      "protevangelium of james",
      "Proto-Gospel of James",
      "protoevangelium",
    ],
    category: "literature",
    llmVerify: true,
    description:
      "a second-century infancy gospel telling of the miraculous conception of Mary, the mother of Jesus, her upbringing and marriage to Joseph, the journey of the couple to Bethlehem, the birth of Jesus, and events immediately following.",
    status: "accepted",
    episodes: [38, 87, 99, 136],
  },
  {
    canonical: "Persia",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [7, 28, 34, 37, 38, 58, 71, 76, 86, 115, 133],
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
    episodes: [11, 12, 20, 39, 94, 100, 122],
  },
  {
    canonical: "Theosis",
    variations: [],
    category: "theology",
    status: "accepted",
    episodes: [39, 128],
  },
  {
    canonical: "Anatolia",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "also known as Asia Minor, is the large peninsula forming the Asian part of modern-day Turkey",
    status: "accepted",
    episodes: [14, 39, 65, 99],
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
    episodes: [4, 39],
  },
  {
    canonical: "Nero",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Roman emperor and the final emperor of the Julio-Claudian dynasty, reigning from AD 54 until his death in AD 68",
    status: "accepted",
    episodes: [9, 39, 54, 96, 119],
  },
  {
    canonical: "Saul",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "monarch of ancient Israel and Judah",
    status: "accepted",
    episodes: [
      6, 15, 28, 33, 36, 40, 45, 53, 55, 58, 64, 67, 73, 84, 93, 111, 113, 121,
      133, 139, 150, 154, 156,
    ],
  },
  {
    canonical: "Samuel",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "prophet, priest, and judge who led Israel during its transition from judges to monarchy, anointing both Israel's first king, Saul, and his successor, David",
    status: "accepted",
    episodes: [
      3, 6, 11, 13, 14, 15, 18, 21, 28, 36, 40, 45, 46, 53, 55, 61, 63, 67, 73,
      84, 101, 116, 121, 123, 125, 126, 127, 133, 137,
    ],
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
    episodes: [13, 41, 53, 56, 62, 81, 90, 92, 101, 131],
  },
  {
    canonical: "Canaan",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [27, 41, 46, 56, 64, 68, 75, 92, 95, 116, 121, 131],
  },
  {
    canonical: "Japheth",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [41, 62, 81, 92, 131],
  },
  {
    canonical: "Shem",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [33, 41, 56, 62, 81, 92, 131],
  },
  {
    canonical: "Canaanites",
    variations: ["Canaanite"],
    category: "people",
    status: "accepted",
    episodes: [33, 41, 46, 56, 64, 92, 116, 129],
  },
  {
    canonical: "Africans",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [41, 92],
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
    episodes: [8, 11, 21, 41, 49, 62, 84, 86, 92, 111, 117],
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
    episodes: [4, 5, 17, 39, 42, 106, 109, 119, 133],
  },
  {
    canonical: "Holy Spirit",
    variations: ["Holy Ghost"],
    category: "character",
    status: "accepted",
    episodes: [
      23, 33, 42, 48, 53, 54, 61, 76, 79, 87, 90, 92, 98, 104, 119, 144, 145,
      148,
    ],
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
    episodes: [
      1, 2, 6, 7, 9, 14, 15, 17, 18, 19, 20, 25, 28, 30, 32, 34, 37, 39, 42, 43,
      72, 76, 84, 90, 97, 99, 100, 102, 104, 105, 110, 113, 114, 115, 120, 122,
      124, 126, 133,
    ],
  },
  {
    canonical: "Josephus",
    variations: [],
    category: "person",
    status: "accepted",
    episodes: [10, 12, 15, 33, 43, 45, 48, 61, 69, 73, 74, 85, 86, 87],
  },
  {
    canonical: "Jennifer Bird",
    variations: ["Dr. Jennifer Bird"],
    category: "person",
    status: "accepted",
    episodes: [44, 93],
  },
  {
    canonical: "Essenes",
    variations: [],
    category: "people",
    status: "accepted",
    episodes: [45, 61, 85, 86, 94, 123],
  },
  {
    canonical: "Leningrad Codex",
    variations: [],
    category: "literature",
    status: "accepted",
    episodes: [7, 11, 45, 99, 100, 122, 132],
  },
  {
    canonical: "Joshua",
    variations: ["Joshua's"],
    category: "character",
    status: "accepted",
    episodes: [
      13, 14, 16, 18, 21, 36, 37, 41, 46, 55, 56, 67, 76, 80, 81, 95, 97, 102,
      104, 105, 107, 113, 115, 116, 118, 124, 126, 127, 137,
    ],
  },
  {
    canonical: "Origen",
    variations: [],
    category: "person",
    status: "accepted",
    episodes: [6, 11, 46, 62, 70, 89, 118, 130, 137, 149, 152, 154],
  },
  {
    canonical: "historical Jesus",
    variations: ["quest for the historical Jesus"],
    category: "theology",
    status: "rejected",
  },
  {
    canonical: "John the Baptist",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Jewish preacher who baptized Jesus, executed by Herod Antipas",
    status: "accepted",
    episodes: [23, 28, 48, 61, 63, 69, 86, 87, 94, 143, 144, 145],
  },
  {
    canonical: "Gospel of Thomas",
    variations: ["Thomas"],
    category: "literature",
    llmVerify: true,
    description:
      "Non-canonical sayings gospel discovered at Nag Hammadi in 1945",
    status: "accepted",
    episodes: [61, 94, 128],
  },
  {
    canonical: "Tertius",
    variations: [],
    category: "person",
    status: "accepted",
    episodes: [49],
  },
  {
    canonical: "Pliny the Younger",
    variations: ["Pliny"],
    category: "person",
    llmVerify: true,
    description:
      "Roman author and administrator (61-113 CE) who wrote about early Christians",
    status: "accepted",
    episodes: [45, 48, 49, 101],
  },
  {
    canonical: "Clement of Rome",
    variations: ["Clement"],
    category: "person",
    llmVerify: true,
    description:
      "Early Christian bishop of Rome (late 1st century CE), traditionally the fourth pope",
    status: "accepted",
    episodes: [20, 49, 110],
  },
  {
    canonical: "First Clement",
    variations: ["1 Clement"],
    category: "literature",
    llmVerify: true,
    description:
      "Letter from the church of Rome to Corinth, attributed to Clement (c. 96 CE)",
    status: "accepted",
    episodes: [20, 49],
  },
  {
    canonical: "Pontius Pilate",
    variations: ["Pilate"],
    category: "person",
    llmVerify: true,
    description:
      "Roman prefect of Judea (26-36 CE) who presided over the trial of Jesus",
    status: "accepted",
    episodes: [50, 55, 86, 98, 134],
  },
  {
    canonical: "Passover",
    variations: ["Pesach"],
    category: "event",
    llmVerify: true,
    description:
      "Jewish festival commemorating the Israelites' exodus from Egypt",
    status: "accepted",
    episodes: [5, 24, 43, 50, 75, 86, 90, 93, 109, 117, 127],
  },
  {
    canonical: "Bethany",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "Village near Jerusalem, home of Mary, Martha, and Lazarus in the Gospels",
    status: "accepted",
    episodes: [12, 43, 50],
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
    episodes: [12, 15, 16, 35, 46, 50, 55, 73, 104, 112, 113, 137],
  },
  {
    canonical: "Garden of Gethsemane",
    variations: ["Gethsemane"],
    category: "place",
    status: "accepted",
    episodes: [112],
  },
  {
    canonical: "Sanhedrin",
    variations: ["the Sanhedrin"],
    category: "people",
    status: "accepted",
    episodes: [50, 99],
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
    episodes: [3, 6, 13, 27, 36, 52, 64, 67, 93, 125],
  },
  {
    canonical: "Philistines",
    variations: ["Philistine"],
    category: "people",
    llmVerify: true,
    description:
      "An ancient people who inhabited parts of Canaan, often in conflict with the Israelites",
    status: "accepted",
    episodes: [
      6, 7, 14, 36, 40, 46, 52, 63, 64, 67, 73, 80, 93, 111, 116, 121, 125, 126,
      127,
    ],
  },
  {
    canonical: "Elhanan son of Jair",
    variations: ["Elhanan"],
    category: "character",
    llmVerify: true,
    description:
      "Israelite warrior credited with killing Goliath in 2 Samuel 21:19",
    status: "accepted",
    episodes: [6, 13, 52],
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
    episodes: [1, 7, 11, 50, 53, 58, 66, 70, 71, 83, 99, 123, 133],
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
    episodes: [7, 36, 46, 53, 54, 55, 97, 123, 133],
  },
  {
    canonical: "Bethel",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "An ancient city in the Land of Israel, associated with Jacob's dream in Genesis and later a religious center",
    status: "accepted",
    episodes: [7, 14, 53, 88],
  },
  {
    canonical: "Demon",
    variations: ["devils", "unclean spirit", "evil spirit"],
    category: "theology",
    llmVerify: true,
    description:
      "Malevolent spiritual entities or agents believed to cause harm and influence human behavior, not referencing Satan or The Devil",
    status: "accepted",
    addedInEpisode: 53,
    episodes: [14, 16, 17, 24, 28, 33, 50, 53, 55, 81, 84, 111, 123, 148],
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
    episodes: [23, 54, 76, 80],
  },
  {
    canonical: "Council of Jerusalem",
    variations: ["Jerusalem Council"],
    category: "event",
    llmVerify: true,
    description:
      "A meeting in Jerusalem described in Acts 15, where early Christian leaders discussed the requirements for Gentile converts.",
    status: "accepted",
    episodes: [6, 33, 39, 54, 80, 99],
  },
  {
    canonical: "Silas",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A companion of Paul on his missionary journeys, mentioned in the Book of Acts.",
    status: "accepted",
    episodes: [54, 132],
  },
  {
    canonical: "Cornelius",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A Roman centurion who, according to the Book of Acts, converted to Christianity after a vision and an encounter with Peter.",
    status: "accepted",
    episodes: [54],
  },
  {
    canonical: "Edom",
    variations: ["Idumea"],
    category: "place",
    llmVerify: true,
    description:
      "An ancient kingdom located southeast of Israel, often mentioned in the Hebrew Bible.",
    status: "accepted",
    episodes: [7, 14, 54, 80, 81, 111],
  },
  {
    canonical: "Pergamum",
    variations: ["Pergamos"],
    category: "place",
    llmVerify: true,
    description:
      "An ancient city in Anatolia (modern-day Turkey), mentioned in the Book of Revelation as one of the seven churches.",
    status: "accepted",
    episodes: [39, 54],
  },
  {
    canonical: "Ahaziah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "King of Judah whose death is recounted differently in 2 Kings and 2 Chronicles",
    status: "accepted",
    episodes: [55],
  },
  {
    canonical: "Jehu",
    variations: [],
    category: "character",
    status: "accepted",
    episodes: [55, 66, 133],
  },
  {
    canonical: "Joram",
    variations: ["Jehoram"],
    category: "character",
    llmVerify: true,
    description: "King of Israel who was assassinated by Jehu",
    status: "accepted",
    episodes: [7, 55, 66],
  },
  {
    canonical: "NRSV",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Capernaum",
    variations: [],
    category: "place",
    status: "accepted",
    episodes: [40, 55, 69, 132],
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
    canonical: "Tower of Babel",
    variations: ["Babel"],
    category: "character",
    status: "accepted",
    episodes: [3, 19, 56, 59, 81],
  },
  {
    canonical: "Garden of Eden",
    variations: ["Eden"],
    category: "place",
    llmVerify: true,
    description:
      "The idyllic garden where Adam and Eve originally lived, according to Genesis",
    status: "accepted",
    episodes: [
      1, 9, 10, 14, 18, 28, 29, 36, 37, 39, 51, 56, 58, 71, 80, 81, 90, 107,
      116, 120, 125, 131,
    ],
  },
  {
    canonical: "Priestly Source",
    variations: [],
    category: "scholarship",
    llmVerify: true,
    description:
      "Referring to the Priestly Source (P), one of the hypothesized sources of the Pentateuch",
    status: "accepted",
    addedInEpisode: 56,
    episodes: [22, 46, 102, 111, 131],
  },
  {
    canonical: "Flood",
    variations: ["the Flood"],
    category: "event",
    llmVerify: true,
    description: "A cataclysmic event in Genesis where Elohim floods the world",
    status: "accepted",
    episodes: [
      1, 3, 15, 20, 21, 22, 27, 38, 41, 46, 56, 62, 81, 90, 92, 95, 98, 104,
      115, 124, 131,
    ],
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
    status: "rejected",
    addedInEpisode: 57,
  },
  {
    canonical: "William Tyndale",
    variations: ["Tyndale"],
    category: "person",
    status: "accepted",
    episodes: [6, 11, 17, 58],
  },
  {
    canonical: "rome",
    variations: ["roman"],
    category: "place",
    status: "rejected",
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
    episodes: [11, 17, 40, 58, 99],
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
    status: "rejected",
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
    episodes: [58],
  },
  {
    canonical: "Latin Vulgate",
    variations: ["vulgate"],
    category: "literature",
    llmVerify: true,
    description:
      "The Latin Vulgate is a late fourth-century Latin translation of the Bible that became the Catholic Church's standard Latin translation",
    status: "accepted",
    episodes: [
      11, 17, 18, 20, 22, 25, 58, 59, 69, 70, 71, 92, 94, 99, 125, 130,
    ],
  },
  {
    canonical: "Martin Luther",
    variations: ["luther's", "luther"],
    category: "person",
    llmVerify: true,
    description:
      "Martin Luther was a German theologian, professor, pastor, priest, and church reformer of the 16th century",
    status: "accepted",
    episodes: [6, 11, 17, 20, 49, 58, 70, 92, 99, 106, 109, 124, 125, 130, 136],
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
    episodes: [11, 12, 17, 40, 58, 60, 85, 94, 99, 104],
  },
  {
    canonical: "genesis 2",
    variations: ["genesis 2:8"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Meanings and Ends of Monotheism",
    variations: ["conference"],
    category: "event",
    status: "rejected",
    addedInEpisode: 59,
  },
  {
    canonical: "Creation ex nihilo",
    variations: ["creatio ex nihilo"],
    category: "theology",
    llmVerify: true,
    description: "The doctrine that God created the universe from nothing.",
    status: "accepted",
    addedInEpisode: 59,
    episodes: [58, 59, 70, 112],
  },
  {
    canonical: "Unitarians",
    variations: ["Unitarian"],
    category: "religion",
    status: "rejected",
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
    episodes: [8, 19, 33, 34, 38, 43, 45, 49, 59, 85, 104, 115, 123, 130],
  },
  {
    canonical: "Philo of Alexandria",
    variations: ["Philo"],
    category: "person",
    llmVerify: true,
    description:
      "A Hellenistic Jewish philosopher who lived in Alexandria, Egypt.",
    status: "accepted",
    episodes: [
      10, 19, 26, 33, 42, 53, 59, 86, 92, 100, 105, 128, 130, 134, 135,
    ],
  },
  {
    canonical: "Hypostasis",
    variations: ["hypostases", "hypostatization"],
    category: "theology",
    llmVerify: true,
    description:
      "A technical term in theology and philosophy, referring to a distinct substance or entity, often used in discussions of the Trinity.",
    status: "accepted",
    episodes: [5, 59],
  },
  {
    canonical: "Athenagoras",
    variations: [],
    category: "person",
    llmVerify: true,
    description: "An early Christian apologist of the late 2nd century CE.",
    status: "accepted",
    episodes: [57, 59],
  },
  {
    canonical: "Pharisees",
    variations: ["Pharisee"],
    category: "religion",
    description:
      "A Jewish religious and political party in ancient Judea, known for their strict adherence to religious law",
    status: "accepted",
    addedInEpisode: 60,
    episodes: [
      19, 37, 44, 50, 54, 59, 60, 76, 84, 85, 86, 96, 108, 123, 133, 146, 147,
      148,
    ],
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
    episodes: [60],
  },
  {
    canonical: "Aquila",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A man mentioned in the New Testament, associated with Priscilla or Prisca/Priska",
    status: "accepted",
    episodes: [60],
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
    status: "rejected",
  },
  {
    canonical: "Southern Baptist Convention",
    variations: ["southern baptist"],
    category: "religion",
    status: "accepted",
    episodes: [23, 60, 82, 96],
  },
  {
    canonical: "numbers 5",
    variations: [],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Baptism",
    variations: ["baptize"],
    category: "theology",
    llmVerify: true,
    description:
      "A religious ritual involving immersion in water, symbolizing purification or initiation",
    status: "accepted",
    episodes: [5, 61, 69, 87, 94, 110, 128, 141, 142, 143, 144, 145, 148, 149],
  },
  {
    canonical: "Elizabeth",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Mother of John the Baptist in the Gospel of Luke, wife of Zechariah",
    status: "accepted",
    episodes: [23, 61, 87],
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
    canonical: "Gnosticism",
    variations: ["Gnostic"],
    category: "theology",
    llmVerify: true,
    description:
      "A religious movement emphasizing personal spiritual knowledge and a dualistic worldview",
    status: "accepted",
    episodes: [11, 16, 39, 43, 48, 61, 69, 70, 89, 94, 102, 119, 128, 150],
  },
  {
    canonical: "Herod Antipas",
    variations: ["Herod"],
    category: "person",
    llmVerify: true,
    description:
      "The son of Herod the Great, tetrarch of Galilee and Perea, who ordered the execution of John the Baptist",
    status: "accepted",
    episodes: [50, 59, 61, 84, 100],
  },
  {
    canonical: "Herodias",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Wife of Herod Antipas who requested the beheading of John the Baptist",
    status: "accepted",
    episodes: [61],
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
    canonical: "Asael",
    variations: ["Azael"],
    category: "character",
    llmVerify: true,
    description: "A fallen angel mentioned in the Book of Enoch",
    status: "accepted",
    addedInEpisode: 62,
    episodes: [62, 98],
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
    episodes: [62, 137],
  },
  {
    canonical: "Jacob",
    variations: ["Jacob's", "Jacobites"],
    category: "character",
    llmVerify: true,
    description:
      "Patriarch in Genesis, son of Isaac, father of the twelve tribes of Israel; his name is later changed to Israel",
    status: "accepted",
    episodes: [87, 104, 116, 118, 121, 124, 130, 133, 138, 139],
  },
  {
    canonical: "Esau",
    variations: ["Esau's"],
    category: "character",
    llmVerify: true,
    description:
      "Jacob's twin brother, son of Isaac, known for selling his birthright",
    status: "accepted",
    episodes: [1, 13, 36, 62, 63],
  },
  {
    canonical: "Laban",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Father of Leah and Rachel, Jacob's uncle and father-in-law",
    status: "accepted",
    addedInEpisode: 63,
    episodes: [59, 63, 73, 121],
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
    episodes: [64],
  },
  {
    canonical: "Jael",
    variations: ["Yael"],
    category: "character",
    llmVerify: true,
    description:
      "A woman who kills Sisera in the Book of Judges, thus freeing Israel from the Canaanites",
    status: "accepted",
    addedInEpisode: 64,
    episodes: [64, 123],
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
    status: "rejected",
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
    episodes: [5, 18, 39, 42, 51, 69, 70, 98, 119, 137],
  },
  {
    canonical: "Didache",
    variations: [],
    category: "literature",
    description:
      "An early Christian treatise containing instructions for Christian communities",
    status: "accepted",
    episodes: [20, 23, 69, 110],
  },
  {
    canonical: "Eusebius",
    variations: ["Eusebius of Caesarea"],
    category: "person",
    llmVerify: true,
    description:
      "A fourth-century church historian, known for his work on the history of the early church",
    status: "accepted",
    episodes: [5, 12, 15, 17, 35, 48, 69, 94, 99, 100, 110, 119],
  },
  {
    canonical: "Ignatius",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "An early second-century bishop of Antioch, known for his letters to various Christian communities",
    status: "accepted",
    episodes: [33, 69],
  },
  {
    canonical: "Theophilus",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "The person to whom the Gospel of Luke and the Book of Acts are addressed",
    status: "accepted",
    episodes: [69],
  },
  {
    canonical: "salome",
    variations: [],
    category: "character",
    status: "rejected",
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
    episodes: [11, 18, 20, 58, 69, 70, 92, 130],
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
    episodes: [15, 40, 58, 65, 73],
  },
  {
    canonical: "Asia Minor",
    variations: [],
    category: "place",
    status: "rejected",
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
  {
    canonical: "Texas",
    variations: [],
    category: "place",
    status: "rejected",
  },
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
    status: "rejected",
    addedInEpisode: 66,
  },
  {
    canonical: "Abigail",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "One of David's wives, portrayed as virtuous and discerning; appears in 1 Samuel 25 and 2 Samuel 3",
    status: "accepted",
    addedInEpisode: 67,
    episodes: [41, 64, 67],
  },
  {
    canonical: "Bathsheba",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Wife of Uriah the Hittite, later one of David's wives; their affair and its consequences are described in 2 Samuel 11-12",
    status: "accepted",
    episodes: [64, 67, 133],
  },
  {
    canonical: "Absalom",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "David's son who led a rebellion against him; his story is told in 2 Samuel 13-19",
    status: "accepted",
    episodes: [67],
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
    episodes: [64, 67, 73],
  },
  {
    canonical: "Tamar",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Daughter-in-law of Judah, who disguised herself as a prostitute and tricked Judah into fulfilling his levirate duty, from Genesis 38",
    status: "accepted",
    episodes: [63, 68, 72, 123, 125],
  },
  {
    canonical: "Onan",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Son of Judah who spilled his semen on the ground to avoid impregnating his brother's widow Tamar, from Genesis 38",
    status: "accepted",
    episodes: [66, 68, 93, 108],
  },
  {
    canonical: "Shelah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Youngest son of Judah who Tamar was promised to, but withheld from her",
    status: "accepted",
    addedInEpisode: 68,
    episodes: [68],
  },
  {
    canonical: "Er",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Eldest son of Judah, who was killed by God for being wicked",
    status: "accepted",
    episodes: [68],
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
    canonical: "Boaz",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Kinsman of Ruth's deceased husband who marries her and continues the family line; story told in the Book of Ruth",
    status: "accepted",
    episodes: [68, 72, 108],
  },
  {
    canonical: "Genesis 38",
    variations: [],
    category: "literature",
    status: "rejected",
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
    episodes: [20, 70, 83, 119],
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
    episodes: [70],
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
    status: "rejected",
    addedInEpisode: 71,
  },
  {
    canonical: "Second Coming",
    variations: [],
    category: "theology",
    llmVerify: true,
    description:
      "The Christian belief that Jesus Christ will return to Earth at some point in the future.",
    status: "accepted",
    addedInEpisode: 71,
    episodes: [
      4, 25, 30, 32, 37, 45, 48, 50, 71, 104, 106, 107, 118, 119, 132, 138, 143,
    ],
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
    episodes: [72, 108],
  },
  {
    canonical: "Moab",
    variations: ["Moabite"],
    category: "place",
    llmVerify: true,
    description:
      "An ancient kingdom located east of the Dead Sea, often in conflict with Israel",
    status: "accepted",
    episodes: [
      1, 7, 13, 18, 36, 40, 46, 72, 73, 80, 81, 88, 93, 111, 126, 137, 139,
    ],
  },
  {
    canonical: "Hesed",
    variations: [],
    category: "theology",
    status: "accepted",
  },
  {
    canonical: "Sennacherib",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "King of Assyria from 705 to 681 BCE, known for his military campaigns and building projects",
    status: "accepted",
    episodes: [3, 7, 13, 29, 43, 72, 88, 105, 126, 146, 155],
  },
  {
    canonical: "numbers",
    variations: ["book of numbers"],
    category: "literature",
    status: "rejected",
  },
  {
    canonical: "Ketef Hinnom",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "An archaeological site near Jerusalem where ancient silver amulets with biblical inscriptions were discovered",
    status: "accepted",
    addedInEpisode: 73,
    episodes: [14, 73],
  },
  {
    canonical: "Witch of Endor",
    variations: ["necromancer of endor"],
    category: "character",
    llmVerify: true,
    description:
      "A figure in the Book of Samuel who summons the spirit of Samuel for Saul",
    status: "accepted",
    addedInEpisode: 73,
    episodes: [15, 40, 58, 65, 73],
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
    episodes: [8, 18, 20, 21, 22, 46, 74, 116, 129],
  },
  {
    canonical: "pharaoh",
    variations: [],
    category: "character",
    status: "rejected",
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
    episodes: [14, 73, 75, 88, 105, 123],
  },
  {
    canonical: "signs and wonders",
    variations: [],
    category: "theology",
    status: "rejected",
    addedInEpisode: 75,
  },
  {
    canonical: "plagues",
    variations: ["plague"],
    category: "event",
    status: "rejected",
    addedInEpisode: 75,
  },
  {
    canonical: "Red Sea",
    variations: ["sea of reeds", "yam suf"],
    category: "place",
    llmVerify: true,
    description:
      "Sea crossed by the Israelites during the Exodus from Egypt, according to the biblical narrative.",
    status: "accepted",
    addedInEpisode: 75,
    episodes: [21, 75, 90, 97],
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
    episodes: [19, 38, 54, 76, 115, 121],
  },
  {
    canonical: "Sapphira",
    variations: ["Sappheira"],
    category: "character",
    llmVerify: true,
    description:
      "Wife of Ananias in Acts 5, who conspired to deceive the apostles about the proceeds of a land sale",
    status: "accepted",
    addedInEpisode: 76,
    episodes: [76, 102],
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
    episodes: [
      1, 21, 33, 41, 55, 75, 86, 92, 93, 100, 110, 116, 117, 120, 121, 127, 138,
    ],
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
    episodes: [
      4, 6, 11, 17, 20, 26, 33, 39, 49, 59, 61, 66, 70, 73, 77, 78, 79, 83, 92,
      97, 107, 109, 124, 130, 133, 136,
    ],
  },
  {
    canonical: "Catholicism",
    variations: ["Catholic", "Catholic Church"],
    category: "religion",
    status: "accepted",
    addedInEpisode: 77,
    episodes: [
      5, 6, 11, 16, 19, 20, 23, 26, 33, 34, 35, 37, 40, 51, 53, 57, 58, 60, 66,
      73, 77, 87, 92, 94, 98, 99, 106, 107, 108, 109, 117, 119, 122, 124, 134,
      136,
    ],
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
    episodes: [37, 70, 77],
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
    episodes: [4, 11, 20, 36, 58, 65, 77, 79, 80, 81, 106, 122, 136, 142],
  },
  {
    canonical: "evangelicalism",
    variations: ["evangelical", "evangelicals"],
    category: "religion",
    status: "rejected",
    addedInEpisode: 79,
  },
  {
    canonical: "orthodoxy",
    variations: ["Orthodoxy"],
    category: "theology",
    status: "rejected",
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
    status: "rejected",
    addedInEpisode: 83,
  },
  {
    canonical: "Garden Tomb",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "A rock-cut tomb in Jerusalem, proposed by some as the site of Jesus' burial and resurrection",
    status: "accepted",
    addedInEpisode: 83,
    episodes: [83],
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
    episodes: [5, 13, 17, 39, 42, 83, 94, 99, 100, 109, 119, 134],
  },
  {
    canonical: "new testament",
    variations: ["nt"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 84,
  },
  {
    canonical: "Jubilees",
    variations: [],
    category: "literature",
    llmVerify: true,
    description:
      "An ancient Jewish religious work of 50 chapters, considered canonical by Ethiopian Orthodox Church",
    status: "accepted",
    addedInEpisode: 84,
    episodes: [6, 11, 18, 29, 62, 84, 98, 137, 142],
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
    episodes: [1, 18, 28, 84, 123],
  },
  {
    canonical: "Logan Williams",
    variations: ["Logan"],
    category: "person",
    status: "rejected",
    addedInEpisode: 85,
  },
  {
    canonical: "New Testament Studies",
    variations: [],
    category: "literature",
    status: "rejected",
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
    canonical: "Ritual Purity",
    variations: ["purity ideas", "purity laws"],
    category: "theology",
    description:
      "Jewish regulations concerning ritual purity and impurity, involve practices of cleansing and separation",
    status: "accepted",
    addedInEpisode: 85,
    episodes: [22, 26, 45, 54, 64, 67, 70, 85, 95, 115, 127, 145],
  },
  {
    canonical: "Matt Thiessen",
    variations: ["Thiessen"],
    category: "person",
    status: "rejected",
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
    status: "rejected",
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
    variations: ["Josephus"],
    category: "person",
    llmVerify: true,
    description:
      "Jewish historian who lived in the 1st century CE and wrote about the history of the Jewish people and the Jewish-Roman War",
    status: "accepted",
    addedInEpisode: 86,
    episodes: [
      10, 12, 15, 31, 43, 45, 48, 61, 69, 73, 74, 85, 86, 87, 99, 100, 110, 112,
      117, 123, 128, 130, 135, 137, 138, 139, 140, 144, 155, 156,
    ],
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
    variations: [],
    category: "place",
    status: "accepted",
    addedInEpisode: 87,
    episodes: [48, 49, 55, 81, 87, 99, 141],
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
    status: "rejected",
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
    status: "rejected",
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
    status: "rejected",
    addedInEpisode: 90,
  },
  {
    canonical: "exegesis",
    variations: ["exegesis'"],
    category: "scholarship",
    status: "rejected",
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
    canonical: "Abel",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "The son of Adam and Eve who was murdered by his brother Cain.",
    status: "accepted",
    addedInEpisode: 90,
    episodes: [22, 56, 90, 92],
  },
  {
    canonical: "April Ajoy",
    variations: ["Ajoy"],
    category: "person",
    status: "rejected",
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
    status: "accepted",
    addedInEpisode: 92,
    episodes: [92],
  },
  {
    canonical: "Susanna",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Main character in the Book of Susanna, falsely accused of adultery by two elders",
    status: "accepted",
    addedInEpisode: 92,
    episodes: [20, 92],
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
    episodes: [
      4, 5, 11, 12, 15, 17, 18, 19, 20, 28, 38, 62, 70, 92, 100, 112, 119, 125,
      126, 128, 130,
    ],
  },
  {
    canonical: "Curse of Ham",
    variations: [],
    category: "theology",
    description:
      "Misinterpretation of the curse placed on Canaan, son of Ham, used to justify slavery",
    status: "accepted",
    addedInEpisode: 92,
    episodes: [41, 90, 92],
  },
  {
    canonical: "Joachim",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Husband of Susanna in the Book of Susanna.",
    status: "accepted",
    addedInEpisode: 92,
    episodes: [92],
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
    llmVerify: true,
    description:
      "King of Moab who oppressed Israel, assassinated by Ehud in the Book of Judges.",
    status: "accepted",
    addedInEpisode: 93,
    episodes: [93],
  },
  {
    canonical: "David Wright",
    variations: [],
    category: "person",
    status: "rejected",
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
    episodes: [4, 5, 42, 94, 106, 119],
  },
  {
    canonical: "Jericho",
    variations: ["Walls of Jericho"],
    category: "place",
    llmVerify: true,
    description:
      "Ancient city in the Jordan River Valley, famous for its walls being toppled in the Book of Joshua.",
    status: "accepted",
    addedInEpisode: 95,
    episodes: [18, 46, 87, 95, 97, 116, 123, 127, 138],
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
    status: "rejected",
    addedInEpisode: 96,
  },
  {
    canonical: "speaker of the house",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 96,
  },
  {
    canonical: "Sadducees",
    variations: ["Sadducee"],
    category: "religion",
    description:
      "A Jewish sect during the Second Temple period, associated with the priestly aristocracy and Temple administration.",
    status: "accepted",
    addedInEpisode: 96,
    episodes: [85, 86, 96, 99, 122, 123, 151],
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
    status: "rejected",
    addedInEpisode: 97,
  },
  {
    canonical: "Ron Wyatt",
    variations: ["Wyatt"],
    category: "person",
    status: "rejected",
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
    status: "rejected",
    addedInEpisode: 97,
  },
  {
    canonical: "Solomon",
    variations: ["King Solomon"],
    category: "character",
    llmVerify: true,
    description:
      "A biblical king of Israel, son of David, known for his wisdom and building the First Temple in Jerusalem.",
    status: "accepted",
    addedInEpisode: 97,
    episodes: [
      2, 6, 10, 18, 26, 30, 36, 48, 55, 64, 89, 97, 110, 115, 123, 131, 132,
      133, 134, 139,
    ],
  },
  {
    canonical: "Mount Sinai",
    variations: ["Mounts Sinai"],
    category: "place",
    llmVerify: true,
    description:
      "The mountain where Moses received the Ten Commandments from God, according to the Book of Exodus.",
    status: "accepted",
    addedInEpisode: 97,
    episodes: [17, 93, 94, 97, 130],
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
    canonical: "Galatians",
    variations: ["Galatians 1"],
    category: "literature",
    status: "rejected",
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
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A slave belonging to Philemon, mentioned in the New Testament epistle of the same name; Paul intercedes on his behalf",
    status: "accepted",
    addedInEpisode: 100,
    episodes: [100],
  },
  {
    canonical: "ephesians",
    variations: ["Ephesians 6"],
    category: "literature",
    description:
      "A letter from the New Testament, traditionally attributed to Paul, that discusses Christian living and household codes.",
    status: "proposed",
    addedInEpisode: 101,
  },
  {
    canonical: "Slave Bible",
    variations: [],
    category: "literature",
    status: "accepted",
    addedInEpisode: 101,
    episodes: [101],
  },
  {
    canonical: "Dave Ramsey",
    variations: ["Ramsey"],
    category: "person",
    status: "rejected",
    addedInEpisode: 102,
  },
  {
    canonical: "Micah",
    variations: [],
    category: "literature",
    description:
      "A book in the Hebrew Bible containing the prophecies of the prophet Micah",
    status: "proposed",
    addedInEpisode: 102,
  },
  {
    canonical: "Deuteronomistic history",
    variations: ["Deuteronomistic history"],
    category: "scholarship",
    description:
      "A modern theory proposing a unified literary work comprising Deuteronomy, Joshua, Judges, Samuel, and Kings",
    status: "proposed",
    addedInEpisode: 102,
  },
  {
    canonical: "Judges",
    variations: ["Book of Judges"],
    category: "literature",
    description:
      "A book in the Hebrew Bible featuring stories of judges who led Israel after Joshua",
    status: "proposed",
    addedInEpisode: 102,
  },
  {
    canonical: "Martin Noth",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 102,
  },
  {
    canonical: "Thomas Romer",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 102,
  },
  {
    canonical: "Jeremy Steele",
    variations: ["Steele"],
    category: "person",
    status: "rejected",
    addedInEpisode: 103,
  },
  {
    canonical: "Dan Beecher",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 103,
  },
  {
    canonical: "god",
    variations: [],
    category: "theology",
    status: "rejected",
    addedInEpisode: 103,
  },
  {
    canonical: "deep south",
    variations: [],
    category: "place",
    status: "rejected",
    addedInEpisode: 103,
  },
  {
    canonical: "Jude",
    variations: ["Book of Jude", "Epistle of Jude"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 104,
  },
  {
    canonical: "Second Peter",
    variations: ["2 Peter", "Epistle of Second Peter"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 104,
  },
  {
    canonical: "Deutero-Isaiah",
    variations: ["Deutero Isaiah", "Second Isaiah"],
    category: "literature",
    description:
      "Chapters 40-55 of the Book of Isaiah, believed by many scholars to be written by a different author than the earlier chapters",
    status: "accepted",
    addedInEpisode: 104,
    episodes: [
      7, 42, 43, 46, 59, 90, 104, 105, 113, 115, 122, 126, 136, 145, 158,
    ],
  },
  {
    canonical: "Lord",
    variations: [],
    category: "theology",
    status: "rejected",
    caseSensitive: true,
    addedInEpisode: 104,
  },
  {
    canonical: "Angela Roskop Erisman",
    variations: ["Erisman"],
    category: "person",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Cincinnati",
    variations: ["FC Cincinnati"],
    category: "place",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Marginalia Review of Books",
    variations: ["Marginalia"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Midwest",
    variations: [],
    category: "place",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Assyrian",
    variations: [],
    category: "people",
    description: "Relating to the ancient empire of Assyria.",
    status: "proposed",
    addedInEpisode: 105,
  },
  {
    canonical: "Sargon",
    variations: [],
    category: "character",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Korach",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A Levite who led a rebellion against Moses and Aaron in the Book of Numbers.",
    status: "accepted",
    addedInEpisode: 105,
    episodes: [105],
  },
  {
    canonical: "Persian Period",
    variations: [],
    category: "event",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Book",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Alexiana Fry",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 105,
  },
  {
    canonical: "Usury",
    variations: [],
    category: "miscellaneous",
    description:
      "The practice of lending money at interest, historically condemned in many religious traditions",
    status: "accepted",
    addedInEpisode: 106,
    episodes: [106],
  },
  {
    canonical: "Oxford",
    variations: ["Jewish quarter of Oxford"],
    category: "place",
    description: "City in England, known for the University of Oxford",
    status: "proposed",
    addedInEpisode: 106,
  },
  {
    canonical: "Luke 6",
    variations: ["Luke, chapter 6"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 106,
  },
  {
    canonical: "New Haven",
    variations: ["New Haven Green"],
    category: "place",
    status: "rejected",
    addedInEpisode: 107,
  },
  {
    canonical: "columbus",
    variations: ["Christopher Columbus"],
    category: "person",
    status: "rejected",
    addedInEpisode: 107,
  },
  {
    canonical: "revelation 21",
    variations: ["revelation"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 107,
  },
  {
    canonical: "revelation 22",
    variations: ["revelation"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 107,
  },
  {
    canonical: "Junia",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Figure mentioned in Romans 16:7, often identified as a female apostle.",
    status: "accepted",
    addedInEpisode: 107,
    episodes: [12, 16, 48, 52, 107, 136],
  },
  {
    canonical: "eldon epp",
    variations: ["epp"],
    category: "person",
    status: "rejected",
    addedInEpisode: 107,
  },
  {
    canonical: "sexual immorality",
    variations: ["porneia"],
    category: "theology",
    description:
      "Term used in the New Testament to denote various forms of sexual sin or transgression",
    status: "proposed",
    addedInEpisode: 108,
  },
  {
    canonical: "Song of Songs",
    variations: ["Song of Solomon"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 108,
  },
  {
    canonical: "Orthodox",
    variations: ["Eastern Orthodox"],
    category: "religion",
    status: "rejected",
    addedInEpisode: 109,
  },
  {
    canonical: "Pope Gregory",
    variations: ["Gregory"],
    category: "person",
    description:
      "Likely refers to Pope Gregory XIII, who introduced the Gregorian calendar",
    status: "proposed",
    addedInEpisode: 109,
  },
  {
    canonical: "Athens",
    variations: [],
    category: "place",
    status: "rejected",
    addedInEpisode: 109,
  },
  {
    canonical: "Resurrection",
    variations: [],
    category: "theology",
    status: "rejected",
    addedInEpisode: 109,
  },
  {
    canonical: "World Council of Churches",
    variations: [],
    category: "religion",
    description:
      "International ecumenical organization founded in 1948 to promote Christian unity",
    status: "proposed",
    addedInEpisode: 109,
  },
  {
    canonical: "Anglican Communion",
    variations: [],
    category: "religion",
    description:
      "International association of churches consisting of the Church of England and other national and regional churches in full communion with it.",
    status: "proposed",
    addedInEpisode: 109,
  },
  {
    canonical: "Colossians",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 110,
  },
  {
    canonical: "Philippians",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 110,
  },
  {
    canonical: "First Kings",
    variations: ["1 Kings"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 110,
  },
  {
    canonical: "Gilead",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "A mountainous region east of the Jordan River, mentioned in the Hebrew Bible",
    status: "accepted",
    addedInEpisode: 111,
    episodes: [29, 45, 74, 111, 120],
  },
  {
    canonical: "seleucid",
    variations: ["Seleucids"],
    category: "people",
    description: "A major Hellenistic dynasty that existed in the Near East",
    status: "proposed",
    addedInEpisode: 112,
  },
  {
    canonical: "Maccabees",
    variations: ["Maccabean"],
    category: "people",
    llmVerify: true,
    description:
      "The family who led the Jewish revolt against the Seleucid Empire in the 2nd century BCE",
    status: "accepted",
    addedInEpisode: 112,
    episodes: [
      11, 20, 26, 34, 43, 50, 55, 62, 70, 71, 85, 87, 112, 117, 123, 125, 137,
    ],
  },
  {
    canonical: "Judas Maccabeus",
    variations: ["Judas Maccabeus", "Judah Maccabee"],
    category: "person",
    llmVerify: true,
    description:
      "A Jewish priest and a son of Mattathias, who led the Maccabean revolt against the Seleucid Empire",
    status: "accepted",
    addedInEpisode: 112,
  },
  {
    canonical: "Hanukkah",
    variations: [],
    category: "event",
    status: "accepted",
    addedInEpisode: 112,
    episodes: [20, 112, 123],
  },
  {
    canonical: "Assumption of Moses",
    variations: [],
    category: "literature",
    llmVerify: true,
    description:
      "A pseudepigraphal Jewish text, a testament attributed to Moses",
    status: "accepted",
    addedInEpisode: 112,
    episodes: [112],
  },
  {
    canonical: "Charlie Kirk",
    variations: ["Kirk"],
    category: "person",
    status: "rejected",
    addedInEpisode: 113,
  },
  {
    canonical: "Hebrew Bible",
    variations: ["Old Testament"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 113,
  },
  {
    canonical: "Ezra-Nehemiah",
    variations: ["Ezra"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 113,
  },
  {
    canonical: "pride",
    variations: [],
    category: "theology",
    description:
      "The theological concept of excessive belief in one's own abilities; also, the positive sense of self-respect and dignity.",
    status: "proposed",
    caseSensitive: true,
    addedInEpisode: 114,
  },
  {
    canonical: "Mark Driscoll",
    variations: ["Driscoll"],
    category: "person",
    status: "rejected",
    addedInEpisode: 114,
  },
  {
    canonical: "Mars Hill Church",
    variations: ["Mars Hill"],
    category: "religion",
    status: "rejected",
    addedInEpisode: 114,
  },
  {
    canonical: "zerubbabel",
    variations: ["Zerubbabel's"],
    category: "person",
    description:
      "Governor of Judah during the reign of Darius I, who led the first group of Jewish exiles returning from Babylon. He played a key role in rebuilding the Second Temple in Jerusalem.",
    status: "proposed",
    addedInEpisode: 115,
  },
  {
    canonical: "Aaron Higashi",
    variations: ["Higashi", "Dr. Higashi"],
    category: "person",
    status: "rejected",
    addedInEpisode: 116,
  },
  {
    canonical: "Ken Stone",
    variations: ["Dr. Stone", "Professor Stone"],
    category: "person",
    status: "rejected",
    addedInEpisode: 116,
  },
  {
    canonical: "Allie Beth Stuckey",
    variations: ["Stuckey"],
    category: "person",
    status: "rejected",
    addedInEpisode: 117,
  },
  {
    canonical: "exile",
    variations: ["Babylonian exile"],
    category: "event",
    description: "Forced removal of people from their homeland.",
    status: "proposed",
    addedInEpisode: 117,
  },
  {
    canonical: "Ted Cruz",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 118,
  },
  {
    canonical: "Iran",
    variations: [],
    category: "place",
    description:
      "A country in the Middle East, often discussed in the context of its relationship with Israel and interpretations of biblical prophecy.",
    status: "proposed",
    addedInEpisode: 118,
  },
  {
    canonical: "Christian Zionism",
    variations: [],
    category: "miscellaneous",
    description:
      "A theological perspective that supports the modern state of Israel based on interpretations of biblical prophecy.",
    status: "accepted",
    addedInEpisode: 118,
    episodes: [118],
  },
  {
    canonical: "Christian Nationalists",
    variations: [],
    category: "people",
    description:
      "Group of people who combine Christian religious beliefs with American nationalism, often advocating for a particular vision of American identity and values.",
    status: "proposed",
    addedInEpisode: 118,
  },
  {
    canonical: "Edomites",
    variations: [],
    category: "people",
    status: "accepted",
    addedInEpisode: 118,
    episodes: [7, 81, 116, 118],
  },
  {
    canonical: "Olivet Discourse",
    variations: ["Olivet discourses"],
    category: "literature",
    description:
      "A discourse given by Jesus in the Synoptic Gospels concerning the destruction of the Temple in Jerusalem and the coming of the Son of Man.",
    status: "proposed",
    addedInEpisode: 119,
  },
  {
    canonical: "Dionysius of Alexandria",
    variations: ["Dionysius"],
    category: "person",
    llmVerify: true,
    description:
      "A 3rd-century bishop of Alexandria and theologian known for his writings and involvement in controversies of his time.",
    status: "accepted",
    addedInEpisode: 119,
    episodes: [4, 39, 119],
  },
  {
    canonical: "millennialism",
    variations: ["millenarianism"],
    category: "theology",
    description:
      "The belief in a future thousand-year reign of peace and righteousness, often associated with the return of Christ.",
    status: "proposed",
    addedInEpisode: 119,
  },
  {
    canonical: "Salvation",
    variations: [],
    category: "theology",
    llmVerify: true,
    description:
      "The concept of being saved from sin and its consequences, often associated with faith or divine intervention.",
    status: "accepted",
    addedInEpisode: 120,
    episodes: [
      6, 25, 26, 33, 36, 39, 43, 49, 54, 62, 70, 79, 81, 82, 87, 89, 91, 94, 98,
      101, 104, 119, 120, 124, 146, 152,
    ],
  },
  {
    canonical: "Abimelech",
    variations: ["Abimelek"],
    category: "character",
    llmVerify: true,
    description:
      "A Philistine king in Gerar who encountered both Abraham and Isaac, according to Genesis.",
    status: "accepted",
    addedInEpisode: 121,
    episodes: [20, 63, 121],
  },
  {
    canonical: "atonement",
    variations: [],
    category: "theology",
    llmVerify: true,
    description:
      "The concept of reconciliation between humanity and the divine, often involving reparation for wrongdoing",
    status: "accepted",
    addedInEpisode: 122,
    episodes: [22, 26, 79, 83, 85, 120, 122, 140, 142, 146],
  },
  {
    canonical: "hilasterion",
    variations: ["hilaskomai"],
    category: "theology",
    description:
      "Greek word meaning 'place of atonement' or 'expiation', used in Romans 3:25",
    status: "proposed",
    addedInEpisode: 122,
  },
  {
    canonical: "Gregory of Nyssa",
    variations: [],
    category: "person",
    status: "accepted",
    addedInEpisode: 122,
    episodes: [122],
  },
  {
    canonical: "Anselm of Canterbury",
    variations: ["Saint Anselm of Canterbury"],
    category: "person",
    status: "accepted",
    addedInEpisode: 122,
    episodes: [106, 122],
  },
  {
    canonical: "Jezebel",
    variations: ["Jezebel's"],
    category: "character",
    llmVerify: true,
    description:
      "Phoenician princess who married King Ahab and promoted the worship of Baal and Asherah, portrayed negatively in the Hebrew Bible",
    status: "accepted",
    addedInEpisode: 123,
    episodes: [39, 123],
  },
  {
    canonical: "Ahab",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "King of Israel in the 9th century BCE, husband of Jezebel, criticized for allowing the worship of Baal",
    status: "accepted",
    addedInEpisode: 123,
    episodes: [7, 29, 55, 120, 123],
  },
  {
    canonical: "Thyratira",
    variations: [],
    category: "place",
    status: "rejected",
    addedInEpisode: 123,
  },
  {
    canonical: "Asa",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "King of Judah, mentioned in 1 Kings, known for religious reforms.",
    status: "accepted",
    addedInEpisode: 125,
    episodes: [125],
  },
  {
    canonical: "151",
    variations: ["Psalm 151"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 125,
  },
  {
    canonical: "Letter of Jeremiah",
    variations: ["Epistle of Jeremiah"],
    category: "literature",
    status: "rejected",
    addedInEpisode: 126,
  },
  {
    canonical: "Shema",
    variations: ["Shema Yisrael"],
    category: "theology",
    description:
      "A Jewish prayer affirming monotheism, taken from Deuteronomy 6:4-9, Numbers 15:37-41, and Deuteronomy 11:13-21",
    status: "proposed",
    addedInEpisode: 126,
  },
  {
    canonical: "Nathan MacDonald",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 126,
  },
  {
    canonical: "Arad",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "An ancient site in the Negev desert, Israel, with archaeological remains including a Judahite temple",
    status: "accepted",
    addedInEpisode: 126,
    episodes: [13, 14, 22, 33, 72, 88, 102, 126],
  },
  {
    canonical: "common english bible",
    variations: [],
    category: "literature",
    description: "A translation of the bible.",
    status: "proposed",
    addedInEpisode: 127,
  },
  {
    canonical: "ben sommer",
    variations: ["sommer"],
    category: "person",
    status: "rejected",
    addedInEpisode: 127,
  },
  {
    canonical: "Hugo Mendez",
    variations: ["Mendez"],
    category: "person",
    status: "rejected",
    addedInEpisode: 128,
  },
  {
    canonical: "Pseudepigrapha",
    variations: ["pseudepigraphal", "pseudepigraphy"],
    category: "scholarship",
    status: "accepted",
    addedInEpisode: 128,
    episodes: [10, 11, 15, 19, 20, 28, 62, 100, 128],
  },
  {
    canonical: "Johannine Community",
    variations: [],
    category: "miscellaneous",
    description:
      "A hypothetical community thought to be the origin of the Gospel of John and the Johannine epistles.",
    status: "proposed",
    addedInEpisode: 128,
  },
  {
    canonical: "Polybius",
    variations: ["Polybios"],
    category: "person",
    llmVerify: true,
    description:
      "Greek historian of the Hellenistic period, known for The Histories.",
    status: "accepted",
    addedInEpisode: 128,
    episodes: [128],
  },
  {
    canonical: "Sea of Galilee",
    variations: [],
    category: "place",
    status: "accepted",
    addedInEpisode: 128,
    episodes: [7, 12, 13, 25, 28, 35, 40, 55, 64, 73, 84, 86, 87, 99, 128],
  },
  {
    canonical: "Aristobulus",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Jewish philosopher of the Second Temple period, known for his attempt to harmonize Greek philosophy and Jewish thought.",
    status: "accepted",
    addedInEpisode: 128,
    episodes: [100, 128],
  },
  {
    canonical: "Joash",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "The father of Gideon, who owned an altar to Baal",
    status: "accepted",
    addedInEpisode: 129,
    episodes: [129],
  },
  {
    canonical: "Ophrah",
    variations: ["at Ophrah"],
    category: "place",
    description: "A town associated with Gideon and his father Joash",
    status: "proposed",
    addedInEpisode: 129,
  },
  {
    canonical: "Zebah",
    variations: ["Zalmuna"],
    category: "character",
    description: "One of the kings of Midian defeated by Gideon",
    status: "proposed",
    addedInEpisode: 129,
  },
  {
    canonical: "Manasseh",
    variations: ["clan of Manasseh"],
    category: "people",
    description: "One of the tribes of Israel, from which Gideon came",
    status: "proposed",
    addedInEpisode: 129,
  },
  {
    canonical: "Hebrew",
    variations: ["Hebrew Bible"],
    category: "miscellaneous",
    status: "rejected",
    addedInEpisode: 130,
  },
  {
    canonical: "Jehoiakim",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "King of Judah during whose reign Jeremiah prophesied and whose actions led to the Babylonian exile.",
    status: "accepted",
    addedInEpisode: 130,
    episodes: [130],
  },
  {
    canonical: "Lil'",
    variations: [],
    category: "miscellaneous",
    status: "rejected",
    addedInEpisode: 131,
  },
  {
    canonical: "Ararat",
    variations: ["Mountains of Ararat"],
    category: "place",
    llmVerify: true,
    description:
      "A mountainous region mentioned in Genesis as the landing place of Noah's Ark.",
    status: "accepted",
    addedInEpisode: 131,
    episodes: [95, 131, 138],
  },
  {
    canonical: "Peter Thiel",
    variations: ["Thiel"],
    category: "person",
    status: "rejected",
    addedInEpisode: 132,
  },
  {
    canonical: "star of david",
    variations: ["Magen David"],
    category: "miscellaneous",
    description:
      "A six-pointed star (hexagram) that has become a widely recognized symbol of Judaism and Jewish identity, as well as Zionism and the State of Israel.",
    status: "proposed",
    addedInEpisode: 132,
  },
  {
    canonical: "silicon valley",
    variations: ["Silicon Valley"],
    category: "place",
    status: "rejected",
    addedInEpisode: 132,
  },
  {
    canonical: "thessalonica",
    variations: ["Thessaloniki"],
    category: "place",
    description:
      "An ancient city in Greece, mentioned in the New Testament as a place visited by Paul.",
    status: "proposed",
    addedInEpisode: 132,
  },
  {
    canonical: "Star of Remphan",
    variations: ["Remphan"],
    category: "miscellaneous",
    description:
      "A deity mentioned in Acts 7:43, possibly associated with Saturn, and linked by some conspiracy theorists to the Star of David.",
    status: "accepted",
    addedInEpisode: 132,
    episodes: [132, 150],
  },
  {
    canonical: "sex work",
    variations: [
      "prostitution",
      "sex worker",
      "sex workers",
      "wife of prostitution",
    ],
    category: "miscellaneous",
    status: "rejected",
    addedInEpisode: 133,
  },
  {
    canonical: "Northern Kingdom of Israel",
    variations: ["Northern Kingdom"],
    category: "place",
    description:
      "One of the two Israelite kingdoms that emerged after the split of the united monarchy",
    status: "proposed",
    addedInEpisode: 133,
  },
  {
    canonical: "Southern Kingdom of Judah",
    variations: ["Southern Kingdom"],
    category: "place",
    description:
      "One of the two Israelite kingdoms that emerged after the split of the united monarchy",
    status: "proposed",
    addedInEpisode: 133,
  },
  {
    canonical: "Ephraim",
    variations: [],
    category: "place",
    description:
      "A prominent tribe and region in the Northern Kingdom of Israel, often used as a synonym for the kingdom itself.",
    status: "proposed",
    addedInEpisode: 133,
  },
  {
    canonical: "Gomer",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "The wife of Hosea, often interpreted as a symbol of Israel's unfaithfulness to God.",
    status: "accepted",
    addedInEpisode: 133,
    episodes: [133],
  },
  {
    canonical: "Alexamenos Graffito",
    variations: [],
    category: "miscellaneous",
    description:
      "An ancient Roman graffito depicting a crucifixion scene, considered one of the earliest visual representations of Jesus' crucifixion",
    status: "proposed",
    addedInEpisode: 134,
  },
  {
    canonical: "Crucifixion",
    variations: ["crucify", "crucified"],
    category: "event",
    llmVerify: true,
    description:
      "A method of execution used by the Romans, specifically referring to the execution of Jesus on the cross",
    status: "accepted",
    addedInEpisode: 134,
    episodes: [
      5, 33, 38, 49, 50, 55, 83, 86, 87, 90, 98, 101, 132, 134, 136, 140, 144,
      156,
    ],
  },
  {
    canonical: "Greco-Roman",
    variations: [],
    category: "miscellaneous",
    description:
      "Relating to the culture and civilization of ancient Greece and Rome",
    status: "rejected",
    addedInEpisode: 135,
  },
  {
    canonical: "Anunnaki",
    variations: ["Anunnaki/Nephilim"],
    category: "miscellaneous",
    description:
      "A group of deities in ancient Mesopotamian cultures (Sumerian, Akkadian, Assyrian, and Babylonian)",
    status: "proposed",
    addedInEpisode: 135,
  },
  {
    canonical: "Zechariah Sitchin",
    variations: ["Sitchin"],
    category: "person",
    status: "rejected",
    addedInEpisode: 135,
  },
  {
    canonical: "Nibiru",
    variations: [],
    category: "miscellaneous",
    description:
      "A celestial object in Zecharia Sitchin's interpretation of ancient astronauts theory.",
    status: "proposed",
    addedInEpisode: 135,
  },
  {
    canonical: "Michael Peppard",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 136,
  },
  {
    canonical: "Epistle",
    variations: [],
    category: "literature",
    status: "rejected",
    addedInEpisode: 136,
  },
  {
    canonical: "Vatican II",
    variations: [],
    category: "event",
    description:
      "The Second Vatican Council, a gathering of Catholic leaders in the 1960s that led to significant reforms",
    status: "proposed",
    addedInEpisode: 136,
  },
  {
    canonical: "Marcion",
    variations: [],
    category: "person",
    llmVerify: true,
    description: "Early Christian theologian who rejected the Old Testament",
    status: "accepted",
    addedInEpisode: 136,
    episodes: [6, 35, 69, 94, 119, 136],
  },
  {
    canonical: "Annunciation",
    variations: [],
    category: "event",
    llmVerify: true,
    description:
      "The announcement by the angel Gabriel to the Virgin Mary that she would conceive and become the mother of Jesus",
    status: "accepted",
    addedInEpisode: 136,
    episodes: [28, 86, 136, 140],
  },
  {
    canonical: "Geez",
    variations: [],
    category: "miscellaneous",
    description:
      "Ancient South Semitic language, used as the liturgical language of the Ethiopian Orthodox Church.",
    status: "rejected",
    addedInEpisode: 137,
  },
  {
    canonical: "Sukkot",
    variations: ["Festival of Booths", "Festival of Tabernacles"],
    category: "event",
    llmVerify: true,
    description:
      "Jewish harvest festival, also known as Sukkot or the Festival of Booths.",
    status: "accepted",
    addedInEpisode: 137,
    episodes: [29, 137],
  },
  {
    canonical: "Chris Harrison",
    variations: ["Harrison"],
    category: "person",
    description:
      "One of the creators of the Bible Cross-Reference Visualization chart.",
    status: "rejected",
    addedInEpisode: 137,
  },
  {
    canonical: "Hermeneia",
    variations: [],
    category: "scholarship",
    llmVerify: true,
    description:
      "Academic commentary series on the Bible, known for its scholarly rigor and detailed analysis.",
    status: "accepted",
    addedInEpisode: 137,
    episodes: [26, 34, 62, 89, 99, 104, 106, 137],
  },
  {
    canonical: "Adam Lambert",
    variations: [],
    category: "person",
    status: "rejected",
    addedInEpisode: 137,
  },
  {
    canonical: "Quran",
    variations: [],
    category: "literature",
    llmVerify: true,
    description:
      "Central religious text of Islam, believed by Muslims to be the word of God as revealed to Muhammad.",
    status: "accepted",
    addedInEpisode: 137,
    episodes: [6, 9, 43, 81, 102, 137],
  },
  {
    canonical: "Hyksos",
    variations: [],
    category: "people",
    description:
      "A group of West Asian rulers who took over a portion of Egypt during the Second Intermediate Period (c. 1650-1550 BCE)",
    status: "accepted",
    addedInEpisode: 138,
    episodes: [138],
  },
  {
    canonical: "thessalonians",
    variations: ["thessalonian"],
    category: "people",
    description:
      "The people to whom the letters of 1 and 2 Thessalonians were supposedly written",
    status: "proposed",
    addedInEpisode: 138,
  },
  {
    canonical: "SNAP",
    variations: [],
    category: "miscellaneous",
    status: "rejected",
    addedInEpisode: 138,
  },
  {
    canonical: "Rehoboam",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Son of Solomon, first king of Judah after the split of the United Kingdom of Israel",
    status: "accepted",
    addedInEpisode: 139,
    episodes: [64, 139],
  },
  {
    canonical: "Rezin",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "The son of Eliada who had fled from his master King Hadadezer of Zobah, he made trouble in Solomon's neighborhood",
    status: "accepted",
    addedInEpisode: 139,
    episodes: [139],
  },
  {
    canonical: "Shishak",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "An Egyptian pharaoh, likely Ramses II, who is mentioned in the Hebrew Bible for his campaign in Judah during the reign of Rehoboam",
    status: "accepted",
    addedInEpisode: 139,
    episodes: [139],
  },
  {
    canonical: "Ahijah the Shilonite",
    variations: [],
    category: "character",
    description:
      "A prophet from Shiloh who appears in the Books of Kings in the Hebrew Bible, known for his role in anointing Jeroboam as king over the northern tribes of Israel",
    status: "proposed",
    addedInEpisode: 139,
  },
  {
    canonical: "Bethsaida",
    variations: ["el-araj"],
    category: "place",
    description:
      "A city on the northeastern shore of the Sea of Galilee, mentioned in the Gospels.",
    status: "proposed",
    addedInEpisode: 143,
  },
  {
    canonical: "disciples",
    variations: ["apostles"],
    category: "miscellaneous",
    description: "Followers of Jesus during his ministry",
    status: "proposed",
    addedInEpisode: 143,
  },
  {
    canonical: "kingdom of god",
    variations: [],
    category: "theology",
    description:
      "A central concept in the teachings of Jesus, referring to the reign or rule of God.",
    status: "rejected",
    addedInEpisode: 143,
  },
  {
    canonical: "Jordan",
    variations: ["River Jordan"],
    category: "place",
    description:
      "Jordan River, a river in the Middle East that flows into the Dead Sea",
    status: "proposed",
    addedInEpisode: 145,
  },
  {
    canonical: "Messiah",
    variations: ["Messiah's", "the Messiah"],
    category: "theology",
    description:
      "The anticipated king and deliverer of the Jewish people; in Christianity, Jesus is considered the Messiah",
    status: "rejected",
    addedInEpisode: 145,
  },
  {
    canonical: "Esarhaddon",
    variations: [],
    category: "person",
    description:
      "King of Assyria in the early 7th century BCE, successor to Sennacherib, known for the Vassal Treaty of Esarhaddon",
    status: "accepted",
    addedInEpisode: 146,
    episodes: [108, 126, 145, 146],
  },
  {
    canonical: "Ashurbanipal",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "King of Assyria in the mid-7th century BCE, known for his vast library and military campaigns",
    status: "accepted",
    addedInEpisode: 146,
    episodes: [126, 146],
  },
  {
    canonical: "Purim",
    variations: ["Pur"],
    category: "event",
    llmVerify: true,
    description:
      "A Jewish holiday commemorating the saving of the Jews from Haman's plot to annihilate them, as recounted in the Book of Esther",
    status: "accepted",
    addedInEpisode: 147,
    episodes: [3, 147],
  },
  {
    canonical: "Haman",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "The main antagonist in the Book of Esther, an Agagite who plotted to destroy all the Jews in Persia",
    status: "accepted",
    addedInEpisode: 147,
    episodes: [147],
  },
  {
    canonical: "Mordecai",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Esther's cousin and guardian in the Book of Esther, who plays a key role in thwarting Haman's plot",
    status: "accepted",
    addedInEpisode: 147,
    episodes: [147],
  },
  {
    canonical: "Acts of Paul and Thecla",
    variations: [],
    category: "literature",
    llmVerify: true,
    description:
      "A 2nd-century CE apocryphal text recounting the story of Thecla's conversion and adventures with the apostle Paul.",
    status: "accepted",
    addedInEpisode: 148,
    episodes: [33, 148],
  },
  {
    canonical: "Demas",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A companion of Paul mentioned in the New Testament, who later deserted him according to 2 Timothy.",
    status: "accepted",
    addedInEpisode: 148,
    episodes: [100, 148],
  },
  {
    canonical: "Hermogenes",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Mentioned in 2 Timothy 1:15, a figure who turned away from Paul's teachings.",
    status: "accepted",
    addedInEpisode: 148,
    episodes: [148],
  },
  {
    canonical: "Iconium",
    variations: ["Iconians"],
    category: "place",
    description:
      "An ancient city in Asia Minor, present-day Konya, Turkey, visited by Paul and Barnabas.",
    status: "proposed",
    addedInEpisode: 148,
  },
  {
    canonical: "Onesiphorus",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A Christian mentioned in 2 Timothy, known for his kindness to Paul.",
    status: "accepted",
    addedInEpisode: 148,
    episodes: [148],
  },
  {
    canonical: "Castelius",
    variations: [],
    category: "person",
    description:
      "The governor mentioned in the Acts of Paul and Thecla before whom Paul is brought.",
    status: "proposed",
    addedInEpisode: 148,
  },
  {
    canonical: "Jennifer Garcia-Bashaw",
    variations: ["Jen"],
    category: "person",
    description:
      "Professor at Campbell University and an ordained Baptist minister, with a PhD in New Testament from Fuller Seminary. She is the co-author of 'Serving Up Scripture'.",
    status: "rejected",
    addedInEpisode: 149,
  },
  {
    canonical: "Chicago Theological Seminary",
    variations: [],
    category: "scholarship",
    description:
      "A seminary located in Chicago, Illinois, known for its progressive and interreligious approach to theological education.",
    status: "proposed",
    addedInEpisode: 149,
  },
  {
    canonical: "Contextual theology",
    variations: [],
    category: "theology",
    description:
      "An approach to theology that takes into account the specific historical, cultural, and social context in which it is being developed.",
    status: "proposed",
    addedInEpisode: 149,
  },
  {
    canonical: "Black theology",
    variations: [],
    category: "theology",
    description:
      "A theological perspective that emphasizes the experiences and concerns of Black people, often focusing on liberation and social justice.",
    status: "proposed",
    addedInEpisode: 149,
  },
  {
    canonical: "feminist theology",
    variations: [],
    category: "theology",
    description:
      "A theological perspective that critically examines religious traditions and practices from a feminist perspective, often challenging patriarchal structures and promoting gender equality.",
    status: "proposed",
    addedInEpisode: 149,
  },
  {
    canonical: "Stephen",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "A deacon in the early church in Jerusalem who was stoned to death for his faith, as recorded in the Book of Acts.",
    status: "accepted",
    addedInEpisode: 149,
    episodes: [132, 149, 150],
  },
  {
    canonical: "Ethiopian Orthodox",
    variations: ["Ethiopian Orthodox Tewahedo Church"],
    category: "religion",
    description:
      "An ancient branch of Orthodox Christianity primarily practiced in Ethiopia and Eritrea, known for its unique traditions and biblical canon",
    status: "proposed",
    addedInEpisode: 151,
  },
  {
    canonical: "Beatitudes",
    variations: ["The Beatitudes"],
    category: "theology",
    llmVerify: true,
    description:
      "A set of teachings by Jesus in the Sermon on the Mount (Matthew 5:3-12), expressing ideals of humility, compassion, and righteousness",
    status: "accepted",
    addedInEpisode: 151,
    episodes: [19, 25, 91, 101, 110, 118, 146, 151],
  },
  {
    canonical: "Augustine",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "Early Christian theologian and philosopher, bishop of Hippo Regius, whose writings influenced the development of Western Christianity",
    status: "accepted",
    addedInEpisode: 152,
    episodes: [19, 44, 70, 77, 89, 98, 120, 140, 142, 149, 152],
  },
  {
    canonical: "Galileo",
    variations: [],
    category: "person",
    description:
      "Italian astronomer, physicist and engineer whose observations provided evidence for heliocentrism, leading to conflict with the Catholic Church",
    status: "rejected",
    addedInEpisode: 152,
  },
  {
    canonical: "Rabbi Akiva",
    variations: ["Akiva"],
    category: "person",
    description:
      "A Jewish sage of the late first and early second centuries CE, influential in the development of rabbinic Judaism.",
    status: "proposed",
    addedInEpisode: 154,
  },
  {
    canonical: "Common Era",
    variations: [],
    category: "miscellaneous",
    description:
      "CE, also known as AD, this is a secular dating system that is used as an alternative to the BC/AD notation.",
    status: "rejected",
    addedInEpisode: 154,
  },
  {
    canonical: "Unprotected Texts",
    variations: [],
    category: "literature",
    description:
      "A book by Jennifer Knust examining surprising contradictions about sex and desire in the Bible.",
    status: "proposed",
    addedInEpisode: 154,
  },
  {
    canonical: "Letter of Aristeas",
    variations: ["Aristeas"],
    category: "literature",
    llmVerify: true,
    description:
      "A pseudepigraphic letter that purports to be from Aristeas to his brother Philocrates, describing the translation of the Hebrew Bible into Greek, which is traditionally known as the Septuagint.",
    status: "accepted",
    addedInEpisode: 155,
    episodes: [11, 39, 100, 130, 142, 155],
  },
  {
    canonical: "Pentateuch",
    variations: ["First 5 books of Moses"],
    category: "literature",
    description:
      "The first five books of the Hebrew Bible: Genesis, Exodus, Leviticus, Numbers, and Deuteronomy; traditionally ascribed to Moses.",
    status: "rejected",
    addedInEpisode: 155,
  },
  {
    canonical: "Alexandria",
    variations: [],
    category: "place",
    description:
      "An ancient city in Egypt founded by Alexander the Great, known for its Great Library and as a center of Hellenistic culture.",
    status: "proposed",
    addedInEpisode: 155,
  },
  {
    canonical: "Demetrius of Phalerum",
    variations: [],
    category: "person",
    description:
      "An Athenian statesman, orator, and philosopher who served as a librarian in Alexandria under Ptolemy I Soter.",
    status: "rejected",
    addedInEpisode: 155,
  },
  {
    canonical: "Ptolemy II Philadelphus",
    variations: ["Ptolemy II"],
    category: "person",
    description:
      "A pharaoh of Ptolemaic Egypt who reigned in the 3rd century BCE, known for his patronage of the Library of Alexandria and involvement in the Septuagint translation.",
    status: "proposed",
    addedInEpisode: 155,
  },
  {
    canonical: "Philocrates",
    variations: ["Aristeas"],
    category: "person",
    description:
      "The (fictional) brother of Aristeas to whom the Letter of Aristeas is addressed.",
    status: "rejected",
    addedInEpisode: 155,
  },
  {
    canonical: "Amalek",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Figure in the Hebrew Bible, grandson of Esau, also used as a collective name for the Amalekites",
    status: "accepted",
    addedInEpisode: 156,
    episodes: [40, 156],
  },
  {
    canonical: "amalekites",
    variations: ["amalekite"],
    category: "people",
    description:
      "Ancient nomadic people who opposed the Israelites in the Hebrew Bible, often associated with conflict and enmity",
    status: "proposed",
    addedInEpisode: 156,
  },
  {
    canonical: "herem",
    variations: ["haram"],
    category: "theology",
    description:
      "Concept in the Hebrew Bible referring to things or people devoted to destruction as an offering to God, often in the context of warfare",
    status: "proposed",
    addedInEpisode: 156,
  },
  {
    canonical: "kenites",
    variations: ["kenite"],
    category: "people",
    description:
      "Nomadic tribe in the Hebrew Bible, sometimes associated with the Midianites and connected to Moses' father-in-law",
    status: "proposed",
    addedInEpisode: 156,
  },
  {
    canonical: "Agag",
    variations: ["king agag"],
    category: "character",
    llmVerify: true,
    description:
      "King of the Amalekites who was spared by Saul but later executed by Samuel",
    status: "accepted",
    addedInEpisode: 156,
    episodes: [156],
  },
  {
    canonical: "Ziklag",
    variations: [],
    category: "place",
    llmVerify: true,
    description:
      "Town given to David by the Philistine king Achish, later raided by the Amalekites",
    status: "accepted",
    addedInEpisode: 156,
    episodes: [156],
  },
  {
    canonical: "benjamin netanyahu",
    variations: ["netanyahu"],
    category: "person",
    description:
      "Current Prime Minister of Israel, who has invoked the story of Amalek in reference to modern conflicts",
    status: "rejected",
    addedInEpisode: 156,
  },
  {
    canonical: "crucified",
    variations: [],
    category: "event",
    description:
      "Affixing someone to a cross as a form of torture and execution.",
    status: "rejected",
    addedInEpisode: 156,
  },
  {
    canonical: "Philip",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "Apostle in the New Testament.",
    status: "accepted",
    addedInEpisode: 156,
    episodes: [16, 143, 149, 156],
  },
  {
    canonical: "Thaddeus",
    variations: [],
    category: "character",
    llmVerify: true,
    description: "An apostle of Jesus, mentioned in the New Testament",
    status: "accepted",
    episodes: [16, 156],
  },
  {
    canonical: "Jesus",
    variations: [],
    category: "character",
    description:
      "Central figure in Christianity, believed to be the Messiah and Son of God.",
    status: "rejected",
    addedInEpisode: 143,
  },
  {
    canonical: "Transfiguration",
    variations: ["transfigure"],
    category: "event",
    llmVerify: true,
    description:
      "A miraculous event in the New Testament where Jesus is transfigured and appears in glory alongside Moses and Elijah.",
    status: "accepted",
    addedInEpisode: 143,
    episodes: [128, 143],
  },
  {
    canonical: "5000",
    variations: [],
    category: "miscellaneous",
    description: "Reference to the feeding of the 5000 miracle narrative.",
    status: "rejected",
    addedInEpisode: 143,
  },
  {
    canonical: "Esther",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Jewish queen of Persia in the Book of Esther who hides her identity, becomes queen, and intercedes to save the Jews from Haman.",
    status: "accepted",
    episodes: [3, 6, 20, 34, 36, 40, 45, 63, 94, 136, 144, 147, 154],
  },
  {
    canonical: "Preterism",
    variations: ["preterist"],
    category: "theology",
    llmVerify: true,
    description:
      "Christian eschatological view or belief that interprets some (partial preterism) or all (full preterism) prophecies of the Bible as events which have already been fulfilled in history",
    status: "accepted",
    episodes: [4, 32, 39, 118, 119],
  },
  {
    canonical: "Israel",
    variations: ["Israelite", "Israelites"],
    category: "people",
    description:
      "Ancient Israelite nation or people, often referring to the descendants of Jacob; name also used for the Northern Kingdom",
    status: "proposed",
  },
  {
    canonical: "Egypt",
    variations: ["Egyptian", "Egyptians"],
    category: "place",
    description:
      "Ancient civilization in North Africa, known for its pharaohs, pyramids, and complex religious beliefs",
    status: "proposed",
  },
  {
    canonical: "Serpent",
    variations: ["serpent's"],
    category: "character",
    description:
      "The talking snake in the Genesis story of the Garden of Eden, who tempts Eve to eat the forbidden fruit.",
    status: "proposed",
  },
  {
    canonical: "Francesca Stavrakopoulou",
    variations: ["Professor Stavrakopoulou"],
    category: "person",
    description:
      "Professor of Hebrew Bible and Ancient Religion at Exeter University. Guest on the podcast",
    status: "proposed",
  },
  {
    canonical: "academia",
    variations: ["academic"],
    category: "miscellaneous",
    description: "The academic world, higher education system",
    status: "proposed",
  },
  {
    canonical: "Atheism",
    variations: ["atheist"],
    category: "theology",
    description:
      "Disbelief in the existence of God or gods; the absence of religious belief",
    status: "accepted",
    episodes: [
      2, 4, 6, 8, 16, 24, 37, 40, 51, 59, 65, 71, 77, 78, 91, 103, 113, 119,
      120, 124, 132, 146, 148,
    ],
  },
  {
    canonical: "theology",
    variations: ["theologian"],
    category: "theology",
    description:
      "The study of God and religious beliefs, often from a confessional or faith-based perspective",
    status: "proposed",
  },
  {
    canonical: "el",
    variations: ["Elohim"],
    category: "character",
    description:
      "The high god in the Canaanite pantheon, often associated with wisdom and authority",
    status: "proposed",
  },
  {
    canonical: "anat",
    variations: ["Anath"],
    category: "character",
    description:
      "A prominent goddess in the Canaanite pantheon, known for her fierce and warlike nature",
    status: "proposed",
  },
  {
    canonical: "exeter",
    variations: [],
    category: "place",
    description: "A city in England, location of Exeter University",
    status: "proposed",
  },
  {
    canonical: "Angel",
    variations: ["cherub", "seraph"],
    category: "theology",
    llmVerify: true,
    description:
      "Divine messengers or supernatural beings who appear in biblical narratives, often serving as intermediaries between God and humans.",
    status: "accepted",
    episodes: [
      3, 4, 5, 7, 12, 17, 18, 19, 27, 28, 33, 37, 39, 42, 55, 58, 61, 62, 63,
      64, 70, 71, 72, 87, 91, 92, 95, 104, 120, 124, 125, 126, 129, 135, 136,
      137, 140, 141, 142, 150, 157,
    ],
  },
  {
    canonical: "Museum of the Bible",
    variations: ["the Museum of the Bible"],
    category: "miscellaneous",
    description:
      "A museum in Washington D.C. dedicated to the history, narrative, and impact of the Bible.",
    status: "proposed",
  },
  {
    canonical: "archaeologists",
    variations: ["archaeologist"],
    category: "person",
    description:
      "People who study human history and prehistory by excavating sites and analyzing artifacts.",
    status: "rejected",
  },
  {
    canonical: "Bart Ehrman",
    variations: ["Ehrman"],
    category: "person",
    description:
      "New Testament scholar and professor at UNC Chapel Hill, known for work on textual criticism and early Christianity",
    status: "rejected",
  },
  {
    canonical: "Bruce Metzger",
    variations: [],
    category: "person",
    description: "A New Testament scholar and textual critic",
    status: "rejected",
  },
  {
    canonical: "Inanna",
    variations: [],
    category: "character",
    description:
      "Sumerian goddess of love, war, and fertility, counterpart to the Akkadian goddess Ishtar",
    status: "proposed",
  },
  {
    canonical: "Ishtar",
    variations: [],
    category: "character",
    description:
      "Akkadian goddess of love, war, and fertility, associated with the planet Venus",
    status: "proposed",
  },
  {
    canonical: "Eostre",
    variations: ["Ostara"],
    category: "character",
    description:
      "Germanic goddess associated with spring and the origin of the name 'Easter'",
    status: "proposed",
  },
  {
    canonical: "Bede",
    variations: ["Beda"],
    category: "person",
    description:
      "An English monk and scholar who wrote about Eostre and the origins of Easter",
    status: "rejected",
  },
  {
    canonical: "chromicles",
    variations: ["book of chronicles"],
    category: "literature",
    description: "Books of Chronicles in the Hebrew Bible/Old Testament",
    status: "proposed",
  },
  {
    canonical: "King Mesha",
    variations: ["Mesha"],
    category: "person",
    description:
      "King of Moab in the 9th century BCE, known for the Mesha Stele",
    status: "proposed",
  },
  {
    canonical: "Chemosh",
    variations: [],
    category: "character",
    description:
      "The national god of the Moabites, mentioned in the Hebrew Bible and the Mesha Stele",
    status: "proposed",
  },
  {
    canonical: "Elisha",
    variations: [],
    category: "character",
    description:
      "A prophet in the Northern Kingdom of Israel, successor to Elijah",
    status: "proposed",
  },
  {
    canonical: "King Jehoshaphat",
    variations: ["Jehoshaphat"],
    category: "person",
    description:
      "King of Judah in the 9th century BCE, mentioned in the Books of Kings and Chronicles",
    status: "proposed",
  },
  {
    canonical: "Dan McClellan",
    variations: ["McClellan"],
    category: "person",
    description: "Co-host of Data Over Dogma podcast",
    status: "proposed",
  },
  {
    canonical: "Colorado Springs",
    variations: ["Colorado"],
    category: "place",
    description: "City in Colorado where Aaron Higashi grew up",
    status: "proposed",
  },
  {
    canonical: "TikTok",
    variations: [],
    category: "miscellaneous",
    description:
      "Social media platform used by the hosts and guest to share biblical content",
    status: "proposed",
  },
  {
    canonical: "Hermeneutics",
    variations: ["hermeneutic"],
    category: "scholarship",
    description:
      "The study of the principles of interpretation of texts, especially the Bible",
    status: "proposed",
  },
  {
    canonical: "greco-roman world",
    variations: ["Greco-Roman"],
    category: "place",
    description:
      "The cultural and historical context of the ancient Mediterranean world, encompassing both Greek and Roman influences.",
    status: "proposed",
  },
  {
    canonical: "protoype theory",
    variations: ["cognitive exemplar"],
    category: "scholarship",
    description:
      "A cognitive theory of categorization that suggests people classify objects and concepts based on their similarity to a mental prototype or exemplar.",
    status: "proposed",
  },
  {
    canonical: "definitions",
    variations: ["definition"],
    category: "miscellaneous",
    description:
      "The act of precisely identifying or describing the nature, scope, or meaning of something.",
    status: "rejected",
  },
  {
    canonical: "sexuality",
    variations: [],
    category: "miscellaneous",
    description:
      "The expression of sexual receptivity or interest and/or behavior.",
    status: "proposed",
  },
  {
    canonical: "alphabet of ben sira",
    variations: [],
    category: "literature",
    description:
      "A medieval Jewish text known for its satirical and humorous content, including the story of Lilith",
    status: "proposed",
  },
  {
    canonical: "mesopotamia",
    variations: [],
    category: "place",
    description:
      "An ancient region in Western Asia located within the Tigris-Euphrates river system",
    status: "proposed",
  },
  {
    canonical: "ptolemies",
    variations: [],
    category: "people",
    description:
      "The dynasty that ruled Egypt from 305 to 30 BCE, founded by Ptolemy I Soter, a general of Alexander the Great.",
    status: "proposed",
  },
  {
    canonical: "theodotion",
    variations: [],
    category: "person",
    description:
      "A Jewish scholar of the 2nd century CE who created a recension (revision) of the Septuagint.",
    status: "proposed",
  },
  {
    canonical: "symmachus",
    variations: [],
    category: "person",
    description:
      "One of the three main figures who created recensions (revisions) of the Septuagint in the 2nd century CE.",
    status: "proposed",
  },
  {
    canonical: "elizabeth schrader polczer",
    variations: [
      "Elizabeth",
      "Dr. Elizabeth Schrader Polczer",
      "Schrader Polczer",
    ],
    category: "person",
    description:
      "Scholar specializing in New Testament and Mary Magdalene research.",
    status: "proposed",
  },
  {
    canonical: "manuscripts",
    variations: ["manuscript"],
    category: "miscellaneous",
    description:
      "Handwritten copies of ancient texts, particularly relevant to textual criticism.",
    status: "proposed",
  },
  {
    canonical: "textual criticism",
    variations: ["text critic"],
    category: "scholarship",
    description:
      "The study of ancient texts to determine their original wording, often dealing with textual variants.",
    status: "proposed",
  },
  {
    canonical: "mary of bethany",
    variations: ["Bethany"],
    category: "character",
    description:
      "A woman mentioned in the Gospels, particularly in John, as being a sister of Lazarus and Martha.",
    status: "proposed",
  },
  {
    canonical: "martha",
    variations: ["Martha of Bethany"],
    category: "character",
    description:
      "A woman mentioned in the Gospels, particularly in Luke and John, often associated with her sister Mary and their interactions with Jesus.",
    status: "proposed",
  },
  {
    canonical: "peter gurry",
    variations: ["Gurry", "Peter"],
    category: "person",
    description:
      "Scholar known for his work on textual criticism of the New Testament.",
    status: "proposed",
  },
  {
    canonical: "hippolytus of rome",
    variations: ["Hippolytus"],
    category: "person",
    description:
      "A third-century Christian theologian and martyr, known for his writings and commentaries.",
    status: "proposed",
  },
  {
    canonical: "the gospel of mary",
    variations: ["gospel of mary"],
    category: "literature",
    description:
      "A non-canonical Gnostic gospel that features Mary Magdalene as a prominent figure.",
    status: "proposed",
  },
  {
    canonical: "gospel of philip",
    variations: ["gospel of philip"],
    category: "literature",
    description:
      "A Gnostic gospel that presents a unique perspective on Jesus and his relationship with Mary Magdalene.",
    status: "proposed",
  },
  {
    canonical: "last supper",
    variations: ["the Last Supper"],
    category: "event",
    description:
      "The final meal Jesus shared with his apostles before his crucifixion.",
    status: "proposed",
  },
  {
    canonical: "papyrys 66",
    variations: ["P66", "papyrus 66"],
    category: "literature",
    description: "Early manuscript containing portions of the Gospel of John.",
    status: "proposed",
  },
  {
    canonical: "David Burnett",
    variations: ["Burnett"],
    category: "person",
    description:
      "Friend of Dan McClellan, PhD student at Edinburgh, joined the tour in Israel/Palestine.",
    status: "proposed",
  },
  {
    canonical: "Palestine",
    variations: [],
    category: "place",
    description:
      "Geographic region in the Middle East, contested territory between Israel and Palestinian Arabs.",
    status: "proposed",
  },
  {
    canonical: "Valley of Elah",
    variations: [],
    category: "place",
    description:
      "A valley in the Shephelah region of Israel, traditionally the site of the battle between David and Goliath.",
    status: "proposed",
  },
  {
    canonical: "John Walton",
    variations: ["Walton"],
    category: "person",
    description:
      "Old Testament scholar known for his work on Genesis and the ancient Near Eastern context of the Bible.",
    status: "proposed",
  },
  {
    canonical: "The Holy Land",
    variations: [],
    category: "place",
    description:
      "A region of religious significance centered on Israel and Palestine, considered sacred in Judaism, Christianity, and Islam.",
    status: "proposed",
  },
  {
    canonical: "Anciently",
    variations: [],
    category: "miscellaneous",
    description: "A archaic way of saying, 'In ancient times'",
    status: "proposed",
  },
  {
    canonical: "Qeiyafa",
    variations: [],
    category: "place",
    description:
      "Archaeological site in Israel, possibly identified as the biblical Shaaraim.",
    status: "proposed",
  },
  {
    canonical: "Azekah",
    variations: [],
    category: "place",
    description:
      "An ancient city in Judah, mentioned in connection with Lachish and the Babylonian invasion.",
    status: "proposed",
  },
  {
    canonical: "Byzantine",
    variations: ["Byzantine period"],
    category: "event",
    description:
      "Relating to Byzantium or the Byzantine Empire, also known as the Eastern Roman Empire.",
    status: "proposed",
  },
  {
    canonical: "Sarah McLachlan",
    variations: ["McLachlan"],
    category: "person",
    description:
      "A Canadian singer and songwriter who named a music festival after Lilith in the 1990s.",
    status: "proposed",
  },
  {
    canonical: "Akkadian",
    variations: [],
    category: "miscellaneous",
    description:
      "An ancient Semitic language spoken in Mesopotamia, related to Hebrew and Aramaic.",
    status: "proposed",
  },
  {
    canonical: "Sumerian",
    variations: ["Sumerian word"],
    category: "miscellaneous",
    description:
      "The language of ancient Sumer, a language isolate unrelated to Akkadian.",
    status: "proposed",
  },
  {
    canonical: "amulets",
    variations: ["amulet"],
    category: "miscellaneous",
    description:
      "Charms or objects believed to have protective powers, used in ancient times to ward off evil spirits or harm.",
    status: "proposed",
  },
  {
    canonical: "Stele",
    variations: ["stelae", "stela"],
    category: "miscellaneous",
    llmVerify: true,
    description:
      "An upright stone slab or pillar, often inscribed or carved, used as a monument or marker.",
    status: "accepted",
    episodes: [2, 7, 14, 36, 46, 64, 65, 66, 86, 139],
  },
  {
    canonical: "Carlton Pearson",
    variations: [],
    category: "person",
    description:
      "A former Pentecostal pastor who became known for his belief in universal reconciliation, the idea that hell does not exist and all people will ultimately be saved.",
    status: "rejected",
  },
  {
    canonical: "Simon",
    variations: [],
    category: "character",
    description:
      "A common Hebrew name, the Greek form of Shimon; Several figures in the New Testament bear this name",
    status: "proposed",
    caseSensitive: true,
  },
  {
    canonical: "Kephas",
    variations: ["Cephas"],
    category: "character",
    description:
      "The Aramaic name given to Simon Peter by Jesus, meaning 'rock'",
    status: "proposed",
  },
  {
    canonical: "Aramaic",
    variations: ["Aramaic word"],
    category: "miscellaneous",
    description: "A Northwest Semitic language closely related to Hebrew",
    status: "proposed",
  },
  {
    canonical: "John Chrysostom",
    variations: ["Chrysostom"],
    category: "person",
    llmVerify: true,
    description:
      "An early Church Father and Archbishop of Constantinople, known for his eloquence in preaching and denunciation of abuse of authority.",
    status: "accepted",
    episodes: [16],
  },
  {
    canonical: "Geneva Bible",
    variations: ["geneva bible"],
    category: "literature",
    description:
      "English translation of the Bible published in 1560 in Geneva, Switzerland; known for its extensive annotations and its influence on Puritanism.",
    status: "proposed",
  },
  {
    canonical: "Bishops' Bible",
    variations: ["bishops bible"],
    category: "literature",
    description:
      "English translation of the Bible published in 1568 under the authority of the Church of England.",
    status: "proposed",
  },
  {
    canonical: "Church of England",
    variations: ["Anglicans"],
    category: "religion",
    description:
      "The established Christian church in England and the mother church of the Anglican Communion.",
    status: "proposed",
  },
  {
    canonical: "Puritans",
    variations: ["Puritan"],
    category: "people",
    description:
      "English Protestants in the 16th and 17th centuries who sought to purify the Church of England from what they considered to be remaining Catholic practices.",
    status: "proposed",
  },
  {
    canonical: "Malak Adonai",
    variations: [],
    category: "theology",
    description:
      "Hebrew term meaning 'angel of the Lord,' often interpreted as a manifestation of God or a high-ranking angel.",
    status: "proposed",
  },
  {
    canonical: "Balak",
    variations: [],
    category: "character",
    description:
      "King of Moab who hired Balaam to curse the Israelites in the Book of Numbers.",
    status: "proposed",
  },
  {
    canonical: "Belial",
    variations: [],
    category: "miscellaneous",
    description:
      "A term often used in Jewish and Christian texts to denote wickedness or a personification of evil.",
    status: "proposed",
  },
  {
    canonical: "Ahura Mazda",
    variations: [],
    category: "religion",
    description:
      "The supreme deity in Zoroastrianism, representing goodness, light, and truth.",
    status: "proposed",
  },
  {
    canonical: "Angra Mainyu",
    variations: [],
    category: "religion",
    description: "The principal of darkness and evil in Zoroastrianism",
    status: "proposed",
  },
  {
    canonical: "Larry Hurtado",
    variations: ["Hurtado"],
    category: "person",
    description:
      "Scholar of early Christianity and New Testament, known for his work on early high Christology and the origins of Jesus devotion.",
    status: "proposed",
  },
  {
    canonical: "David A. Burnett",
    variations: ["Burnett"],
    category: "person",
    description:
      "PhD candidate at the University of Edinburgh, researching resurrection and the death of the gods in early Christian and Jewish contexts.",
    status: "proposed",
  },
  {
    canonical: "Early High Christology Club",
    variations: ["EHCC"],
    category: "scholarship",
    description:
      "Group of scholars who argue that the earliest Christians believed in the divinity of Jesus from the first generation.",
    status: "proposed",
  },
  {
    canonical: "Matthew Novinson",
    variations: [],
    category: "person",
    description:
      "Professor at the University of Edinburgh, specializing in New Testament and Christian Origins.",
    status: "proposed",
  },
  {
    canonical: "University of Edinburgh",
    variations: [],
    category: "place",
    description:
      "University in Scotland where David A. Burnett is pursuing his PhD.",
    status: "proposed",
  },
  {
    canonical: "Corinthians",
    variations: [],
    category: "people",
    description:
      "The people to whom Paul wrote his letters of First and Second Corinthians.",
    status: "proposed",
  },
  {
    canonical: "Paula Fredriksen",
    variations: [],
    category: "person",
    description: "Historian of ancient Judaism and Christianity.",
    status: "proposed",
  },
  {
    canonical: "Patriarchs",
    variations: [],
    category: "people",
    description:
      "Refers to the early ancestral figures in Genesis, particularly those listed in the genealogies of Genesis 5 and 11, such as Adam, Seth, and Noah.",
    status: "proposed",
  },
  {
    canonical: "genealogies",
    variations: [],
    category: "miscellaneous",
    description:
      "Lists of ancestors, lines of descent; in the Bible, these are often used to establish lineage and connections between figures or groups.",
    status: "proposed",
  },
  {
    canonical: "samaritan pentateuch",
    variations: [],
    category: "literature",
    description:
      "A version of the Pentateuch used by the Samaritans, differing in some readings from the Masoretic Text and Septuagint.",
    status: "proposed",
  },
  {
    canonical: "scrolls",
    variations: [],
    category: "literature",
    description:
      "Ancient form of writing material, often made of papyrus or parchment, used for texts before the codex.",
    status: "proposed",
  },
  {
    canonical: "codex",
    variations: ["codices"],
    category: "literature",
    description:
      "An early form of book consisting of bound pages, which replaced scrolls as the primary format for texts, especially in Christianity.",
    status: "proposed",
  },
  {
    canonical: "deuterocanon",
    variations: [],
    category: "literature",
    description:
      "A term used primarily by Catholics to refer to books and passages of the Christian Old Testament that are not part of the Hebrew Bible.",
    status: "proposed",
  },
  {
    canonical: "council of trent",
    variations: [],
    category: "event",
    description:
      "An ecumenical council of the Catholic Church held in the 16th century to address the challenges of the Protestant Reformation and define Catholic doctrine.",
    status: "proposed",
  },
  {
    canonical: "ben sira",
    variations: [],
    category: "literature",
    description:
      "Also known as Ecclesiasticus, a book of wisdom literature in the Septuagint and Christian Old Testament Apocrypha/Deuterocanon.",
    status: "proposed",
  },
  {
    canonical: "People of Israel",
    variations: [],
    category: "people",
    description:
      "A collective term for the descendants of Jacob/Israel, forming a nation in biblical narratives",
    status: "proposed",
  },
  {
    canonical: "Sinai",
    variations: [],
    category: "place",
    description:
      "A peninsula in Egypt, where Moses received the Ten Commandments.",
    status: "proposed",
  },
  {
    canonical: "Liane Feldman",
    variations: ["Leanne Feldman"],
    category: "person",
    description:
      "Assistant Professor of Religion at Princeton University, specializing in the Priestly Source and Pentateuchal composition.",
    status: "rejected",
  },
  {
    canonical: "neo-Documentarianism",
    variations: ["Neo-Documentarianism", "neo-Documentary Hypothesis"],
    category: "scholarship",
    description:
      "A modern iteration of the Documentary Hypothesis concerning the composition of the Pentateuch.",
    status: "proposed",
  },
  {
    canonical: "Enuma Elish",
    variations: [],
    category: "literature",
    description:
      "The Babylonian creation epic, featuring a battle between gods and the emergence of order from chaos.",
    status: "proposed",
  },
  {
    canonical: "Rebekah",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Wife of Isaac and mother of Jacob and Esau in the Book of Genesis",
    status: "accepted",
    episodes: [23, 121],
  },
  {
    canonical: "roman empire",
    variations: ["rome", "romans"],
    category: "event",
    description:
      "The empire that dominated the Mediterranean world and influenced the development of Christianity and Judaism.",
    status: "proposed",
  },
  {
    canonical: "mishnah",
    variations: ["mishnah's"],
    category: "literature",
    description:
      "The first major written collection of Jewish oral traditions, forming a core part of the Talmud.",
    status: "proposed",
  },
  {
    canonical: "tanakh",
    variations: ["tanakh's"],
    category: "literature",
    description:
      "The Hebrew Bible, consisting of the Torah, Nevi'im (Prophets), and Ketuvim (Writings).",
    status: "proposed",
  },
  {
    canonical: "gemara",
    variations: ["gemara's"],
    category: "literature",
    description:
      "The component of the Talmud comprising rabbinical analysis of and commentary on the Mishnah.",
    status: "proposed",
  },
  {
    canonical: "sages",
    variations: ["sage"],
    category: "miscellaneous",
    description:
      "Refers to the rabbis and scholars whose discussions and interpretations are recorded in the Talmud.",
    status: "proposed",
  },
  {
    canonical: "daf yomi",
    variations: ["daf"],
    category: "scholarship",
    description:
      "A practice of studying one folio page of the Babylonian Talmud each day, completing the entire Talmud in approximately seven and a half years.",
    status: "proposed",
  },
  {
    canonical: "beit din",
    variations: ["beit din's"],
    category: "miscellaneous",
    description: "A rabbinical court in Judaism.",
    status: "proposed",
  },
  {
    canonical: "shabbat",
    variations: ["shabbos"],
    category: "event",
    description:
      "The Jewish Sabbath, a day of rest and spiritual enrichment observed from Friday evening to Saturday evening.",
    status: "proposed",
  },
  {
    canonical: "kiddush",
    variations: ["kiddish"],
    category: "miscellaneous",
    description:
      "A blessing recited over wine or grape juice to sanctify the Sabbath and Jewish holidays.",
    status: "proposed",
  },
  {
    canonical: "kingdom of heaven",
    variations: ["kingdom of God"],
    category: "theology",
    description:
      "A concept in the Gospels, particularly Matthew, referring to the reign or rule of God",
    status: "proposed",
  },
  {
    canonical: "Sermon on the Mount",
    variations: ["Sermon on the Plain"],
    category: "literature",
    description:
      "A collection of sayings and teachings of Jesus in the Gospel of Matthew, including the Beatitudes",
    status: "proposed",
  },
  {
    canonical: "poor in spirit",
    variations: ["anve ruach"],
    category: "theology",
    description:
      "A phrase from the Beatitudes, interpreted as humility or recognition of spiritual need",
    status: "proposed",
  },
  {
    canonical: "justice",
    variations: ["divine justice", "social justice", "cosmic justice"],
    category: "theology",
    description:
      "Theological concept related to fairness, righteousness, and the upholding of moral principles",
    status: "proposed",
  },
  {
    canonical: "praus",
    variations: ["praeis"],
    category: "miscellaneous",
    description:
      "Greek word translated as meek, gentle, or humble, used in Matthew's Gospel in the Beatitudes",
    status: "proposed",
  },
  {
    canonical: "Jordan Peterson",
    variations: ["JP", "Peterson"],
    category: "person",
    description:
      "Canadian psychologist, cultural commentator, and author known for his interpretations of biblical stories and controversial views",
    status: "proposed",
  },
  {
    canonical: "prophets",
    variations: ["prophet"],
    category: "miscellaneous",
    description:
      "Individuals in the Hebrew Bible regarded as messengers or spokespersons of God",
    status: "proposed",
  },
  {
    canonical: "blessed",
    variations: ["blessing", "blessings"],
    category: "theology",
    description:
      "A state of being favored or fortunate, often associated with divine favor or approval",
    status: "proposed",
  },
  {
    canonical: "Matthew Thiessen",
    variations: ["Thiessen", "Matt"],
    category: "person",
    description:
      "Associate professor of religious studies at McMaster University, author of 'Jesus and the Forces of Death' and 'A Jewish Paul'",
    status: "proposed",
  },
  {
    canonical: "pneuma",
    variations: [],
    category: "miscellaneous",
    description:
      "Greek word for 'spirit', often associated with breath or wind, used in philosophical and theological contexts",
    status: "proposed",
  },
  {
    canonical: "Anglican",
    variations: [],
    category: "religion",
    description:
      "Relating to the Church of England or churches in communion with it; often associated with a specific theological tradition",
    status: "proposed",
  },
  {
    canonical: "Tom Wright",
    variations: ["N. T. Wright", "Wright"],
    category: "person",
    description:
      "New Testament scholar, theologian, and Anglican bishop, known for his work on Paul and the historical Jesus",
    status: "proposed",
  },
  {
    canonical: "EP Sanders",
    variations: ["Sanders"],
    category: "person",
    description:
      "An influential New Testament scholar known for his work on Paul and Second Temple Judaism.",
    status: "proposed",
  },
  {
    canonical: "Pastoral Epistles",
    variations: [],
    category: "literature",
    description:
      "Group of three New Testament letters (1 Timothy, 2 Timothy, Titus) attributed to Paul but authorship is debated.",
    status: "proposed",
  },
  {
    canonical: "Tik Tok",
    variations: [],
    category: "miscellaneous",
    description:
      "Social media platform featuring short-form videos, used to disseminate information (and misinformation) about biblical topics",
    status: "proposed",
  },
  {
    canonical: "Iraq",
    variations: [],
    category: "place",
    description:
      "A country in the Middle East, located in Mesopotamia, through which the Euphrates River flows.",
    status: "proposed",
  },
  {
    canonical: "malakh",
    variations: ["malak", "malakhim"],
    category: "miscellaneous",
    description:
      "Hebrew word for 'messenger' or 'angel,' used in the Hebrew Bible, often translated as 'angel of the Lord'",
    status: "proposed",
  },
  {
    canonical: "greek word",
    variations: [],
    category: "miscellaneous",
    description: "The word 'angelos' transliterated and adopted to English.",
    status: "proposed",
  },
  {
    canonical: "manoah",
    variations: ["Manoah's"],
    category: "character",
    description:
      "The father of Samson in the Book of Judges, who encounters a messenger of the Lord",
    status: "proposed",
  },
  {
    canonical: "Joppa",
    variations: [],
    category: "place",
    description:
      "An ancient port city located on the Mediterranean coast of Israel, mentioned in the Hebrew Bible",
    status: "proposed",
  },
  {
    canonical: "republican",
    variations: [],
    category: "miscellaneous",
    description: "Referring to the Republican Party in the United States.",
    status: "proposed",
  },
  {
    canonical: "Moral Majority",
    variations: [],
    category: "event",
    description:
      "A prominent American political organization associated with the Religious Right in the late 1970s and 1980s.",
    status: "proposed",
  },
  {
    canonical: "Religious Right",
    variations: [],
    category: "religion",
    description:
      "A politically conservative movement in the United States associated with evangelical Christianity.",
    status: "proposed",
  },
  {
    canonical: "American Idolatry",
    variations: [],
    category: "literature",
    description:
      "Book by Andrew Whitehead: 'American Idolatry: How Christian Nationalism Betrays the Gospel and Threatens the Church'",
    status: "proposed",
  },
  {
    canonical: "Peru",
    variations: [],
    category: "place",
    description:
      "A country in South America, mentioned in reference to Andrew Whitehead's personal experiences.",
    status: "proposed",
  },
  {
    canonical: "Decalogue",
    variations: ["Ten Commandments", "Biblical Decalogue"],
    category: "literature",
    llmVerify: true,
    description:
      "A set of ten divine commands or principles, especially those given to Moses on Mount Sinai.",
    status: "accepted",
    episodes: [
      14, 17, 21, 23, 31, 40, 44, 45, 66, 68, 75, 78, 93, 96, 97, 101, 102, 104,
      106, 110, 132, 133, 146,
    ],
  },
  {
    canonical: "Gog and Magog",
    variations: [],
    category: "miscellaneous",
    description:
      "Figures or nations mentioned in Ezekiel and Revelation, often associated with end-time conflicts.",
    status: "proposed",
  },
  {
    canonical: "Palestinian",
    variations: [],
    category: "people",
    description:
      "Relating to the Palestinians, an Arab people inhabiting the region of Palestine.",
    status: "proposed",
  },
  {
    canonical: "Oxford University Press",
    variations: ["OUP"],
    category: "miscellaneous",
    description:
      "A university press that publishes a wide range of books, including academic works.",
    status: "proposed",
  },
  {
    canonical: "Candida Moss",
    variations: [],
    category: "person",
    description:
      "Scholar of early Christianity, specializing in martyrdom, disability studies, and the New Testament.",
    status: "rejected",
  },
  {
    canonical: "Rosemarie Garland-Thomson",
    variations: [],
    category: "person",
    description:
      "Professor of English and bioethics who specializes in disability studies, feminist theory, and American literature.",
    status: "proposed",
  },
  {
    canonical: "Grace Emmett",
    variations: [],
    category: "person",
    description:
      "Scholar whose work examines gender and the body in early Christian texts, especially Paul's letters.",
    status: "proposed",
  },
  {
    canonical: "Persian",
    variations: ["Persians"],
    category: "people",
    description:
      "People from Persia (modern-day Iran), who formed the Persian Empire",
    status: "proposed",
  },
  {
    canonical: "Ancient of Days",
    variations: [],
    category: "theology",
    description:
      "A figure in Daniel 7, often interpreted as a representation of God with characteristics of age and wisdom",
    status: "proposed",
  },
  {
    canonical: "Babylonian empire",
    variations: ["Babylonian hegemony"],
    category: "event",
    description:
      "Empire based in Babylon, known for its influence in the ancient Near East",
    status: "proposed",
  },
  {
    canonical: "Carol Newsom",
    variations: [],
    category: "person",
    description:
      "Biblical scholar known for her work on the Book of Daniel and other Old Testament texts",
    status: "rejected",
  },
  {
    canonical: "Hananiah",
    variations: ["Shadrach"],
    category: "character",
    description: "The Hebrew name of Shadrach in the Book of Daniel",
    status: "proposed",
  },
  {
    canonical: "Mishael",
    variations: ["Meshach"],
    category: "character",
    description: "The Hebrew name of Meshach in the Book of Daniel",
    status: "proposed",
  },
  {
    canonical: "Azariah",
    variations: ["Abednego"],
    category: "character",
    description: "The Hebrew name of Abednego in the Book of Daniel",
    status: "proposed",
  },
  {
    canonical: "Beloved Disciple",
    variations: ["the Beloved Disciple"],
    category: "character",
    description:
      "A figure in the Gospel of John, often identified with John the Apostle, but whose actual identity is debated",
    status: "proposed",
  },
  {
    canonical: "Pauline epistles",
    variations: ["the Pauline epistles"],
    category: "literature",
    description:
      "The letters in the New Testament traditionally attributed to Paul the Apostle",
    status: "proposed",
  },
  {
    canonical: "Church History",
    variations: ["the Church History"],
    category: "literature",
    description:
      "A ten-volume history of the Christian Church written by Eusebius of Caesarea in the fourth century CE",
    status: "proposed",
  },
  {
    canonical: "Jacob Wright",
    variations: ["Wright", "Jacob"],
    category: "person",
    description:
      "Professor of Hebrew Bible at Candler School of Theology, Emory University; author of 'Why the Bible Began'",
    status: "rejected",
  },
  {
    canonical: "kingdom",
    variations: [],
    category: "miscellaneous",
    description: "A state or territory ruled by a king or queen",
    status: "proposed",
  },
  {
    canonical: "peoplehood",
    variations: ["people's"],
    category: "miscellaneous",
    description:
      "The condition of being a people; a sense of shared identity and common purpose",
    status: "proposed",
  },
  {
    canonical: "Davidic",
    variations: [],
    category: "miscellaneous",
    description: "Relating to King David or the dynasty descended from him",
    status: "proposed",
  },
  {
    canonical: "Mesha Stele",
    variations: [],
    category: "literature",
    description:
      "An inscription written in Moabite, commissioned by King Mesha of Moab in the 9th century BCE",
    status: "proposed",
  },
  {
    canonical: "Aaron Adair",
    variations: ["Aaron"],
    category: "person",
    description:
      "Research affiliate in physics education at MIT and author of 'The Star of Bethlehem: A Skeptical View'",
    status: "rejected",
  },
  {
    canonical: "Christmas",
    variations: [],
    category: "event",
    description:
      "Annual Christian festival celebrating Christ's birth, often associated with various traditions and beliefs",
    status: "accepted",
    episodes: [
      37, 38, 42, 57, 69, 74, 87, 90, 91, 103, 140, 141, 143, 146, 155,
    ],
  },
  {
    canonical: "aliens",
    variations: [],
    category: "miscellaneous",
    description: "Extraterrestrial life forms",
    status: "proposed",
    caseSensitive: true,
  },
  {
    canonical: "Venus",
    variations: [],
    category: "miscellaneous",
    description: "The planet Venus",
    status: "proposed",
  },
  {
    canonical: "Star of Bethlehem",
    variations: ["Star"],
    category: "event",
    llmVerify: true,
    description:
      "The star that guided the Magi to Jesus in the Gospel of Matthew",
    status: "accepted",
    episodes: [37, 38, 43, 86, 87, 141, 150],
  },
  {
    canonical: "Schweitzer",
    variations: ["Albert Schweitzer"],
    category: "person",
    description:
      "Albert Schweitzer, theologian known for 'The Quest of the Historical Jesus'",
    status: "proposed",
  },
  {
    canonical: "Lucan",
    variations: ["Luke"],
    category: "miscellaneous",
    description: "Refers to the Gospel of Luke",
    status: "proposed",
  },
  {
    canonical: "Eric Vanden Eykel",
    variations: ["Eric VandenEykel", "Vanden Eykel", "VandenEykel"],
    category: "person",
    description:
      "Associate professor of religion and Forrest S. Williams Teaching Chair in the Humanities at Ferrum College; guest on the podcast",
    status: "proposed",
  },
  {
    canonical: "Greeks",
    variations: ["Greek"],
    category: "people",
    description:
      "People inhabiting ancient Greece or speaking the Greek language",
    status: "proposed",
  },
  {
    canonical: "catacombs",
    variations: ["catacomb"],
    category: "place",
    description:
      "Underground burial places, especially those used by early Christians in Rome",
    status: "proposed",
  },
  {
    canonical: "CE",
    variations: ["Common Era"],
    category: "miscellaneous",
    description:
      "Common Era, used as an alternative to AD in dating historical events",
    status: "proposed",
  },
  {
    canonical: "Elaine Pagels",
    variations: ["Pagels"],
    category: "person",
    description:
      "Scholar known for her work on the Gnostic Gospels and early Christian history",
    status: "rejected",
  },
  {
    canonical: "Joel McHale",
    variations: [],
    category: "person",
    description: "American actor, comedian, and television host",
    status: "rejected",
  },
  {
    canonical: "Seattle",
    variations: [],
    category: "place",
    description:
      "A city in Washington state, mentioned in connection with Joel McHale's upbringing.",
    status: "proposed",
  },
  {
    canonical: "Vatican",
    variations: [],
    category: "place",
    description:
      "The city-state in Rome, the headquarters of the Roman Catholic Church.",
    status: "proposed",
  },
  {
    canonical: "Italy",
    variations: [],
    category: "place",
    description:
      "A country in Southern Europe where Joel McHale was born in Rome.",
    status: "proposed",
  },
  {
    canonical: "Heaven",
    variations: [],
    category: "theology",
    description:
      "The abode of God, angels, and the blessed dead in some religions.",
    status: "proposed",
  },
  {
    canonical: "Magic",
    variations: [],
    category: "miscellaneous",
    description:
      "The use of rituals, spells, or supernatural powers to influence events or outcomes.",
    status: "rejected",
  },
  {
    canonical: "Twitter",
    variations: [],
    category: "miscellaneous",
    description:
      "Social media platform, now known as X, used for discussions and debates, including those related to biblical interpretation",
    status: "proposed",
  },
  {
    canonical: "Jews",
    variations: ["Jewish"],
    category: "people",
    description:
      "Ethnoreligious group and nation originating from the Israelites and Hebrews of the Ancient Near East.",
    status: "proposed",
  },
  {
    canonical: "Nicholas",
    variations: ["St. Nicholas"],
    category: "person",
    description:
      "Saint Nicholas of Myra, a 4th-century Christian bishop, known for his generosity.",
    status: "proposed",
  },
  {
    canonical: "chief priests",
    variations: ["high priests"],
    category: "people",
    description:
      "High-ranking religious officials in ancient Judaism, often associated with the Temple in Jerusalem",
    status: "proposed",
  },
  {
    canonical: "babylonians",
    variations: [],
    category: "people",
    description:
      "The inhabitants of Babylon, a major city in ancient Mesopotamia; also refers to the empire they established",
    status: "proposed",
  },
  {
    canonical: "Marriage",
    variations: [],
    category: "miscellaneous",
    description:
      "The socially recognized union or legal contract between people that creates rights and obligations, varying across cultures and time periods.",
    status: "accepted",
    episodes: [
      3, 8, 10, 24, 27, 30, 32, 44, 47, 54, 56, 61, 63, 64, 67, 68, 72, 79, 80,
      87, 88, 89, 91, 93, 99, 101, 108, 111, 113, 114, 116, 133, 134, 135, 139,
      144, 148,
    ],
  },
  {
    canonical: "divorce",
    variations: ["divorcing"],
    category: "miscellaneous",
    description:
      "The legal dissolution of a marriage by a court or other body with legal authority.",
    status: "proposed",
  },
  {
    canonical: "sex",
    variations: ["sexual", "sexuality"],
    category: "miscellaneous",
    description:
      "Physical activity, often involving sexual intercourse, between individuals; also a biological characteristic distinguishing male and female.",
    status: "proposed",
  },
  {
    canonical: "celibacy",
    variations: ["celibate"],
    category: "miscellaneous",
    description:
      "The state of abstaining from marriage and sexual relations, often for religious reasons.",
    status: "proposed",
  },
  {
    canonical: "Kipp Davis",
    variations: ["Davis"],
    category: "person",
    description:
      "Public scholar of the Hebrew Bible with specializations in early Judaism and the Dead Sea Scrolls; guest on this podcast episode.",
    status: "proposed",
  },
  {
    canonical: "Joel Baden",
    variations: [],
    category: "person",
    description:
      'Professor of Hebrew Bible at Yale Divinity School, co-author of "Bible Nation: The United States of Hobby Lobby."',
    status: "rejected",
  },
  {
    canonical: "Cave 4",
    variations: [],
    category: "place",
    description:
      "Cave near the Qumran site, the most prominent of the Dead Sea Scroll caves, where the vast majority of the manuscripts were found.",
    status: "proposed",
  },
  {
    canonical: "Emanuel Tov",
    variations: [],
    category: "person",
    description:
      "Israeli biblical scholar and expert in textual criticism of the Hebrew Bible and the Dead Sea Scrolls.",
    status: "proposed",
  },
  {
    canonical: "Schoyen Collection",
    variations: ["Schoyen's fragments"],
    category: "miscellaneous",
    description:
      "Collection of manuscripts and artifacts assembled by Martin Schoyen, including controversial Dead Sea Scrolls fragments.",
    status: "proposed",
  },
  {
    canonical: "Israel Antiquities Authority",
    variations: [],
    category: "miscellaneous",
    description:
      "Government organization responsible for managing and preserving archaeological sites and artifacts in Israel.",
    status: "proposed",
  },
  {
    canonical: "Rahab",
    variations: [],
    category: "character",
    description:
      "A prostitute in Jericho who helped the Israelite spies and was spared during the conquest",
    status: "proposed",
    caseSensitive: true,
  },
  {
    canonical: "Julius Caesar",
    variations: ["Caesar"],
    category: "person",
    description:
      "Roman general and statesman who played a critical role in the events that led to the demise of the Roman Republic and the rise of the Roman Empire",
    status: "proposed",
  },
  {
    canonical: "Pompey",
    variations: ["Gnaeus Pompeius Magnus"],
    category: "person",
    description:
      "Gnaeus Pompeius Magnus, a Roman general and statesman who was a rival of Julius Caesar",
    status: "proposed",
  },
  {
    canonical: "Senate",
    variations: ["senators"],
    category: "event",
    description:
      "The Roman Senate was a political institution in the ancient Roman Republic and Empire",
    status: "rejected",
  },
  {
    canonical: "Lindsay Graham",
    variations: [],
    category: "person",
    description: "The host of the History Daily podcast.",
    status: "proposed",
  },
  {
    canonical: "Republic",
    variations: [],
    category: "event",
    description:
      "Refers to the Roman Republic, the period of Roman civilization from the overthrow of the Roman Kingdom until the establishment of the Roman Empire.",
    status: "proposed",
  },
  {
    canonical: "Louis XVI",
    variations: ["King Louis XVI"],
    category: "person",
    description: "The last King of France before the French Revolution",
    status: "proposed",
  },
  {
    canonical: "French Revolution",
    variations: [],
    category: "event",
    description:
      "A period of social and political upheaval in late 1700's France, ultimately toppling the monarchy",
    status: "proposed",
  },
  {
    canonical: "Gaul",
    variations: [],
    category: "place",
    description:
      "An ancient region of Europe inhabited by Celtic peoples, corresponding roughly to modern France and parts of surrounding countries",
    status: "proposed",
  },
  {
    canonical: "Empire",
    variations: [],
    category: "event",
    description:
      "Refers to the Roman Empire, the post-Republican period of ancient Rome, characterized by autocratic rule.",
    status: "proposed",
  },
  {
    canonical: "Helen Bond",
    variations: ["Bond"],
    category: "person",
    description:
      "Professor of Christian Origins at Edinburgh University and president of the British New Testament Society.",
    status: "proposed",
  },
  {
    canonical: "Tacitus",
    variations: ["Tacitus'"],
    category: "person",
    description:
      "A Roman historian and senator, known for his writings on the Roman Empire.",
    status: "proposed",
  },
  {
    canonical: "Lent",
    variations: [],
    category: "religion",
    description:
      "A period of fasting and penitence observed by many Christians in preparation for Easter.",
    status: "proposed",
  },
  {
    canonical: "Jesus of Nazareth",
    variations: [],
    category: "character",
    description:
      "The central figure in Christianity, believed by Christians to be the Son of God; historically from Nazareth.",
    status: "rejected",
  },
  {
    canonical: "Holy Week",
    variations: ["holy week"],
    category: "event",
    description:
      "The week leading up to Easter, commemorating the final events in the life of Jesus",
    status: "proposed",
  },
  {
    canonical: "Lazarus",
    variations: [],
    category: "character",
    description:
      "A man from Bethany whom Jesus raised from the dead in the Gospel of John",
    status: "proposed",
  },
  {
    canonical: "First Century CE",
    variations: [],
    category: "event",
    description:
      "The period from 1 to 100 CE, encompassing the life of Jesus and the early development of Christianity",
    status: "proposed",
  },
  {
    canonical: "Neil Van Leeuwen",
    variations: ["Van Leeuwen", "Neil"],
    category: "person",
    description:
      'Associate professor of philosophy and neuroscience at Georgia State University, author of "Religion as Make-Believe"',
    status: "rejected",
  },
  {
    canonical: "belief",
    variations: ["beliefs", "believing", "believe"],
    category: "theology",
    description:
      "Acceptance that a statement is true or that something exists; trust, faith, or confidence in someone or something",
    status: "proposed",
  },
  {
    canonical: "chistians",
    variations: ["Christian"],
    category: "religion",
    description:
      "Adherents of Christianity, a religion centered on the life and teachings of Jesus of Nazareth",
    status: "proposed",
  },
  {
    canonical: "cognitive attitude",
    variations: ["cognitive attitudes"],
    category: "scholarship",
    description:
      "A philosophical term for how one relates to or processes a given idea, encompassing different ways of thinking and reasoning about it",
    status: "proposed",
  },
  {
    canonical: "calvin college",
    variations: ["Calvinist"],
    category: "place",
    description:
      "A private Christian liberal arts college in Grand Rapids, Michigan, affiliated with the Christian Reformed Church",
    status: "proposed",
  },
  {
    canonical: "cognition",
    variations: ["cognitive science", "cognitive"],
    category: "scholarship",
    description:
      "The mental action or process of acquiring knowledge and understanding through thought, experience, and the senses",
    status: "proposed",
  },
  {
    canonical: "maarten boudry",
    variations: ["Boudry"],
    category: "person",
    description:
      "A Flemish philosopher known for his critiques of pseudoscience and religion",
    status: "proposed",
  },
  {
    canonical: "lahmi",
    variations: ["beit lahm"],
    category: "character",
    description:
      "Character identified in Chronicles as the brother of Goliath, though some scholars consider it a textual corruption",
    status: "proposed",
  },
  {
    canonical: "patriarchal",
    variations: ["patriarchy", "patriarchalism"],
    category: "miscellaneous",
    description:
      "Relating to a system of society or government controlled by men",
    status: "proposed",
  },
  {
    canonical: "apologists",
    variations: ["apologetic"],
    category: "religion",
    description:
      "Individuals who offer a rational defense of religious beliefs",
    status: "proposed",
  },
  {
    canonical: "ESV",
    variations: ["ESV"],
    category: "literature",
    description:
      "English Standard Version, a conservative evangelical translation of the Bible",
    status: "proposed",
  },
  {
    canonical: "perspicuity",
    variations: [],
    category: "theology",
    description: "The quality of being easily understood; clarity",
    status: "proposed",
  },
  {
    canonical: "David Carr",
    variations: ["Carr", "Professor David M. Carr"],
    category: "person",
    description:
      "Professor of Hebrew Bible at Union Theological Seminary and Jewish Theological Seminary in New York",
    status: "proposed",
  },
  {
    canonical: "Cain and Abel",
    variations: ["Cain Abel"],
    category: "character",
    description:
      "The two sons of Adam and Eve, where Cain murders Abel out of jealousy (Genesis 4)",
    status: "proposed",
  },
  {
    canonical: "Non-P",
    variations: ["non-Priestly"],
    category: "literature",
    description:
      "Referring to the non-Priestly source in the Pentateuch according to the Documentary Hypothesis",
    status: "rejected",
  },
  {
    canonical: "Gilgamesh",
    variations: [],
    category: "literature",
    description:
      "An ancient Mesopotamian epic poem, one of the earliest known works of literature",
    status: "proposed",
  },
  {
    canonical: "NASA",
    variations: [],
    category: "miscellaneous",
    description:
      "The United States National Aeronautics and Space Administration, often a target of flat Earth conspiracy theories.",
    status: "rejected",
  },
  {
    canonical: "Reformation",
    variations: ["Protestant Reformation"],
    category: "event",
    description:
      "A major movement within Western Christianity in 16th-century Europe that posed a religious and political challenge to the Catholic Church",
    status: "proposed",
  },
  {
    canonical: "Ephesus",
    variations: [],
    category: "place",
    description:
      "An ancient Greek city on the coast of Ionia, now part of Turkey",
    status: "proposed",
  },
  {
    canonical: "Smith",
    variations: [],
    category: "person",
    description:
      "Wilfred Cantwell Smith, a scholar whose book 'The Meaning and End of Religion' influenced the critique of the category of religion in scholarly discourse.",
    status: "proposed",
  },
  {
    canonical: "Providence",
    variations: [],
    category: "place",
    description:
      "City in Rhode Island, location of Brown University and the Meanings and Ends of Monotheism conference.",
    status: "proposed",
  },
  {
    canonical: "Society of Biblical Literature",
    variations: ["SBL"],
    category: "scholarship",
    description:
      "An academic organization dedicated to the critical study of the Bible and related texts.",
    status: "proposed",
  },
  {
    canonical: "pantheon",
    variations: ["pantheons"],
    category: "theology",
    description:
      "A collection of deities belonging to a particular religion or mythology.",
    status: "proposed",
  },
  {
    canonical: "Debra Scoggins Ballentine",
    variations: ["Scoggins Ballentine"],
    category: "person",
    description: "Scholar of the Hebrew Bible and translation theory.",
    status: "proposed",
  },
  {
    canonical: "Critical Text",
    variations: [],
    category: "literature",
    description:
      "A reconstructed version of a text based on critical assessment of available manuscripts.",
    status: "proposed",
  },
  {
    canonical: "James McGrath",
    variations: ["McGrath", "James F. McGrath"],
    category: "person",
    description:
      "Professor of New Testament at Butler University and author of 'Christmaker'.",
    status: "rejected",
  },
  {
    canonical: "Butler University",
    variations: ["Butler"],
    category: "place",
    description: "A private university located in Indianapolis, Indiana.",
    status: "proposed",
  },
  {
    canonical: "Greco Roman",
    variations: [],
    category: "miscellaneous",
    description:
      "Relating to the culture and civilization of ancient Greece and Rome",
    status: "proposed",
  },
  {
    canonical: "Book of Watchers",
    variations: [],
    category: "literature",
    description:
      "The first major section of the Book of Enoch, focusing on the story of the fallen angels",
    status: "proposed",
  },
  {
    canonical: "Ethiopia",
    variations: ["Ethiopic", "Geez"],
    category: "place",
    description:
      "A country in East Africa where the Book of Enoch is considered canonical in the Ethiopian Orthodox Tewahedo Church",
    status: "proposed",
  },
  {
    canonical: "Book of Parables",
    variations: [],
    category: "literature",
    description:
      "A section of the Book of Enoch containing parables and visions",
    status: "proposed",
  },
  {
    canonical: "Rachel",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "Jacob's favorite wife, daughter of Laban, and mother of Joseph and Benjamin.",
    status: "accepted",
    episodes: [63, 67, 72, 121, 133, 141, 155],
  },
  {
    canonical: "Dagon",
    variations: ["Dagon's"],
    category: "theology",
    description:
      "A Northwest Semitic deity of grain and fertility, associated with the Philistines in the biblical text of Judges.",
    status: "proposed",
  },
  {
    canonical: "delilah",
    variations: [],
    category: "character",
    description:
      "The Philistine woman who betrayed Samson by cutting his hair, as told in the Book of Judges.",
    status: "proposed",
    caseSensitive: true,
  },
  {
    canonical: "Deborah",
    variations: [],
    category: "character",
    description:
      "A prophetess and judge in the Book of Judges, who leads Israel to victory against the Canaanites.",
    status: "proposed",
  },
  {
    canonical: "Sisera",
    variations: [],
    category: "character",
    description:
      "The commander of King Jabin's army who is defeated by Deborah and Barak in the Book of Judges.",
    status: "proposed",
  },
  {
    canonical: "Barak",
    variations: [],
    category: "character",
    description:
      "An Israelite military leader who assists Deborah in defeating the Canaanites in the Book of Judges.",
    status: "proposed",
  },
  {
    canonical: "Shamash",
    variations: [],
    category: "theology",
    description:
      "Mesopotamian sun god, associated with justice and divination.",
    status: "proposed",
  },
  {
    canonical: "King James",
    variations: ["king james", "king jamesian"],
    category: "literature",
    description:
      "Relating to the King James Version of the Bible, a popular English translation.",
    status: "proposed",
  },
  {
    canonical: "Timnah",
    variations: ["at Timnah"],
    category: "place",
    description: "A location associated with the biblical figure Samson",
    status: "proposed",
  },
  {
    canonical: "Levirate marriage",
    variations: ["Levirate"],
    category: "miscellaneous",
    description:
      "The custom in which a man is obligated to marry his deceased brother's widow to provide an heir for the deceased brother",
    status: "proposed",
  },
  {
    canonical: "Pater familias",
    variations: [],
    category: "miscellaneous",
    description:
      "The male head of a household in Roman society, possessing legal authority over his family members",
    status: "proposed",
  },
  {
    canonical: "Coitus interruptus",
    variations: [],
    category: "miscellaneous",
    description:
      "A method of birth control that involves withdrawing the penis from the vagina before ejaculation",
    status: "proposed",
  },
  {
    canonical: "Second Century",
    variations: ["2nd century"],
    category: "event",
    description:
      "Referring to the time period of 101-200 CE, important for the formation of the biblical canon and the development of early Christian theology.",
    status: "proposed",
  },
  {
    canonical: "Second Maccabees",
    variations: ["2 Maccabees"],
    category: "literature",
    llmVerify: true,
    description:
      "Deuterocanonical book recounting the history of the Maccabean revolt",
    status: "accepted",
    episodes: [20, 50, 55, 70, 112, 123],
  },
  {
    canonical: "king cyrus of persia",
    variations: ["cyrus the great", "cyrus"],
    category: "person",
    description:
      "Also known as Cyrus the Great, the founder of the Achaemenid Empire who allowed the Jewish people to return to their homeland",
    status: "proposed",
  },
  {
    canonical: "Elimelech",
    variations: ["Elimelech's"],
    category: "character",
    description:
      "Naomi's husband and father of Mahlon and Chilion in the Book of Ruth",
    status: "proposed",
  },
  {
    canonical: "ancient world",
    variations: ["anciently"],
    category: "place",
    description:
      "General term referring to the time period before the Middle Ages, encompassing various civilizations",
    status: "proposed",
  },
  {
    canonical: "Urim and Thummim",
    variations: ["urim", "thummim"],
    category: "miscellaneous",
    description:
      "Objects used in ancient Israel for divination, mentioned in the Hebrew Bible",
    status: "accepted",
    episodes: [40, 73, 74, 113, 129],
  },
  {
    canonical: "high priest",
    variations: [],
    category: "miscellaneous",
    description: "The chief religious official in ancient Israelite society",
    status: "proposed",
  },
  {
    canonical: "afterlife",
    variations: [],
    category: "theology",
    description: "Existence after death",
    status: "proposed",
  },
  {
    canonical: "Shatnez",
    variations: ["shaatnez"],
    category: "miscellaneous",
    description:
      "Hebrew term for fabric containing a mixture of wool and linen, prohibited by Jewish law.",
    status: "accepted",
    episodes: [74],
  },
  {
    canonical: "ephod",
    variations: [],
    category: "miscellaneous",
    description:
      "Linen garment worn by the high priest, sometimes containing precious stones.",
    status: "proposed",
  },
  {
    canonical: "Reuben",
    variations: [],
    category: "character",
    description:
      "Oldest son of Jacob in the Book of Genesis, sometimes portrayed as attempting to save Joseph.",
    status: "proposed",
  },
  {
    canonical: "Potiphar",
    variations: [],
    category: "person",
    description:
      "Egyptian official who purchased Joseph as a slave, mentioned in Genesis.",
    status: "proposed",
  },
  {
    canonical: "Shroud of Turin",
    variations: ["shroud"],
    category: "miscellaneous",
    llmVerify: true,
    description:
      "A linen cloth bearing an image that resembles a crucified man, believed by some to be the burial shroud of Jesus.",
    status: "accepted",
    episodes: [75, 140],
  },
  {
    canonical: "Goshen",
    variations: [],
    category: "place",
    description:
      "Region in ancient Egypt where the Israelites resided during their time in slavery, mentioned in the Exodus narrative.",
    status: "proposed",
  },
  {
    canonical: "Nile",
    variations: [],
    category: "place",
    description:
      "Major river in Egypt, central to the country's geography and culture, featured prominently in the Exodus plagues narrative.",
    status: "proposed",
  },
  {
    canonical: "Tithing",
    variations: ["tithe"],
    category: "miscellaneous",
    description:
      "The practice of donating a tenth of one's income or produce, often for religious purposes.",
    status: "accepted",
    episodes: [76, 79, 146, 158],
  },
  {
    canonical: "Ananias",
    variations: [],
    category: "character",
    description:
      "A member of the early Christian church in Jerusalem who, along with his wife Sapphira, was struck dead for lying about their contribution to the community.",
    status: "proposed",
  },
  {
    canonical: "Latin",
    variations: [],
    category: "miscellaneous",
    description:
      "The language of ancient Rome, influential in law, literature, and religion.",
    status: "proposed",
  },
  {
    canonical: "Lord Herbert of Cherbury",
    variations: [],
    category: "person",
    description:
      "Lord Herbert of Cherbury was an English soldier, diplomat, historian, poet, and religious philosopher of the late 16th and early 17th centuries.",
    status: "proposed",
  },
  {
    canonical: "Craig Mousin",
    variations: ["Mousin"],
    category: "person",
    description:
      "Reverend Craig Mousin, J.D., is a professor at the Grace School of Applied Diplomacy at DePaul University and associate minister for immigrant justice at the Wellington United Church of Christ.",
    status: "proposed",
  },
  {
    canonical: "Cecil Cicirello",
    variations: [],
    category: "person",
    description:
      "Co-host of the Lawful Assembly podcast, also a podcaster on Cognitive Dissonance and Citation Needed.",
    status: "rejected",
  },
  {
    canonical: "refugees",
    variations: [],
    category: "miscellaneous",
    description:
      "People who have been forced to leave their country in order to escape war, persecution, or natural disaster.",
    status: "proposed",
  },
  {
    canonical: "Chicago",
    variations: [],
    category: "place",
    description: "City in Illinois.",
    status: "proposed",
  },
  {
    canonical: "David Congdon",
    variations: ["Congdon"],
    category: "person",
    description:
      "Author of 'Who Is a True Christian?' and senior editor at the University Press of Kansas",
    status: "proposed",
  },
  {
    canonical: "Modernity",
    variations: ["modern"],
    category: "miscellaneous",
    description:
      "The historical period characterized by the decline of traditional authority and the rise of individualism and reason.",
    status: "proposed",
  },
  {
    canonical: "C. S. Lewis",
    variations: ["Lewis"],
    category: "person",
    description:
      "British author and Christian apologist known for his works on theology and fantasy",
    status: "rejected",
  },
  {
    canonical: "Rudolf Bultmann",
    variations: ["Bultmann"],
    category: "person",
    description:
      "German Lutheran theologian known for his work on form criticism and existential interpretation of the New Testament",
    status: "proposed",
  },
  {
    canonical: "Republican Party",
    variations: ["Republican"],
    category: "miscellaneous",
    description:
      "One of the two major contemporary political parties in the United States.",
    status: "proposed",
  },
  {
    canonical: "Enlightenment",
    variations: [],
    category: "miscellaneous",
    description:
      "An intellectual and philosophical movement of the 18th century emphasizing reason and individualism.",
    status: "proposed",
  },
  {
    canonical: "language",
    variations: [],
    category: "miscellaneous",
    description: "Generic term for human communication",
    status: "proposed",
  },
  {
    canonical: "church",
    variations: ["churches"],
    category: "religion",
    description:
      "A building used for public Christian worship or the body of all Christians",
    status: "proposed",
  },
  {
    canonical: "Deconstruction",
    variations: ["deconstruct", "deconstructing"],
    category: "miscellaneous",
    llmVerify: true,
    description:
      "The process of critically examining and often rejecting previously held beliefs, particularly religious ones",
    status: "accepted",
    episodes: [79, 82, 103, 113, 149],
  },
  {
    canonical: "king henry viii",
    variations: [],
    category: "person",
    description:
      "King of England in the 16th century, known for his role in the English Reformation and establishing the Church of England",
    status: "proposed",
  },
  {
    canonical: "bible college",
    variations: [],
    category: "miscellaneous",
    description:
      "An educational institution that prepares students for Christian ministry",
    status: "proposed",
  },
  {
    canonical: "Golgotha",
    variations: ["Gordon's Calvary"],
    category: "place",
    description:
      "The site of Jesus' crucifixion, often referred to as the place of the skull.",
    status: "proposed",
  },
  {
    canonical: "excrement",
    variations: [],
    category: "miscellaneous",
    description: "Bodily waste, specifically feces.",
    status: "proposed",
  },
  {
    canonical: "Christ",
    variations: ["Christness"],
    category: "theology",
    description:
      "Title given to Jesus, derived from the Greek word Christos, meaning 'anointed one'.",
    status: "proposed",
  },
  {
    canonical: "Jordan Maxwell",
    variations: ["Maxwell"],
    category: "person",
    description:
      "American conspiracy theorist known for his views on religion, symbolism, and secret societies.",
    status: "proposed",
  },
  {
    canonical: "Shepherds",
    variations: [],
    category: "character",
    description:
      "The humble workers who were among the first to hear the news of Jesus' birth, according to the Gospel of Luke",
    status: "proposed",
  },
  {
    canonical: "Huldah",
    variations: [],
    category: "character",
    description:
      "A prophetess during the reign of King Josiah, consulted about the Book of the Law",
    status: "proposed",
  },
  {
    canonical: "shevet",
    variations: [],
    category: "miscellaneous",
    description:
      "Hebrew word meaning rod or staff, used in Proverbs and elsewhere",
    status: "proposed",
  },
  {
    canonical: "Donatello",
    variations: [],
    category: "miscellaneous",
    description: "One of the Teenage Mutant Ninja Turtles",
    status: "rejected",
  },
  {
    canonical: "John Piper",
    variations: [],
    category: "person",
    description: "An American pastor and theologian",
    status: "proposed",
  },
  {
    canonical: "Apologetics",
    variations: ["apologetic"],
    category: "theology",
    description:
      "The theological discipline of defending religious doctrines through systematic argumentation and discourse.",
    status: "proposed",
  },
  {
    canonical: "congitive dissonance",
    variations: [],
    category: "scholarship",
    description:
      "The mental discomfort experienced when holding conflicting beliefs, values, or attitudes.",
    status: "proposed",
  },
  {
    canonical: "star-spangled jesus",
    variations: ["star spangled jesus"],
    category: "literature",
    description:
      "Title of April Ajoy's book, which explores her journey of leaving Christian nationalism.",
    status: "proposed",
  },
  {
    canonical: "george washington",
    variations: ["Washington"],
    category: "person",
    description:
      "First president of the United States who was believed to be given the land by God.",
    status: "proposed",
  },
  {
    canonical: "Ethiopians",
    variations: [],
    category: "people",
    description:
      "An ancient African people from the region of Ethiopia, mentioned in the Bible.",
    status: "proposed",
  },
  {
    canonical: "Racism",
    variations: [],
    category: "miscellaneous",
    description:
      "Prejudice, discrimination, or antagonism directed against a person or people on the basis of their membership in a particular racial or ethnic group.",
    status: "proposed",
  },
  {
    canonical: "Slavery",
    variations: [],
    category: "miscellaneous",
    description:
      "The state of being a slave; the practice or system of owning slaves.",
    status: "proposed",
  },
  {
    canonical: "Gospel of Judas",
    variations: ["Judas"],
    category: "literature",
    description:
      "Gnostic text depicting Judas Iscariot in a positive light, discovered in the 20th century.",
    status: "proposed",
  },
  {
    canonical: "ark",
    variations: ["the ark"],
    category: "miscellaneous",
    description:
      "The vessel built by Noah to save his family and animals from the flood. It is NOT the ark of the covenant. This is not a person, place, or literature.",
    status: "proposed",
  },
  {
    canonical: "Ark of the Covenant",
    variations: [],
    category: "miscellaneous",
    description:
      "The sacred chest containing the tablets of the Ten Commandments, a symbol of God's presence. This is not a person, place, or literature.",
    status: "accepted",
    episodes: [1, 14, 67, 83, 88, 95, 120, 126, 127, 154],
  },
  {
    canonical: "Freethought Caucus",
    variations: [],
    category: "miscellaneous",
    description:
      "A group of members of Congress who advocate for the separation of church and state and the rights of non-religious individuals.",
    status: "proposed",
  },
  {
    canonical: "Herodians",
    variations: [],
    category: "people",
    description:
      "A political faction in Judea during the time of Jesus, supporting the Herodian dynasty.",
    status: "proposed",
  },
  {
    canonical: "Archaeology",
    variations: ["Archaeological"],
    category: "scholarship",
    description:
      "The study of human history and prehistory through the excavation of sites and the analysis of artifacts and other physical remains.",
    status: "proposed",
  },
  {
    canonical: "Noah's Ark",
    variations: [],
    category: "miscellaneous",
    description:
      "The vessel in which Noah and his family survived the Great Flood in the Book of Genesis.",
    status: "proposed",
  },
  {
    canonical: "Apostles Creed",
    variations: ["Apostle's Creed"],
    category: "theology",
    description:
      "Early statement of Christian belief, widely used by various denominations.",
    status: "proposed",
  },
  {
    canonical: "Pauline epistle",
    variations: ["Pauline epistles"],
    category: "literature",
    description:
      "A letter traditionally attributed to the Apostle Paul in the New Testament",
    status: "proposed",
  },
  {
    canonical: "Timothy",
    variations: [],
    category: "character",
    description:
      "A companion of Paul the Apostle mentioned in the New Testament",
    status: "proposed",
  },
  {
    canonical: "Christ Jesus",
    variations: [],
    category: "theology",
    description:
      "A name used for Jesus Christ, emphasizing his role as the Messiah",
    status: "proposed",
  },
  {
    canonical: "Caesarea",
    variations: [],
    category: "place",
    description:
      "An ancient port city on the coast of Israel, known for its historical significance during Roman times",
    status: "proposed",
  },
  {
    canonical: "Codex Vaticanus",
    variations: [],
    category: "literature",
    description:
      "One of the oldest nearly complete manuscripts of the Bible, written in Greek",
    status: "proposed",
  },
  {
    canonical: "University of Oxford",
    variations: ["Oxford"],
    category: "place",
    description: "A collegiate research university in Oxford, England",
    status: "proposed",
  },
  {
    canonical: "T. Michael Law",
    variations: [],
    category: "person",
    description:
      "Scholar of the Septuagint, specializing in the intersection of biblical translation and early Christian origins",
    status: "proposed",
  },
  {
    canonical: "bishop of london",
    variations: ["bishop"],
    category: "miscellaneous",
    description: "A high-ranking cleric in the Church of England",
    status: "proposed",
  },
  {
    canonical: "beilby porteus",
    variations: ["porteus"],
    category: "person",
    description: "Bishop of London and abolitionist",
    status: "rejected",
  },
  {
    canonical: "the kingdom of heaven",
    variations: [],
    category: "theology",
    description:
      "Concept in the synoptic gospels of a future reality characterized by God's rule",
    status: "proposed",
  },
  {
    canonical: "prosperity gospel",
    variations: ["gospel of prosperity"],
    category: "theology",
    description:
      "A religious belief that financial wealth is a sign of divine favor",
    status: "proposed",
  },
  {
    canonical: "experience",
    variations: ["experiences", "experiential"],
    category: "theology",
    description:
      "Subjective or objective perceptions, that influence worldview",
    status: "proposed",
  },
  {
    canonical: "Pastor",
    variations: [],
    category: "miscellaneous",
    llmVerify: true,
    description: "Religious leader in a Christian church",
    status: "accepted",
    episodes: [138, 139, 144],
  },
  {
    canonical: "seminary",
    variations: ["seminaries"],
    category: "scholarship",
    description: "Educational institution for training religious leaders",
    status: "rejected",
  },
  {
    canonical: "community",
    variations: [],
    category: "miscellaneous",
    description:
      "A group of people living in the same place or having a particular characteristic in common",
    status: "proposed",
  },
  {
    canonical: "Jesus Christ",
    variations: ["Christ"],
    category: "theology",
    description:
      "Central figure in Christianity, believed to be the Son of God and the Messiah",
    status: "rejected",
  },
  {
    canonical: "Lord Jesus Christ",
    variations: ["Jesus Christ"],
    category: "theology",
    description:
      "A title used to refer to Jesus, affirming his divine status and role as savior",
    status: "proposed",
  },
  {
    canonical: "the wilderness narrative",
    variations: [],
    category: "literature",
    description:
      "Stories in Exodus and Numbers about the Israelites wandering in the wilderness after the Exodus from Egypt.",
    status: "proposed",
  },
  {
    canonical: "historicity",
    variations: [],
    category: "scholarship",
    description:
      "The question of whether events described in a text actually occurred in the past.",
    status: "proposed",
  },
  {
    canonical: "genre",
    variations: [],
    category: "scholarship",
    description:
      "A category of literary composition characterized by a particular style, form, or content; relevant for interpreting texts.",
    status: "proposed",
  },
  {
    canonical: "The Merchant of Venice",
    variations: ["Merchant of Venice"],
    category: "literature",
    description:
      "A play by William Shakespeare featuring Shylock, a Jewish moneylender, and dealing with themes of justice, mercy, and prejudice",
    status: "proposed",
  },
  {
    canonical: "Parable of the Talents",
    variations: [],
    category: "literature",
    description:
      "A parable told by Jesus in the Gospel of Matthew, concerning a master who entrusts his property to his servants before going on a journey",
    status: "proposed",
  },
  {
    canonical: "Yii-Jan Lin",
    variations: ["Dr. Lin", "Lin"],
    category: "person",
    description:
      "Associate Professor of New Testament at Yale Divinity School and author of 'Immigration and Apocalypse'",
    status: "proposed",
  },
  {
    canonical: "nicene creed",
    variations: ["nicene"],
    category: "event",
    description:
      "A statement of Christian belief formulated at the Council of Nicaea in 325 CE",
    status: "proposed",
  },
  {
    canonical: "constantinople",
    variations: ["constantinople patriarch"],
    category: "place",
    description:
      "Historical city, formerly the capital of the Roman, Byzantine, and Ottoman empires, now Istanbul.",
    status: "proposed",
  },
  {
    canonical: "sunday",
    variations: ["Lord's Day"],
    category: "miscellaneous",
    description: "A day of the week often associated with Christian worship.",
    status: "proposed",
  },
  {
    canonical: "Epistle of Barnabas",
    variations: ["Barnabas"],
    category: "literature",
    description:
      "A non-canonical letter attributed to Barnabas, discussing the interpretation of the Hebrew Bible and early Christian practices",
    status: "proposed",
  },
  {
    canonical: "Golden Rule",
    variations: [],
    category: "theology",
    description:
      "Ethical principle stating 'Do unto others as you would have them do unto you'",
    status: "proposed",
  },
  {
    canonical: "Zipporah",
    variations: [],
    category: "character",
    description: "The wife of Moses, daughter of Jethro, a priest of Midian",
    status: "proposed",
  },
  {
    canonical: "Hasmonean Kingdom",
    variations: ["Hasmonean"],
    category: "event",
    description:
      "An independent Jewish kingdom established by the Hasmonean dynasty following the Maccabean revolt",
    status: "proposed",
  },
  {
    canonical: "the exiles",
    variations: ["exiles"],
    category: "people",
    description:
      "The Israelites who were deported from Jerusalem to Babylon during the Babylonian exile",
    status: "proposed",
  },
  {
    canonical: "Pride Month",
    variations: ["Gay Pride Month", "LGBTQ Pride month"],
    category: "miscellaneous",
    description:
      "A month dedicated to celebrating and commemorating LGBTQ+ pride, typically held in June.",
    status: "proposed",
  },
  {
    canonical: "Oxford English Dictionary",
    variations: ["OED"],
    category: "literature",
    description:
      "A comprehensive dictionary of the English language, known for its detailed etymologies and historical usage examples.",
    status: "proposed",
  },
  {
    canonical: "Leviathan",
    variations: ["Litan", "Loton"],
    category: "character",
    description:
      "Sea monster or dragon, often associated with chaos, mentioned in the Hebrew Bible.",
    status: "proposed",
  },
  {
    canonical: "Amenemope",
    variations: ["Instruction of Amenemope"],
    category: "person",
    description:
      "Author of the Instruction of Amenemope, an Egyptian wisdom text that shares similarities with Proverbs.",
    status: "rejected",
  },
  {
    canonical: "Ethnicity",
    variations: ["ethnic"],
    category: "miscellaneous",
    description:
      "Shared cultural, ancestral, and social identity within a group, distinct from race",
    status: "proposed",
  },
  {
    canonical: "Phoenix",
    variations: [],
    category: "place",
    description:
      "City in Arizona mentioned in the context of weather comparison",
    status: "proposed",
  },
  {
    canonical: "Code of Hammurabi",
    variations: [],
    category: "literature",
    description:
      "A well-preserved Babylonian code of law of ancient Mesopotamia",
    status: "proposed",
  },
  {
    canonical: "Practicing Safer Texts",
    variations: [],
    category: "literature",
    description:
      "Book by Ken Stone exploring interpretations of the Bible related to food, sex, and ethnicity",
    status: "proposed",
  },
  {
    canonical: "Trump administration",
    variations: ["Trump"],
    category: "event",
    description:
      "The Executive branch of the U.S. federal government led by President Donald Trump (2017-2021).",
    status: "proposed",
  },
  {
    canonical: "law",
    variations: [],
    category: "miscellaneous",
    description:
      "Rules established by authority or custom with legal consequences. Used in discussions about immigration policy.",
    status: "proposed",
    caseSensitive: true,
  },
  {
    canonical: "Tucker Carlson",
    variations: [],
    category: "person",
    description:
      "Political commentator and media personality, known for his conservative viewpoints",
    status: "proposed",
  },
  {
    canonical: "Zion",
    variations: [],
    category: "place",
    description:
      "A term with multiple layers of meaning in the Hebrew Bible, often referring to Jerusalem or the promised land",
    status: "proposed",
  },
  {
    canonical: "Canon",
    variations: ["Canonicity"],
    category: "theology",
    description:
      "The list of books considered authoritative scripture in a particular religion. In Christianity, it refers to the collection of books considered to be the inspired word.",
    status: "proposed",
  },
  {
    canonical: "Tertullian",
    variations: [],
    category: "person",
    llmVerify: true,
    description:
      "A prolific early Christian author from Carthage in the late 2nd and early 3rd centuries CE, known for his theological and apologetic writings in Latin.",
    status: "accepted",
    episodes: [12, 50, 62, 69, 70, 104, 120, 142, 148, 156],
  },
  {
    canonical: "king uzziah",
    variations: ["Uzziah"],
    category: "person",
    description:
      "King of Judah in the 8th century BCE, whose reign marked a period of prosperity and expansion.",
    status: "proposed",
  },
  {
    canonical: "Terah",
    variations: ["Terach"],
    category: "character",
    llmVerify: true,
    description:
      "Abraham's father, who initially leads his family from Ur of the Chaldeans toward Canaan.",
    status: "accepted",
    episodes: [118, 121, 150],
  },
  {
    canonical: "Ur of the Chaldeans",
    variations: ["Ur"],
    category: "place",
    description:
      "The ancestral homeland of Abraham and his family, from which they migrate to Haran.",
    status: "proposed",
  },
  {
    canonical: "Gerar",
    variations: ["the region of Gerar"],
    category: "place",
    description:
      "A Philistine city where Abraham and Sarah, and later Isaac and Rebekah, sojourn and encounter King Abimelech.",
    status: "proposed",
  },
  {
    canonical: "Teraphim",
    variations: [],
    category: "miscellaneous",
    description:
      "Household idols or divine images, often associated with divination and protection.",
    status: "accepted",
    episodes: [31, 121, 155],
  },
  {
    canonical: "King Ahab",
    variations: ["Ahab"],
    category: "character",
    description:
      "King of Israel in the 9th century BCE, husband of Jezebel, criticized in the Hebrew Bible for promoting the worship of Baal",
    status: "proposed",
  },
  {
    canonical: "Threads",
    variations: [],
    category: "miscellaneous",
    description: "Social media platform by Meta, launched in July 2023",
    status: "proposed",
  },
  {
    canonical: "bene elohim",
    variations: ["sons of God", "bene elohim"],
    category: "theology",
    description:
      'A Hebrew phrase meaning "sons of God," referring to divine beings or members of the divine council',
    status: "proposed",
  },
  {
    canonical: "mormon",
    variations: ["Mormons"],
    category: "religion",
    description:
      "A member of the Church of Jesus Christ of Latter-day Saints, a religious tradition founded by Joseph Smith",
    status: "proposed",
  },
  {
    canonical: "rogan",
    variations: ["joe rogan"],
    category: "miscellaneous",
    description: "Reference to the Joe Rogan Experience podcast",
    status: "proposed",
  },
  {
    canonical: "james white",
    variations: ["white"],
    category: "person",
    description:
      "An American apologist, author, and director of Alpha and Omega Ministries known for his debates",
    status: "rejected",
  },
  {
    canonical: "texans",
    variations: [],
    category: "miscellaneous",
    description: "Relating to the U.S. state of Texas",
    status: "proposed",
  },
  {
    canonical: "Doug Wilson",
    variations: ["Wilson"],
    category: "person",
    description:
      "American pastor, theologian, and author associated with the Christian Reconstructionist movement",
    status: "rejected",
  },
  {
    canonical: "Kedeshah",
    variations: [],
    category: "miscellaneous",
    description:
      "Hebrew term, often translated as 'cult prostitute,' but debated in its meaning and association with sex work",
    status: "proposed",
  },
  {
    canonical: "Neo-Assyrian",
    variations: [],
    category: "event",
    description: "Pertaining to the Neo-Assyrian Empire",
    status: "proposed",
  },
  {
    canonical: "Shemesh",
    variations: ["Beit Shemesh"],
    category: "place",
    description:
      "An ancient Biblical city on the border between the tribes of Judah and Dan",
    status: "proposed",
  },
  {
    canonical: "Holy Grail",
    variations: ["the Grail", "Grail"],
    category: "miscellaneous",
    llmVerify: true,
    description:
      "A legendary artifact, often depicted as a cup or dish, with significance in Christian and Arthurian traditions",
    status: "accepted",
    episodes: [127],
  },
  {
    canonical: "CEB",
    variations: ["Common English Bible"],
    category: "literature",
    description:
      "The Common English Bible, a translation intended for a broad audience",
    status: "proposed",
  },
  {
    canonical: "John the son of Zebedee",
    variations: ["John"],
    category: "character",
    description:
      "One of the Twelve Apostles of Jesus, traditionally believed to be the author of the Gospel of John and other Johannine works.",
    status: "proposed",
  },
  {
    canonical: "Midian",
    variations: ["Midianites"],
    category: "place",
    description:
      "Territory south-southeast of Israel, east of the Gulf of Aqaba; associated with Jethro, Moses' father-in-law",
    status: "proposed",
  },
  {
    canonical: "angel of the Lord",
    variations: [],
    category: "theology",
    description:
      "In the Hebrew Bible, a messenger of God, sometimes considered a manifestation of God himself",
    status: "proposed",
  },
  {
    canonical: "amorite",
    variations: ["Amorites"],
    category: "people",
    description: "An ancient Semitic-speaking people from ancient Syria",
    status: "proposed",
  },
  {
    canonical: "Shechem",
    variations: [],
    category: "place",
    description: "An ancient city in Samaria, mentioned in the Hebrew Bible",
    status: "proposed",
  },
  {
    canonical: "shittim",
    variations: [],
    category: "miscellaneous",
    description:
      "Type of wood mentioned in the Hebrew Bible, particularly in connection with the construction of the Tabernacle and Ark of the Covenant.",
    status: "proposed",
  },
  {
    canonical: "peace and safety",
    variations: [],
    category: "theology",
    description:
      "Phrase in 1 Thessalonians 5:3 often associated with end-times prophecies and the Antichrist",
    status: "proposed",
  },
  {
    canonical: "Adultery",
    variations: ["adulterous"],
    category: "theology",
    description:
      "Sexual relations between a married person and someone other than their spouse; a violation of marital fidelity",
    status: "accepted",
    episodes: [
      11, 17, 21, 31, 39, 41, 44, 50, 54, 60, 66, 68, 87, 89, 94, 97, 101, 108,
      110, 112, 125, 128, 129, 133, 135, 139, 140, 151,
    ],
  },
  {
    canonical: "Baals",
    variations: ["the Baals"],
    category: "character",
    description:
      "Plural form of Baal, referring to various local deities or idols worshiped instead of Yahweh in ancient Israel",
    status: "proposed",
  },
  {
    canonical: "Cross",
    variations: ["crossbeam", "T-shaped cross"],
    category: "miscellaneous",
    description:
      "A symbol representing the crucifixion of Jesus, central to Christianity",
    status: "proposed",
  },
  {
    canonical: "John Dominic Crossan",
    variations: ["Dom Crossan", "Crossan"],
    category: "person",
    description:
      "New Testament scholar known for his work on the historical Jesus.",
    status: "proposed",
  },
  {
    canonical: "angel of the presence",
    variations: ["malak adonai", "messenger of Adonai"],
    category: "theology",
    description:
      "An angel that mediates between God and Moses in the Book of Jubilees.",
    status: "proposed",
  },
  {
    canonical: "Polygamy",
    variations: ["polygyny", "polygamous"],
    category: "miscellaneous",
    description:
      "The practice of having more than one spouse at the same time, specifically polygyny (one man, multiple wives) in the biblical context discussed.",
    status: "accepted",
    episodes: [10, 21, 29, 44, 108, 114, 121, 139, 142, 144],
  },
  {
    canonical: "Nathan",
    variations: [],
    category: "character",
    description: "A prophet in the Hebrew Bible who advised King David.",
    status: "proposed",
  },
  {
    canonical: "Rich Tidwell",
    variations: ["Tidwell"],
    category: "person",
    description:
      "A pastor who publicly came out as polygamist, sparking debate among evangelicals.",
    status: "proposed",
  },
  {
    canonical: "King Shishak",
    variations: ["Shishak"],
    category: "person",
    description:
      "Egyptian pharaoh mentioned in the Hebrew Bible who raided Jerusalem during the reign of Rehoboam.",
    status: "proposed",
  },
  {
    canonical: "Jeroboam",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "First king of the northern kingdom of Israel after the split from Judah.",
    status: "accepted",
    episodes: [7, 64, 110, 139, 149],
  },
  {
    canonical: "Pope",
    variations: [],
    category: "person",
    description: "The head of the Roman Catholic Church",
    status: "proposed",
  },
  {
    canonical: "Original sin",
    variations: [],
    category: "theology",
    description:
      "Christian doctrine that all humans are born with an inherited sinfulness originating from Adam's transgression in the Garden of Eden",
    status: "accepted",
    episodes: [44, 51, 56, 71, 120, 140, 142],
  },
  {
    canonical: "Ken Ham",
    variations: ["Ham"],
    category: "person",
    description:
      "Christian apologist and creationist, founder of Answers in Genesis",
    status: "proposed",
  },
  {
    canonical: "Archelaus",
    variations: ["herod archelaus"],
    category: "person",
    description: "Son of Herod the Great, ruled Judea after his father's death",
    status: "rejected",
  },
  {
    canonical: "Answers in Genesis",
    variations: ["AiG"],
    category: "religion",
    description: "Young Earth creationist organization",
    status: "proposed",
  },
  {
    canonical: "Quirinius",
    variations: ["cyrenius"],
    category: "person",
    description: "Roman governor of Syria during the time of Jesus's birth",
    status: "proposed",
  },
  {
    canonical: "eve's",
    variations: [],
    category: "character",
    description:
      "The first woman in the Bible; partner of Adam and tempted by the serpent",
    status: "proposed",
  },
  {
    canonical: "snake",
    variations: [],
    category: "character",
    description:
      "The talking snake in the Garden of Eden who tempts Eve to eat from the tree of knowledge",
    status: "proposed",
  },
  {
    canonical: "theologians",
    variations: [],
    category: "person",
    description: "Scholars who study the nature of God and religious beliefs",
    status: "proposed",
  },
  {
    canonical: "mikveh",
    variations: [],
    category: "miscellaneous",
    description: "A ritual bath used for purification in Judaism",
    status: "proposed",
  },
  {
    canonical: "Law and the Prophets",
    variations: ["Law or the Prophets"],
    category: "literature",
    description:
      "A common division of the Hebrew Bible into two parts: the Law (Torah) and the Prophets (Nevi'im)",
    status: "proposed",
  },
  {
    canonical: "Xerxes",
    variations: ["Ahasuerus"],
    category: "person",
    description:
      "King of Persia during the events of the Book of Esther; also known as Ahasuerus.",
    status: "proposed",
  },
  {
    canonical: "Thecla",
    variations: ["Thecla's"],
    category: "character",
    description:
      "A central character in the apocryphal Acts of Paul and Thecla, known for her devotion to an ascetic life and her eventual role as a teacher",
    status: "proposed",
  },
  {
    canonical: "Alexander",
    variations: ["alexamenos"],
    category: "person",
    description:
      "A citizen of Antioch who attempts to molest Thecla, but is humiliated and later tries to have her killed in the arena.",
    status: "rejected",
  },
  {
    canonical: "Theokleia",
    variations: ["Theocleia"],
    category: "character",
    description:
      "The mother of Thecla in the Acts of Paul and Thecla, who initially opposes her daughter's embrace of asceticism.",
    status: "proposed",
  },
  {
    canonical: "interpretation",
    variations: ["interpretations", "interpretive"],
    category: "scholarship",
    description:
      "The process of explaining the meaning of a text; in biblical studies, it involves various methods and perspectives.",
    status: "proposed",
  },
  {
    canonical: "text",
    variations: ["texts"],
    category: "literature",
    description:
      "Referring to biblical or ancient near eastern documents and writings.",
    status: "proposed",
  },
  {
    canonical: "the bible for normal people",
    variations: ["bible for normal people"],
    category: "miscellaneous",
    description:
      "A podcast and organization focused on making biblical scholarship accessible to a general audience.",
    status: "proposed",
  },
  {
    canonical: "pete enns",
    variations: ["enns"],
    category: "person",
    description:
      "Biblical scholar and author known for his work on biblical interpretation and his engagement with a broad audience through 'The Bible for Normal People'.",
    status: "proposed",
  },
  {
    canonical: "liberation theology",
    variations: ["white theology", "male theology"],
    category: "theology",
    description:
      "A theological movement that emphasizes the liberation of the oppressed and marginalized.",
    status: "proposed",
  },
  {
    canonical: "origin",
    variations: [],
    category: "person",
    description:
      "An early Christian scholar and theologian known for his allegorical interpretation of Scripture.",
    status: "proposed",
    caseSensitive: true,
  },
  {
    canonical: "Zoroastrian",
    variations: [],
    category: "religion",
    description: "Ancient Persian religion, founded by the prophet Zoroaster",
    status: "proposed",
  },
  {
    canonical: "translation",
    variations: ["translations"],
    category: "scholarship",
    description:
      "The process of converting a text from one language to another, often involving interpretive choices",
    status: "proposed",
  },
  {
    canonical: "gematria",
    variations: [],
    category: "miscellaneous",
    description:
      "A method of interpreting texts by assigning numerical values to letters and words",
    status: "proposed",
  },
  {
    canonical: "Sola Scriptura",
    variations: [],
    category: "theology",
    description:
      "Protestant Christian doctrine that the Bible is the supreme authority in all matters of doctrine and practice",
    status: "proposed",
  },
  {
    canonical: "Renaissance",
    variations: [],
    category: "event",
    description:
      "A period in European history marking the transition from the Middle Ages to modernity",
    status: "proposed",
  },
  {
    canonical: "Lincoln Blumell",
    variations: ["Lincoln"],
    category: "person",
    description:
      "Professor in religious education at Brigham Young University, author of Lady Eclecte: The Lost Woman of the New Testament",
    status: "rejected",
  },
  {
    canonical: "Papyri",
    variations: ["papyrus"],
    category: "literature",
    description:
      "Ancient paper made from the papyrus plant, used for writing documents and letters.",
    status: "proposed",
  },
  {
    canonical: "Clement of Alexandria",
    variations: ["Clement"],
    category: "person",
    llmVerify: true,
    description:
      "An early Christian theologian and head of the Catechetical School of Alexandria.",
    status: "accepted",
    episodes: [50, 69, 99, 110, 153, 156],
  },
  {
    canonical: "Elder",
    variations: ["the Elder"],
    category: "miscellaneous",
    description:
      "Title used by the author of 2 John and 3 John, possibly referring to a leader in the early church",
    status: "proposed",
  },
  {
    canonical: "Lectio brevior",
    variations: ["shorter reading"],
    category: "scholarship",
    description:
      "Text-critical principle that the shorter reading is generally preferred as more likely to be original.",
    status: "proposed",
  },
  {
    canonical: "Lectio longior",
    variations: ["longer reading"],
    category: "scholarship",
    description:
      "Text-critical principle that the longer reading is generally preferred as more likely to be original.",
    status: "proposed",
  },
  {
    canonical: "Eclecte",
    variations: ["Lady Eclecte", "Lady Eklekte"],
    category: "character",
    llmVerify: true,
    description:
      'A woman\'s name proposed as the addressee of 2 John, instead of the traditional "elect lady" interpretation.',
    status: "accepted",
    episodes: [153],
  },
  {
    canonical: "2nd century CE",
    variations: [],
    category: "miscellaneous",
    description:
      "Refers to the time period of 100-200 CE, the era when many early Christian and Rabbinic texts were written.",
    status: "proposed",
  },
  {
    canonical: "Acts of Andrew",
    variations: ["Acts of Apostle Andrew"],
    category: "literature",
    description:
      "An apocryphal text describing the ministry and martyrdom of the Apostle Andrew.",
    status: "proposed",
  },
  {
    canonical: "Acts of Peter",
    variations: [],
    category: "literature",
    description:
      "An apocryphal text from the 2nd century that describes the ministry and martyrdom of the Apostle Peter.",
    status: "proposed",
  },
  {
    canonical: "uriel",
    variations: ["sariel"],
    category: "character",
    description: "Name of an angel.",
    status: "proposed",
  },
  {
    canonical: "raphael",
    variations: [],
    category: "character",
    description: "Name of an archangel.",
    status: "proposed",
  },
  {
    canonical: "shemihazah",
    variations: [],
    category: "character",
    description:
      "One of the chief angels who descended to Earth and had intercourse with human women, according to the Book of Enoch.",
    status: "proposed",
  },
  {
    canonical: "eric swalwell",
    variations: ["representative swalwell", "swalwell"],
    category: "person",
    description:
      "Democratic Representative from California's 14th district who was a guest on the podcast.",
    status: "rejected",
    addedInEpisode: 96,
  },
  {
    canonical: "constitution",
    variations: ["the constitution"],
    category: "miscellaneous",
    description: "The supreme law of the United States of America.",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "caesars",
    variations: ["caesar"],
    category: "miscellaneous",
    description: "Title for Roman Emperors",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "lutheran",
    variations: ["lutheran church"],
    category: "religion",
    description:
      "A branch of Protestant Christianity that identifies with the teachings of Martin Luther.",
    status: "proposed",
    addedInEpisode: 96,
  },
  {
    canonical: "Maccabean Revolt",
    variations: ["Maccabean revolt"],
    category: "event",
    description:
      "A Jewish rebellion against the Seleucid Empire in the 2nd century BCE, described in the Books of Maccabees",
    status: "accepted",
    addedInEpisode: 158,
    episodes: [20, 71, 117, 158],
  },
  {
    canonical: "Simone",
    variations: [],
    category: "person",
    description:
      "Patreon community member who critiqued Dan McClellan's use of the prophetic critique.",
    status: "rejected",
    addedInEpisode: 158,
  },
  {
    canonical: "Seleucid Empire",
    variations: ["Seleucids"],
    category: "people",
    llmVerify: true,
    description:
      "A Hellenistic empire that existed in the Middle East and parts of Asia after the death of Alexander the Great",
    status: "accepted",
    addedInEpisode: 158,
    episodes: [4, 11, 15, 32, 34, 43, 62, 71, 87, 112, 123, 147, 158],
  },
  {
    canonical: "Prototype Theory",
    variations: [],
    category: "scholarship",
    status: "accepted",
    episodes: [9, 77, 124, 136],
  },
  {
    canonical: "Mark of the Beast",
    variations: [],
    category: "theology",
    status: "accepted",
    episodes: [4, 9, 39, 54],
  },
  {
    canonical: "Homosexuality",
    variations: ["same sex", "same-sex"],
    category: "miscellaneous",
    llmVerify: true,
    description: "same sex intercourse, sexual acts, or romantic attraction",
    status: "accepted",
    episodes: [3, 10, 17, 30, 83, 89, 91, 103, 104, 114, 124, 125, 129, 139],
  },
  {
    canonical: "Abortion",
    variations: [],
    category: "miscellaneous",
    status: "accepted",
    episodes: [
      21, 23, 27, 28, 33, 60, 79, 80, 83, 84, 87, 91, 93, 101, 106, 110, 120,
      124, 130, 134, 140, 145, 147,
    ],
  },
  {
    canonical: "Magi",
    variations: ["three kings", "three wise men"],
    category: "character",
    llmVerify: true,
    description:
      "led to Jesus by the star of Bethlehem in the Gospel of Matthew",
    status: "accepted",
    episodes: [34, 37, 38, 86, 87, 150],
  },
  {
    canonical: "Religion as Make-Believe",
    variations: [],
    category: "literature",
    description:
      "A book by Neil Van Leeuwen exploring the psychological nature of religious beliefs as sacralized imaginings.",
    status: "rejected",
    addedInEpisode: 51,
  },
  {
    canonical: "Psychology",
    variations: ["psychological"],
    category: "scholarship",
    description:
      "The scientific study of the mind and behavior, explored here in the context of religious and ideological beliefs.",
    status: "rejected",
    addedInEpisode: 51,
  },
  {
    canonical: "Philosophy",
    variations: ["philosophical"],
    category: "scholarship",
    description:
      "The study of fundamental questions about existence, knowledge, values, reason, mind, and language, intersecting with psychology and religion in this discussion.",
    status: "rejected",
    addedInEpisode: 51,
  },
  {
    canonical: "Factual belief",
    variations: [],
    category: "scholarship",
    description:
      "A cognitive attitude reflecting one's acceptance of something as true, characterized by being involuntary and vulnerable to evidence.",
    status: "rejected",
    addedInEpisode: 51,
  },
  {
    canonical: "Imagining",
    variations: ["imagination", "imaginative"],
    category: "scholarship",
    description:
      "A cognitive attitude involving mental representation for the sake of make-believe or supposition, characterized by voluntary control and freedom from evidential constraint.",
    status: "rejected",
    addedInEpisode: 51,
  },
  {
    canonical: "Religious credence",
    variations: [],
    category: "theology",
    description:
      "A term coined by Neil Van Leeuwen to describe religious beliefs as sacralized imaginings, differing from factual belief in voluntariness and evidential constraint.",
    status: "proposed",
    addedInEpisode: 51,
  },
  {
    canonical: "Vineyard Church",
    variations: [],
    category: "religion",
    description:
      "A neocharismatic evangelical Christian denomination with an emphasis on worship, spiritual gifts, and social justice.",
    status: "proposed",
    addedInEpisode: 51,
  },
  {
    canonical: "Group identity",
    variations: [],
    category: "scholarship",
    description:
      "A person's sense of who they are based on their membership in a group, often influencing beliefs and behaviors.",
    status: "rejected",
    addedInEpisode: 51,
  },
  {
    canonical: "Triumphal Entry",
    variations: [],
    category: "event",
    status: "accepted",
    episodes: [15, 43, 46, 50, 57, 87],
  },
  {
    canonical: "Flat Earth",
    variations: [],
    category: "miscellaneous",
    status: "accepted",
    episodes: [9, 57, 90],
  },
  {
    canonical: "Creatio ex nihilo",
    variations: ["ex nihilo"],
    category: "theology",
    status: "accepted",
    episodes: [5, 58, 59, 70, 93, 112, 115, 152, 156],
  },
  {
    canonical: "Ruth",
    variations: [],
    category: "character",
    llmVerify: true,
    description:
      "person after whom the Book of Ruth is named. She was a Moabite woman who married an Israelite, Mahlon, specifically not referring generally to the Book of Ruth",
    status: "accepted",
    episodes: [68, 72, 108, 116],
  },
  {
    canonical: "Omni Attributes",
    variations: [
      "omnipotent",
      "omnipotence",
      "omniscient",
      "omniscience",
      "omnipresent",
      "omnipresence",
      "omnibenevolent",
      "omnibenevolence",
    ],
    category: "theology",
    status: "accepted",
    episodes: [1, 3, 13, 29, 51, 53, 55, 59, 80, 91],
  },
  {
    canonical: "Covenant Code",
    variations: [],
    category: "miscellaneous",
    status: "accepted",
    episodes: [21, 23, 31, 93, 104, 106, 155],
  },
  {
    canonical: "1 Esdras",
    variations: ["First Esdras", "Greek Ezra"],
    category: "literature",
    description:
      "An Old Testament apocryphal book found in Greek and Slavonic Orthodox traditions, primarily a Greek translation of Ezra-Nehemiah with some additional material.",
    status: "rejected",
    addedInEpisode: 159,
  },
  {
    canonical: "Darius",
    variations: ["King Darius"],
    category: "person",
    description:
      "A Persian king mentioned in biblical texts, notably in the Book of Daniel and Ezra-Nehemiah, often associated with the post-exilic period.",
    status: "proposed",
    addedInEpisode: 159,
  },
  {
    canonical: "Masoretes",
    variations: [],
    category: "people",
    description:
      "A group of Jewish scribes and scholars active from roughly 500 to 1000 CE, responsible for standardizing the Hebrew Bible text, including vocalization and annotation.",
    status: "accepted",
    addedInEpisode: 159,
    episodes: [7, 11, 20, 99, 154, 159],
  },
  {
    canonical: "Immaculate Conception",
    variations: ["immaculate", "conception"],
    category: "theology",
    llmVerify: true,
    description:
      "the doctrine that the Virgin Mary was free of original sin from the moment of her conception",
    status: "accepted",
    episodes: [140, 141],
  },
  {
    canonical: "Blasphemy",
    variations: ["blaspheme"],
    category: "theology",
    llmVerify: true,
    description:
      "an insult that shows contempt, disrespect or lack of reverence concerning a deity, an object considered sacred, or something that is considered inviolable",
    status: "accepted",
    episodes: [19, 42, 55, 62, 134, 148],
  },
];

export function getAllSearchableTerms(
  vocabulary: TagDefinition[],
): Set<string> {
  const termMap = new Set<string>();

  for (const tag of vocabulary) {
    termMap.add(tag.canonical.toLowerCase());

    for (const variation of tag.variations) {
      termMap.add(variation.toLowerCase());
    }
  }

  return termMap;
}
