import { FieldValue } from 'firebase-admin/firestore';
import { chunk } from 'llm-chunk';
import { embeddingChunking } from '../config/chunking.js';
import { getFirestoreDb as getFirestoreDatabase } from '../config/firebase.js';
import { embedderModel } from '../config/models.js';
import { ai } from '../ai.js';

const firestore = getFirestoreDatabase();

/**
 * Index a transcript in Firestore with vector embeddings.
 */
export async function indexTranscript(transcript: string): Promise<void> {
  const chunks = chunk(transcript, embeddingChunking);

  for (const textChunk of chunks) {
    const response = await ai.models.embedContent({
      model: embedderModel,
      contents: textChunk,
    });

    const embedding = response.embeddings?.[0]?.values;

    if (embedding !== undefined) {
      await firestore.collection('documents').add({
        embedding: FieldValue.vector(embedding),
        text: textChunk,
      });
    }
  }
}

/**
 * Document type for retrieved transcript chunks.
 */
export interface Document {
  text: string;
  metadata?: Record<string, unknown>;
}

/**
 * Retrieve relevant transcript chunks for a query.
 * TODO: Implement vector search when vector DB solution is finalized.
 */
export async function retrieveFromFirestore(
  _query: string,
): Promise<Document[]> {
  // Vector DB solution is TBD - returning empty array for now
  console.warn(
    'retrieveFromFirestore: Vector search not yet implemented. Returning empty results.',
  );
  return [];
}
