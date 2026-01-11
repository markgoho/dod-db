import { chunk } from 'llm-chunk';
import { correctionChunking } from '../config/chunking.js';
import { reviewModel } from '../config/models.js';
import { globalCorrections } from '../config/corrections.js';
import { ai } from '../ai.js';
import { correctionPrompt } from '../prompts/correction.js';
import {
  applyDeterministicCorrections,
  deduplicateChunks,
} from './correct-utils.js';

/**
 * Single-pass transcript correction with deterministic preprocessing.
 *
 * Steps:
 * 1. Apply deterministic find/replace corrections (instant, free)
 * 2. Send to Gemini 3.0 Flash for remaining corrections (one LLM call)
 *
 * @param transcript - Raw or speaker-labeled transcript
 * @returns Corrected transcript
 */
export async function correctTranscript(transcript: string): Promise<string> {
  // 1. Apply deterministic corrections first
  console.log('  Applying deterministic corrections...');
  const { correctedText: afterDeterministic, count: deterministicCount } =
    applyDeterministicCorrections(transcript, globalCorrections);
  console.log(`  ✓ Applied ${deterministicCount} deterministic corrections`);

  // 2. Chunk the transcript
  const chunks = chunk(afterDeterministic, correctionChunking);
  console.log(`  Processing ${chunks.length} chunks with LLM...`);

  // 3. Apply LLM correction to each chunk
  const correctedChunks: string[] = [];
  for (const [index, textChunk] of chunks.entries()) {
    console.log(`  Correcting chunk ${index + 1}/${chunks.length}`);
    const response = await ai.models.generateContent({
      model: reviewModel, // gemini-3-flash-preview
      contents: correctionPrompt(textChunk),
    });

    const correctedChunk = response.text;
    if (correctedChunk) {
      correctedChunks.push(correctedChunk);
    }
  }

  // 4. Deduplicate overlaps
  console.log('  Deduplicating overlaps...');
  const correctedText = deduplicateChunks(
    correctedChunks,
    correctionChunking.overlap,
  );

  console.log('✓ Correction complete');

  return correctedText;
}
