import { googleAI } from '@genkit-ai/google-genai';

/**
 * Model used for transcript correction.
 * Using 2.5 Flash for better accuracy on domain-specific content.
 */
export const correctionModel = googleAI.model('gemini-2.5-flash');

/**
 * Model used for speaker identification.
 * 1.5 Flash is sufficient for this structured extraction task.
 */
export const speakerIdModel = googleAI.model('gemini-1.5-flash');

/**
 * Model used for Q&A over transcripts.
 */
export const qaModel = googleAI.model('gemini-2.5-flash');

/**
 * Embedder for vector indexing.
 */
export const embedder = googleAI.embedder('text-embedding-004');
