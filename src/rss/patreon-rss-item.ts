import { z } from "zod";

export const PatreonRssItemSchema = z.object({
  title: z.string(),
  pubDate: z.string(),
  guid: z.string(),
  enclosureUrl: z.string().optional(),
  itunesEpisode: z.number().int().positive().optional(),
});

export type PatreonRssItem = z.infer<typeof PatreonRssItemSchema>;
