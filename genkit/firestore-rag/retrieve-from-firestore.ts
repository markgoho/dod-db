import { defineFirestoreRetriever } from '@genkit-ai/firebase';
import { googleAI } from '@genkit-ai/google-genai';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Document } from 'genkit';
import { ai } from '../genkit';

const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const firestore = getFirestore(app);

const firestoreRetriever = defineFirestoreRetriever(ai, {
  name: 'exampleRetriever',
  firestore,
  collection: 'documents',
  contentField: 'text',
  vectorField: 'embedding',
  embedder: googleAI.embedder('text-embedding-004'),
  distanceMeasure: 'COSINE',
});

export async function retrieveFromFirestore(
  query: string,
): Promise<Document[]> {
  const docs = await ai.retrieve({
    retriever: firestoreRetriever,
    query,
    options: { limit: 3 },
  });

  return docs;
}
