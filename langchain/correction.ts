import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from 'langchain';
import { z } from 'zod';
import { correctionPrompt } from '../prompts/correction-prompt';

// This tool uses its own LLM instance to perform the correction.
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash-lite',
  temperature: 0,
});

export const correctTranscript = tool(
  async (input) => {
    const { transcript } = input as { transcript: string };

    const fullPrompt = correctionPrompt(transcript);
    const response = await model.invoke(fullPrompt);

    return response.content as string;
  },
  {
    name: 'correctTranscript',
    description:
      'Reviews a transcript and corrects it for domain-specific Bible scholarship terms.',
    schema: z.object({
      transcript: z.string().describe('The transcript text to be corrected.'),
    }),
  },
);
