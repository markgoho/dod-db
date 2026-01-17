import { FieldValue } from "firebase-admin/firestore";
import { chunk } from "llm-chunk";
import { ai } from "../../src/ai.js";
import { embeddingChunking } from "../../src/config/chunking.js";
import { embedderModel } from "../../src/config/models.js";
import { getFirestoreDb as getFirestoreDatabase } from "../config/get-firestore-db.js";

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
      await firestore.collection("documents").add({
        embedding: FieldValue.vector(embedding),
        text: textChunk,
      });
    }
  }
}
