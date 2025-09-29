import { devLocalIndexerRef } from '@genkit-ai/dev-local-vectorstore';
import { Document } from 'genkit';
import { chunk } from 'llm-chunk';
import { ai } from '../genkit/genkit.js';

type SplitOptions = {
  minLength?: number;
  maxLength?: number;
  overlap?: number;
  splitter?: 'sentence' | 'paragraph';
  delimiters?: string;
};

const chunkingConfig: SplitOptions = {
  minLength: 1000,
  maxLength: 2000,
  splitter: 'sentence',
  overlap: 100,
  delimiters: '',
};

export const transcriptIndexer = devLocalIndexerRef('transcriptQA');

export async function indexTranscript(transcript: string): Promise<void> {
  const chunks = chunk(transcript, chunkingConfig);
  console.log(`Created ${chunks.length} chunks`);

  const documents = chunks.map((chunk) => {
    return Document.fromText(chunk);
  });

  await ai.index({
    indexer: transcriptIndexer,
    documents,
  });
  console.log(`Indexed ${documents.length} documents`);
  return;
}
