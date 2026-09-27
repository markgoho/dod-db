/**
 * Model used for transcript correction.
 */
export const correctionModel = "gemini-3.8-flash";

/**
 * Model used for speaker identification and segment/topic extraction.
 */
export const speakerIdModel = "gemini-3.8-flash";

/**
 * Model used for LLM tag discovery (proposing new vocabulary terms).
 */
export const tagDiscoveryModel = "gemini-3.8-flash";

/**
 * Model used for Q&A over transcripts.
 */
export const qaModel = "gemini-3.8-flash";

/**
 * Embedder model for vector indexing.
 */
export const embedderModel = "gemini-embedding-001";

/**
 * Model used for Pass 2 review of marked corrections.
 */
export const reviewModel = "gemini-3.8-flash";
