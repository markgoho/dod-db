import { ai } from "../ai.js";
import { qaModel } from "../config/models.js";
import { retrieveFromFirestore } from "../storage/retrieve-from-firestore.js";

/**
 * Ask a question about transcripts and get an answer.
 */
export async function transcriptQA({
  query,
}: {
  query: string;
}): Promise<{ answer: string }> {
  const docs = await retrieveFromFirestore(query);

  if (docs.length === 0) {
    return {
      answer:
        "I could not find any relevant information in the transcript to answer your question.",
    };
  }

  const context = docs.map(document_ => document_.text).join("\n\n");

  const response = await ai.models.generateContent({
    model: qaModel,
    contents: `You are an AI assistant who answers questions based on the provided transcript context. Your answer should be based solely on the information in the context.

Context:
${context}

Question: ${query}`,
  });

  return { answer: response.text ?? "" };
}
