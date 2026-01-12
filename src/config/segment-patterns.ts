/**
 * Segment types for Data Over Dogma podcast episodes.
 */
export type SegmentType =
  | 'intro'
  | 'chapter-and-verse'
  | 'what-does-that-mean'
  | 'all-right-lets-see-it'
  | 'urban-legends'
  | 'mcclellan-911'
  | 'is-it-canon'
  | 'advertisement'
  | 'main-content'
  | 'outro';

/**
 * Human-readable labels for segment types.
 */
export const SEGMENT_LABELS: Record<SegmentType, string> = {
  intro: 'Intro',
  'chapter-and-verse': 'Chapter and Verse',
  'what-does-that-mean': 'What Does That Mean?',
  'all-right-lets-see-it': "All Right, Let's See It",
  'urban-legends': 'Urban Legends',
  'mcclellan-911': 'McClellan 911',
  'is-it-canon': 'Is it Canon?',
  advertisement: 'Advertisement',
  'main-content': 'Main Content',
  outro: 'Outro',
};

/**
 * Colors for segment visualization in UI.
 */
export const SEGMENT_COLORS: Record<SegmentType, string> = {
  intro: '#6366f1', // indigo
  'chapter-and-verse': '#22c55e', // green
  'what-does-that-mean': '#f59e0b', // amber
  'all-right-lets-see-it': '#ef4444', // red
  'urban-legends': '#8b5cf6', // violet
  'mcclellan-911': '#ec4899', // pink
  'is-it-canon': '#14b8a6', // teal
  advertisement: '#f97316', // orange
  'main-content': '#64748b', // slate
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
  ],
  'what-does-that-mean': [
    /welcome to.*what does that mean/i,
    /segment.*what does that mean/i,
    /call it what does that mean/i,
  ],
  'all-right-lets-see-it': [
    /all right,?\s+let'?s see it/i,
  ],
  'urban-legends': [
    /welcome to.*urban legends/i,
    /segment.*urban legends/i,
    /urban legends.*spread.*far and wide/i,
  ],
  'mcclellan-911': [
    /mcclellan 911/i,
    /what is your emergency/i,
  ],
  'is-it-canon': [
    /is it canon\?/i,
    /welcome to.*is it canon/i,
  ],
  advertisement: [
    /support the (data over dogma )?podcast/i,
    /become a patron/i,
    /how you can support/i,
    /patreon\.com/i,
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
