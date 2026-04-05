import { z } from "zod";

export const PodcastRssItemSchema = z.object({
  title: z.string(),
  pubDate: z.string(),
  guid: z.string(),
  enclosureUrl: z.string().optional(),
  itunesEpisode: z.number().int().positive().optional(),
});

export type PodcastRssItem = z.infer<typeof PodcastRssItemSchema>;

export const PatreonRssItemSchema = PodcastRssItemSchema;
export type PatreonRssItem = PodcastRssItem;
