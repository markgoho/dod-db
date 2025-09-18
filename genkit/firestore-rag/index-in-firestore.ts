import { googleAI } from '@genkit-ai/google-genai';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { chunk } from 'llm-chunk';
import { ai } from '../genkit.js';

type SplitOptions = {
  minLength?: number;
  maxLength?: number;
  overlap?: number;
  splitter?: 'sentence' | 'paragraph';
  delimiters?: string;
};

const chunkingConfig: SplitOptions = {
  minLength: 1000,
  maxLength: 2000,
  splitter: 'sentence',
  overlap: 100,
  delimiters: '',
};

const app = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const firestore = getFirestore(app);

export async function indexTranscriptInFirestore(transcript: string) {
  const chunks = chunk(transcript, chunkingConfig);
  for (const chunk of chunks) {
    const embedding = (
      await ai.embed({
        embedder: googleAI.embedder('text-embedding-004'),
        content: chunk,
      })
    )[0]?.embedding;

    if (embedding !== undefined) {
      await firestore.collection('documents').add({
        embedding: FieldValue.vector(embedding),
        text: chunk,
      });
    }
  }
}
