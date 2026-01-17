import { z } from "zod";

export const SpeakerLabelsSchema = z.object({
  "Speaker A": z.string(),
  "Speaker B": z.string(),
  "Speaker C": z.string().optional(),
});

export type SpeakerLabels = z.infer<typeof SpeakerLabelsSchema>;
