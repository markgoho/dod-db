import { z } from 'genkit';
import { qaModel } from '../config/models.js';
import { ai } from '../genkit.js';
import { retrieveFromFirestore } from '../storage/firestore.js';

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
      model: qaModel,
      prompt: `You are an AI assistant who answers questions based on the provided transcript context. Your answer should be based solely on the information in the context.

      Question: ${query}`,
      docs,
    });

    return { answer: text };
  },
);
