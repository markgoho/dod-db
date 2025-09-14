import { devLocalVectorstore } from '@genkit-ai/dev-local-vectorstore';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';

export const ai = genkit({
  plugins: [
    googleAI(),
    devLocalVectorstore([
      {
        indexName: 'transcriptQA',
        embedder: googleAI.embedder('text-embedding-004'),
      },
    ]),
  ],
  model: googleAI.model('gemini-1.5-flash-latest'),
});
