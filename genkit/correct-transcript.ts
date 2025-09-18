import { googleAI } from '@genkit-ai/google-genai';
import { chunk } from 'llm-chunk';
import { correctionPrompt } from '../prompts/correction-prompt';
import { ai } from './genkit';

const chunkingConfig = {
  minLength: 5000,
  maxLength: 10000,
  splitter: 'sentence' as const,
  overlap: 200,
  delimiters: '',
};

export async function correctTranscript(transcript: string) {
  const chunks = chunk(transcript, chunkingConfig);
  let correctedTranscript = '';
  for (const textChunk of chunks) {
    console.log('Correcting chunk');
    const { text: correctedChunk } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash'),
      prompt: correctionPrompt(textChunk),
    });
    if (correctedChunk) {
      correctedTranscript += correctedChunk;
    }
  }

  if (correctedTranscript === null || correctedTranscript === '') {
    throw new Error('Response was null or empty');
  }

  return correctedTranscript;
}
