/**
 * CLI script to ask questions about transcripts.
 *
 * Usage:
 *   genkit start -- bun run src/scripts/transcript-qa.ts
 */

import { transcriptQA } from '../flows/transcript-qa.js';

const { answer } = await transcriptQA({
  query: `there are two segments in this episode: Chapter and Verse and Is It Canon? the first segment starts at the beginning of the episode, but what time does the second segment start (hint: it's in the middle of the episode)`,
});
console.log(answer);
