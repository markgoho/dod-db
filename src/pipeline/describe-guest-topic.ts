import { z } from "zod";
import { ai } from "../ai.js";
import { speakerIdModel } from "../config/models.js";

const GuestTopicSchema = z.object({
  guestTopic: z.string().min(1).max(60),
  confidence: z.number().min(0).max(1),
});

interface DescribeGuestTopicInput {
  episodeTitle: string;
  guestNames: string[];
  transcript: string;
}

export async function describeGuestTopic(
  input: DescribeGuestTopicInput,
): Promise<z.infer<typeof GuestTopicSchema>> {
  const prompt = `You are labeling the main guest-discussion topic for a podcast episode.

Episode title: ${input.episodeTitle}
Guests: ${input.guestNames.join(", ")}

Return one short topic label for the central subject of the guest interview.

Rules:
- Return a concise human-friendly label, usually 1-3 words
- Prefer the full named concept when the transcript makes it clear
- Prefer "Star of Bethlehem" over "Star"
- Prefer "Divine Council" over "Council"
- Prefer "Ancient Astronomy" over "Astronomy" when the fuller phrase is the real topic
- Prefer a broad topic area or named concept, not a sentence
- Do not return the guest's name
- Do not return a segment title like "Guest Topic"
- Match the style of site topic cards such as "Monotheism", "Paul", "Divine Council", "Star of Bethlehem"
- Pick the dominant topic of the episode, not a minor tangent
- Avoid vague single-word labels when a clearer multi-word concept is evident

Transcript:
${input.transcript}`;

  const response = await ai.models.generateContent({
    model: speakerIdModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(GuestTopicSchema),
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("LLM returned empty response for guest topic");
  }

  return GuestTopicSchema.parse(JSON.parse(responseText));
}
