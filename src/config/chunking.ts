export type ChunkingConfig = {
  minLength: number;
  maxLength: number;
  overlap: number;
  splitter: 'sentence' | 'paragraph';
  delimiters: string;
};

/**
 * Chunking config for LLM correction passes.
 * Larger chunks to maintain context during correction.
 */
export const correctionChunking: ChunkingConfig = {
  minLength: 5000,
  maxLength: 10_000,
  splitter: 'sentence',
  overlap: 200,
  delimiters: '',
};

/**
 * Chunking config for embedding/indexing.
 * Smaller chunks for more precise retrieval.
 */
export const embeddingChunking: ChunkingConfig = {
  minLength: 1000,
  maxLength: 2000,
  splitter: 'sentence',
  overlap: 100,
  delimiters: '',
};
