import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from 'langchain';
import { z } from 'zod';

// This tool uses its own LLM instance to perform the correction.
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash-lite',
  temperature: 0,
});

const correctionPrompt = `You are an expert in Bible scholarship. Please review the following podcast transcript and correct any domain-specific terms, names, places, or theological concepts that may have been transcribed incorrectly. When you make a correction, please wrap the corrected word or phrase in double asterisks (**). Only return the fully corrected transcript. Do not add any commentary or explanation before or after the transcript.

Transcript to correct:
---
{transcript}
---
`;

export const correctTranscript = tool(
  async (input) => {
    const { transcript } = input as { transcript: string };

    const fullPrompt = correctionPrompt.replace('{transcript}', transcript);
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
