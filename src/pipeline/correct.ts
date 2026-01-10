import { chunk } from 'llm-chunk';
import { correctionChunking } from '../config/chunking.js';
import { correctionModel } from '../config/models.js';
import { ai } from '../genkit.js';
import { correctionPrompt } from '../prompts/correction.js';

export async function correctTranscript(transcript: string): Promise<string> {
  const chunks = chunk(transcript, correctionChunking);
  let correctedTranscript = '';

  for (const textChunk of chunks) {
    console.log('Correcting chunk');
    const { text: correctedChunk } = await ai.generate({
      model: correctionModel,
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
