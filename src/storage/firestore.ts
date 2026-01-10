import { defineFirestoreRetriever } from '@genkit-ai/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { chunk } from 'llm-chunk';
import { Document } from 'genkit';
import { embeddingChunking } from '../config/chunking.js';
import { getFirestoreDb } from '../config/firebase.js';
import { embedder } from '../config/models.js';
import { ai } from '../genkit.js';

const firestore = getFirestoreDb();

/**
 * Index a transcript in Firestore with vector embeddings.
 */
export async function indexTranscript(transcript: string): Promise<void> {
  const chunks = chunk(transcript, embeddingChunking);

  for (const textChunk of chunks) {
    const embedding = (
      await ai.embed({
        embedder,
        content: textChunk,
      })
    )[0]?.embedding;

    if (embedding !== undefined) {
      await firestore.collection('documents').add({
        embedding: FieldValue.vector(embedding),
        text: textChunk,
      });
    }
  }
}

/**
 * Firestore retriever for semantic search over transcripts.
 */
export const transcriptRetriever = defineFirestoreRetriever(ai, {
  name: 'transcriptRetriever',
  firestore,
  collection: 'documents',
  contentField: 'text',
  vectorField: 'embedding',
  embedder,
  distanceMeasure: 'COSINE',
});

/**
 * Retrieve relevant transcript chunks for a query.
 */
export async function retrieveFromFirestore(
  query: string,
): Promise<Document[]> {
  const docs = await ai.retrieve({
    retriever: transcriptRetriever,
    query,
    options: { limit: 3 },
  });

  return docs;
}
