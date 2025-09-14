import {
  devLocalIndexerRef,
  devLocalRetrieverRef,
} from '@genkit-ai/dev-local-vectorstore';
import { readFile } from 'fs/promises';
import { Document } from 'genkit';
import { chunk } from 'llm-chunk';
import * as path from 'path';
import * as z from 'zod';
import { ai } from './genkit.js';

export const transcriptIndexer = devLocalIndexerRef('transcriptQA');
export const transcriptRetriever = devLocalRetrieverRef('transcriptQA');

const chunkingConfig = {
  minLength: 1000,
  maxLength: 2000,
  splitter: 'sentence',
  overlap: 100,
  delimiters: '',
} as any;

export const indexTranscript = ai.defineFlow(
  {
    name: 'indexTranscript',
    inputSchema: z.object({
      filePath: z.string().describe('Path to the transcript file'),
    }),
    outputSchema: z.object({ indexedDocuments: z.number() }),
  },
  async ({ filePath }) => {
    console.log(`Indexing file: ${filePath}`);
    const resolvedPath = path.resolve(filePath);
    const transcriptText = await readFile(resolvedPath, 'utf-8');

    const chunks = chunk(transcriptText, chunkingConfig);
    console.log(`Created ${chunks.length} chunks`);

    const documents = chunks.map((chunk) => {
      return Document.fromText(chunk, {
        filePath: resolvedPath,
      });
    });

    await ai.index({
      indexer: transcriptIndexer,
      documents,
    });
    console.log(`Indexed ${documents.length} documents`);
    return { indexedDocuments: documents.length };
  },
);

export const transcriptQA = ai.defineFlow(
  {
    name: 'transcriptQA',
    inputSchema: z.object({
      query: z.string().describe('Question about the transcript'),
    }),
    outputSchema: z.object({
      answer: z.string().describe('Answer to the question'),
    }),
  },
  async ({ query }) => {
    const docs = await ai.retrieve({
      retriever: transcriptRetriever,
      query,
      options: { k: 3 },
    });

    if (docs.length === 0) {
      return {
        answer:
          'I could not find any relevant information in the transcript to answer your question.',
      };
    }

    const { text } = await ai.generate({
      prompt: `You are an AI assistant who answers questions based on the provided transcript context. Your answer should be based solely on the information in the context.

Context from the transcript:
---
${docs.map((d) => d.text).join('\n---\n')}
---

Question: ${query}

Answer:`,
      docs,
    });

    return { answer: text };
  },
);
