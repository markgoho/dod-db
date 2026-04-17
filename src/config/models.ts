/**
 * Model used for transcript correction.
 * Using 2.5 Flash for better accuracy on domain-specific content.
 */
export const correctionModel = "gemini-2.5-flash";

/**
 * Model used for speaker identification and segment/topic extraction.
 * 2.5 Flash is the current broadly available fast structured-output model.
 */
export const speakerIdModel = "gemini-2.5-flash";

/**
 * Model used for Q&A over transcripts.
 */
export const qaModel = "gemini-2.5-flash";

/**
 * Embedder model for vector indexing.
 */
export const embedderModel = "gemini-embedding-001";

/**
 * Model used for Pass 2 review of marked corrections.
 * Using 3.0 Flash for enhanced validation capabilities.
 */
export const reviewModel = "gemini-3-flash-preview";
