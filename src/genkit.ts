import { devLocalVectorstore } from '@genkit-ai/dev-local-vectorstore';
import { googleAI } from '@genkit-ai/google-genai';
import { genkit } from 'genkit';
import { embedder } from './config/models.js';

export const ai = genkit({
  plugins: [
    googleAI(),
    devLocalVectorstore([
      {
        indexName: 'transcriptQA',
        embedder,
      },
    ]),
  ],
  model: googleAI.model('gemini-1.5-flash-latest'),
});
