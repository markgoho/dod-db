import { devLocalRetrieverRef } from '@genkit-ai/dev-local-vectorstore';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'genkit';
import { retrieveFromFirestore } from './firestore-rag/retrieve-from-firestore.js';
import { ai } from './genkit.js';

export const transcriptRetriever = devLocalRetrieverRef('transcriptQA');

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
    const docs = await retrieveFromFirestore(query);

    if (docs.length === 0) {
      return {
        answer:
          'I could not find any relevant information in the transcript to answer your question.',
      };
    }

    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: `You are an AI assistant who answers questions based on the provided transcript context. Your answer should be based solely on the information in the context.

      Question: ${query}`,
      docs,
    });

    return { answer: text };
  },
);

const { answer } = await transcriptQA({
  query: `there are two segments in this episode: Chapter and Verse and Is It Canon? the first segment starts at the beginning of the episode, but what time does the second segment start (hint: it's in the middle of the episode)`,
});
console.log(answer);
