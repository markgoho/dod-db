/**
 * YouTube video processing configuration for Data over Dogma podcast.
 */
export const youtubeConfig = {
  dataDirectory: "data",
  audioDirectory: "data/audio",
  transcriptDirectory: "data/transcripts",
  processedVideosFile: "data/processed-videos.json",
  canonicalRssUrl:
    process.env.CANONICAL_RSS_URL ??
    process.env.PUBLIC_RSS_URL ??
    process.env.PATREON_RSS_URL,
} as const;

/**
 * Podcast-specific information for Data over Dogma.
 * Used to provide context for speaker identification.
 */
export const podcastInfo = {
  name: "Data Over Dogma",
  hosts: ["Dan McClellan", "Dan Beecher"],
  description:
    "A podcast about biblical scholarship hosted by Dr. Dan McClellan and Dan Beecher",
} as const;
