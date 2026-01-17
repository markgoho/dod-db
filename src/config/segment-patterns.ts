/**
 * Segment types for Data Over Dogma podcast episodes.
 */
export type SegmentType =
  | 'advertisement'
  | 'all-right-lets-see-it'
  | 'archaeology-of-israel'
  | 'artifacts-and-fiction'
  | 'bible-heroes'
  | 'bible-vs-bible'
  | 'by-the-numbers'
  | 'chapter-and-verse'
  | 'conspiracy-watch'
  | 'could-it-be-satan'
  | 'creation-stories'
  | 'eschatological'
  | 'ex-eventu'
  | 'getting-angelic'
  | 'getting-demonic'
  | 'historys-mysteries'
  | 'intro'
  | 'is-it-canon'
  | 'its-the-law'
  | 'know-your-bible'
  | 'left-behind'
  | 'magical-thinking'
  | 'main-content'
  | 'mcclellan-911'
  | 'nature-of-god'
  | 'opportunities-for-growth'
  | 'outro'
  | 'segment'
  | 'taking-issue'
  | 'textual-healing'
  | 'thats-history'
  | 'urban-legends'
  | 'what-does-that-mean'
  | 'what-is-that'
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
  'artifacts-and-fiction': 'Artifacts and Fiction',
  'bible-heroes': 'Bible Heroes?',
  'bible-vs-bible': 'Bible vs Bible',
  'by-the-numbers': 'By the Numbers',
  'chapter-and-verse': 'Chapter and Verse',
  'conspiracy-watch': 'Conspiracy Watch',
  'could-it-be-satan': 'Could it be Satan?',
  'creation-stories': 'Creation Stories',
  eschatological: 'Eschatological',
  'ex-eventu': 'Ex Eventu',
  'getting-angelic': 'Getting Angelic',
  'getting-demonic': 'Getting Demonic',
  'historys-mysteries': "History's Mysteries",
  'is-it-canon': 'Is it Canon?',
  'its-the-law': "It's the Law",
  'know-your-bible': 'Know Your Bible',
  'left-behind': 'Left Behind',
  'magical-thinking': 'Magical Thinking',
  'main-content': 'Main Content',
  'mcclellan-911': 'McClellan 911',
  'nature-of-god': 'Nature of God',
  'opportunities-for-growth': 'Opportunities for Growth',
  segment: 'Segment (Unknown)',
  'taking-issue': 'Taking Issue',
  'textual-healing': 'Textual Healing',
  'thats-history': "That's History",
  'urban-legends': 'Urban Legends',
  'what-does-that-mean': 'What Does That Mean?',
  'what-is-that': 'What is That?',
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
  'artifacts-and-fiction': '#92400e', // amber-800 (ancient/archaeological)
  'bible-heroes': '#60a5fa', // blue-400 (heroic/noble)
  'bible-vs-bible': '#0891b2', // cyan-600 (scholarly comparison)
  'by-the-numbers': '#06b6d4', // cyan-500
  'chapter-and-verse': '#22c55e', // green
  'conspiracy-watch': '#dc2626', // red-600 (darker red)
  'could-it-be-satan': '#7c3aed', // violet-600 (deep purple)
  'creation-stories': '#2dd4bf', // teal-400 (bright teal for origins/creation)
  eschatological: '#5b21b6', // violet-800 (apocalyptic/end times)
  'ex-eventu': '#6366f1', // indigo-500 (scholarly/prophecy)
  'getting-angelic': '#fbbf24', // amber-400 (golden/heavenly)
  'getting-demonic': '#b91c1c', // red-700 (dark red)
  'historys-mysteries': '#818cf8', // indigo-400 (mysterious/historical)
  'is-it-canon': '#14b8a6', // teal
  'its-the-law': '#059669', // emerald-600 (legal/authoritative green)
  'know-your-bible': '#10b981', // emerald-500
  'left-behind': '#7dd3fc', // sky-300 (ethereal/rapture theme)
  'magical-thinking': '#c026d3', // fuchsia-600 (mystical/supernatural)
  'main-content': '#64748b', // slate
  'mcclellan-911': '#ec4899', // pink
  'nature-of-god': '#3b82f6', // blue-500 (divine/theological)
  'opportunities-for-growth': '#2563eb', // blue-600 (learning/professional development)
  segment: '#9ca3af', // gray-400 (neutral/unknown)
  'taking-issue': '#ea580c', // orange-600 (debate/critique)
  'textual-healing': '#0891b2', // cyan-600 (textual analysis/manuscripts)
  'thats-history': '#84cc16', // lime-500 (lime green)
  'urban-legends': '#8b5cf6', // violet
  'what-does-that-mean': '#f59e0b', // amber
  'what-is-that': '#fb923c', // orange-400 (inquiry/exploration)
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
 * NOTE: Regex patterns are legacy/fallback. Audio jingle detection is now primary method.
 */
