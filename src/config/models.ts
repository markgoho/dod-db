/**
 * Model used for transcript correction.
 * Using 2.5 Flash for better accuracy on domain-specific content.
 */
export const correctionModel = 'gemini-2.5-flash';

/**
 * Model used for speaker identification.
 * 2.0 Flash is sufficient for this structured extraction task.
 */
export const speakerIdModel = 'gemini-2.0-flash';

/**
 * Model used for Q&A over transcripts.
 */
export const qaModel = 'gemini-2.5-flash';

/**
 * Embedder model for vector indexing.
 */
export const embedderModel = 'gemini-embedding-001';
