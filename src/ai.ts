import { GoogleGenAI } from "@google/genai";

/**
 * Google AI client instance.
 * Uses GEMINI_API_KEY or GOOGLE_API_KEY from environment.
 */
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
});