export const SEGMENT_PATTERNS: Record<
  Exclude<SegmentType, 'intro' | 'main-content' | 'segment'>,
  RegExp[]
> = {
  'bible-heroes': [
    /bible heroes\??/i,
    /welcome to.*bible heroes/i,
    /let'?s do.*bible heroes/i,
  ],
  'bible-vs-bible': [
    /bible vs\.? bible/i,
    /welcome to.*bible vs\.? bible/i,
    /let'?s do.*bible vs\.? bible/i,
  ],
  'chapter-and-verse': [/let'?s\s+(dive into|do a|start with)\s+chapter and verse/i,
    /coming up.*chapter and verse/i,
    /before that.*chapter and verse/i,
    /let'?s\s+go\s+chapter and verse/i,
    /In keeping with the theme today, we're going to do a Chapter/i,
    /All right, well, let's dive into chapter and verse\./i,
    /Well, let's start with chapter and verse\./i,
  ],
  'what-does-that-mean': [/welcome to.*what does that mean/i,
    /segment.*what does that mean/i,
    /call it what does that mean/i,
    /For my segment, "What Does That Mean\?", we're going to be ta/i,
    /What does that mean\?/i,
  ],
  'what-is-that': [
    /what is that\?/i,
    /welcome to.*what is that/i,
    /segment.*what is that/i,
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
  'artifacts-and-fiction': [
    /artifacts and fiction/i,
    /welcome to.*artifacts and fiction/i,
    /segment.*artifacts and fiction/i,
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
  'taking-issue': [
    /taking issue/i,
    /welcome to.*taking issue/i,
    /let'?s.*taking issue/i,
  ],
  'textual-healing': [
    /textual healing/i,
    /welcome to.*textual healing/i,
    /segment.*textual healing/i,
  ],
  'thats-history': [/that'?s history/i, /welcome to.*that'?s history/i],
  'know-your-bible': [
    /know your bible/i,
    /welcome to.*know your bible/i,
    /So on this edition of Know Your Bible, we're going to jump o/i,
  ],
  'left-behind': [
    /left behind/i,
    /welcome to.*left behind/i,
    /segment.*left behind/i,
  ],
  'magical-thinking': [
    /magical thinking/i,
    /welcome to.*magical thinking/i,
    /segment.*magical thinking/i,
  ],
  'could-it-be-satan': [
    /could it be satan\??/i,
    /welcome to.*could it be satan/i,
  ],
  'creation-stories': [
    /creation stories/i,
    /welcome to.*creation stories/i,
    /let'?s do.*creation stories/i,
  ],
  eschatological: [
    /eschatological/i,
    /welcome to.*eschatological/i,
    /segment.*eschatological/i,
  ],
  'by-the-numbers': [/by the numbers/i, /welcome to.*by the numbers/i],
  'getting-angelic': [/getting angelic/i, /welcome to.*getting angelic/i],
  'getting-demonic': [/getting demonic/i, /welcome to.*getting demonic/i],
  'historys-mysteries': [
    /history'?s mysteries/i,
    /welcome to.*history'?s mysteries/i,
    /let'?s.*history'?s mysteries/i,
  ],
  'nature-of-god': [
    /nature of god/i,
    /welcome to.*nature of god/i,
    /segment.*nature of god/i,
  ],
  'opportunities-for-growth': [
    /opportunities for growth/i,
    /welcome to.*opportunities for growth/i,
    /segment.*opportunities for growth/i,
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
  outro: [/we'?ll talk to you (again\s+)?next week/i,
    /thanks for listening.*next week/i,
    /see you next week/i,
    /have a good one/i,
    /Well, thank you so much for joining us\./i,
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

/**
 * Human-readable descriptions of each segment type.
 * Used by LLM to understand what each segment is about.
 */
export const SEGMENT_DESCRIPTIONS: Record<SegmentType, string> = {
  intro: 'Opening of the episode with theme music and brief introduction',
  'all-right-lets-see-it': 'Examining and discussing visual content like charts, maps, or images',
  'archaeology-of-israel': 'Archaeological findings and discoveries related to ancient Israel',
  'artifacts-and-fiction': 'Examining archaeological artifacts that appear in fictional or legendary narratives, distinguishing between historical evidence and storytelling',
  'bible-heroes': 'Examining biblical characters traditionally viewed as heroes, questioning their heroic status and exploring moral complexities',
  'bible-vs-bible': 'Comparing and contrasting different Bible passages, translations, or interpretations',
  'by-the-numbers': 'Statistical analysis and numerical data about biblical or religious topics',
  'chapter-and-verse': 'Reading and discussing specific Bible passages in depth',
  'conspiracy-watch': 'Examining and debunking conspiracy theories related to religion',
  'could-it-be-satan': 'Exploring Satan, demons, and evil in biblical and religious contexts',
  'creation-stories': 'Examining ancient creation narratives from the Bible and other cultures, comparing cosmologies and origin myths',
  eschatological: 'Discussing end times theology, apocalyptic literature, prophecy about the end of the world, and eschatological beliefs',
  'ex-eventu': 'Discussing prophecy written after the fact (prophecy after the event)',
  'getting-angelic': 'Exploring angels, heavenly beings, and divine messengers in scripture',
  'getting-demonic': 'Exploring demons, evil spirits, and malevolent beings in scripture',
  'historys-mysteries': 'Examining unsolved historical puzzles, enigmatic archaeological discoveries, and debated events from biblical and ancient history',
  'is-it-canon': 'Discussing what texts are included in biblical canons and why',
  'its-the-law': 'Examining biblical laws, commandments, and legal codes',
  'know-your-bible': 'Educational segment about biblical books, structure, and content',
  'left-behind': 'Discussing rapture theology, end times beliefs, and the Left Behind cultural phenomenon',
  'magical-thinking': 'Examining magical practices, supernatural beliefs, and ritualistic thinking in biblical and religious contexts',
  'main-content': 'Primary discussion topic of the episode',
  'mcclellan-911': 'Listener questions answered by Dan McClellan',
  'nature-of-god': 'Theological discussion about the nature and attributes of God',
  'opportunities-for-growth': 'Revisiting previous positions, acknowledging mistakes, and discussing personal or scholarly growth',
  segment: 'Unidentified segment type (placeholder)',
  'taking-issue': 'Critical analysis and debate of controversial biblical or theological topics',
  'textual-healing': 'Examining textual criticism, manuscript variants, and biblical text transmission',
  'thats-history': 'Historical context and background for biblical events',
  'urban-legends': 'Examining popular myths and misconceptions about the Bible',
  'what-does-that-mean': 'Explaining biblical/scholarly terminology and concepts',
  'what-is-that': 'Examining and explaining specific objects, artifacts, or physical items mentioned in biblical texts or discovered through archaeology',
  'whos-that': 'Profiles of biblical characters, historical figures, or scholars',
  'women-in-the-bible': 'Discussing women and their roles in biblical narratives',
  'your-patriarchy-and-you': 'Examining patriarchy and gender dynamics in biblical texts',
  advertisement: 'Sponsor messages or promotional content',
  outro: 'Closing remarks, credits, and sign-off',
};
