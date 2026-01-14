/**
 * Segment types for Data Over Dogma podcast episodes.
 */
export type SegmentType =
  | 'advertisement'
  | 'all-right-lets-see-it'
  | 'archaeology-of-israel'
  | 'by-the-numbers'
  | 'chapter-and-verse'
  | 'conspiracy-watch'
  | 'could-it-be-satan'
  | 'ex-eventu'
  | 'getting-angelic'
  | 'getting-demonic'
  | 'intro'
  | 'is-it-canon'
  | 'its-the-law'
  | 'know-your-bible'
  | 'main-content'
  | 'mcclellan-911'
  | 'nature-of-god'
  | 'outro'
  | 'thats-history'
  | 'urban-legends'
  | 'what-does-that-mean'
  | 'whos-that'
  | 'women-in-the-bible'
  | 'your-patriarchy-and-you';

/**
 * Human-readable labels for segment types.
 */
export const SEGMENT_LABELS: Record<SegmentType, string> = {
  intro: 'Intro',
  'all-right-lets-see-it': "All Right, Let's See It",
  'archaeology-of-israel': 'Archaeology of Israel',
  'by-the-numbers': 'By the Numbers',
  'chapter-and-verse': 'Chapter and Verse',
  'conspiracy-watch': 'Conspiracy Watch',
  'could-it-be-satan': 'Could it be Satan?',
  'ex-eventu': 'Ex Eventu',
  'getting-angelic': 'Getting Angelic',
  'getting-demonic': 'Getting Demonic',
  'is-it-canon': 'Is it Canon?',
  'its-the-law': "It's the Law",
  'know-your-bible': 'Know Your Bible',
  'main-content': 'Main Content',
  'mcclellan-911': 'McClellan 911',
  'nature-of-god': 'Nature of God',
  'thats-history': "That's History",
  'urban-legends': 'Urban Legends',
  'what-does-that-mean': 'What Does That Mean?',
  'whos-that': "Who's That?",
  'women-in-the-bible': 'Women in the Bible',
  'your-patriarchy-and-you': 'Your Patriarchy and You',
  advertisement: 'Advertisement',
  outro: 'Outro',
};

/**
 * Colors for segment visualization in UI.
 */
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  intro: '#6366f1', // indigo
  'all-right-lets-see-it': '#ef4444', // red
  'archaeology-of-israel': '#a16207', // yellow-700 (bronze/earth tone)
  'by-the-numbers': '#06b6d4', // cyan-500
  'chapter-and-verse': '#22c55e', // green
  'conspiracy-watch': '#dc2626', // red-600 (darker red)
  'could-it-be-satan': '#7c3aed', // violet-600 (deep purple)
  'ex-eventu': '#6366f1', // indigo-500 (scholarly/prophecy)
  'getting-angelic': '#fbbf24', // amber-400 (golden/heavenly)
  'getting-demonic': '#b91c1c', // red-700 (dark red)
  'is-it-canon': '#14b8a6', // teal
  'its-the-law': '#059669', // emerald-600 (legal/authoritative green)
  'know-your-bible': '#10b981', // emerald-500
  'main-content': '#64748b', // slate
  'mcclellan-911': '#ec4899', // pink
  'nature-of-god': '#3b82f6', // blue-500 (divine/theological)
  'thats-history': '#84cc16', // lime-500 (lime green)
  'urban-legends': '#8b5cf6', // violet
  'what-does-that-mean': '#f59e0b', // amber
  'whos-that': '#0ea5e9', // sky-500 (sky blue)
  'women-in-the-bible': '#db2777', // pink-600 (rose)
  'your-patriarchy-and-you': '#a855f7', // purple-500
  advertisement: '#f97316', // orange
  outro: '#6366f1', // indigo (same as intro)
};

/**
 * Regex patterns for detecting segment boundaries.
 * Each pattern should match the verbal marker that indicates segment start.
 * Patterns are case-insensitive.
 */
export const SEGMENT_PATTERNS: Record<
  Exclude<SegmentType, 'intro' | 'main-content'>,
  RegExp[]
> = {
  'chapter-and-verse': [
    /let'?s\s+(dive into|do a|start with)\s+chapter and verse/i,
    /coming up.*chapter and verse/i,
    /before that.*chapter and verse/i,
    /let'?s\s+go\s+chapter and verse/i,
    /In keeping with the theme today, we're going to do a Chapter/i,
    /All right, well, let's dive into chapter and verse\./i,
  ],
  'what-does-that-mean': [
    /welcome to.*what does that mean/i,
    /segment.*what does that mean/i,
    /call it what does that mean/i,
    /For my segment, "What Does That Mean\?", we're going to be ta/i,
  ],
  'all-right-lets-see-it': [/all right,?\s+let'?s see it/i],
  'urban-legends': [
    /welcome to.*urban legends/i,
    /segment.*urban legends/i,
    /urban legends.*spread.*far and wide/i,
  ],
  'mcclellan-911': [/mcclellan 911/i, /what is your emergency/i],
  'is-it-canon': [/is it canon\?/i, /welcome to.*is it canon/i],
  'its-the-law': [/it'?s the law/i, /welcome to.*it'?s the law/i,
    /We might as well just launch into our first segment\./i,
  ],
  'conspiracy-watch': [
    /conspiracy watch/i,
    /welcome to.*conspiracy watch/i,
    /But for now, let's get on Conspiracy Watch\./i,
  ],
  'archaeology-of-israel': [
    /archaeology of israel/i,
    /welcome to.*archaeology of israel/i,
    /Let's look at archaeology of Israel\./i,
  ],
  'whos-that': [/who'?s that\?/i, /welcome to.*who'?s that/i],
  'women-in-the-bible': [
    /women in the bible/i,
    /welcome to.*women in the bible/i,
    /We're introducing this new segment, Women in the Bible, beca/i,
  ],
  'your-patriarchy-and-you': [
    /your patriarchy and you/i,
    /welcome to.*your patriarchy and you/i,
    /segment.*your patriarchy and you/i,
  ],
  'thats-history': [/that'?s history/i, /welcome to.*that'?s history/i],
  'know-your-bible': [
    /know your bible/i,
    /welcome to.*know your bible/i,
    /So on this edition of Know Your Bible, we're going to jump o/i,
  ],
  'could-it-be-satan': [
    /could it be satan\??/i,
    /welcome to.*could it be satan/i,
  ],
  'by-the-numbers': [/by the numbers/i, /welcome to.*by the numbers/i],
  'getting-angelic': [/getting angelic/i, /welcome to.*getting angelic/i],
  'getting-demonic': [/getting demonic/i, /welcome to.*getting demonic/i],
  'nature-of-god': [
    /nature of god/i,
    /welcome to.*nature of god/i,
    /segment.*nature of god/i,
  ],
  'ex-eventu': [
    /ex eventu/i,
    /welcome to.*ex eventu/i,
    /segment.*ex eventu/i,
  ],
  advertisement: [
    /support the (data over dogma )?podcast/i,
    /become a patron/i,
    /how you can support/i,
    /patreon\.com/i,
    /Hey, everybody, have you ever wondered how you can support t/i,
  ],
  outro: [
    /we'?ll talk to you (again\s+)?next week/i,
    /thanks for listening.*next week/i,
    /see you next week/i,
    /have a good one/i,
  ],
};

/**
 * Intro detection patterns - these mark the END of intro.
 * Intro is from start (00:00:00) until one of these patterns is found.
 */
export const INTRO_END_PATTERNS: RegExp[] = [
  // Welcome/intro tagline typically marks end of intro
  /welcome to the data over dogma podcast/i,
  /combat the spread of misinformation/i,
];
