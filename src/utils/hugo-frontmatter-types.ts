/**
 * Hugo episode frontmatter structure.
 * Matches the frontmatter in hugo/content/episodes/{number}/index.md
 * Note: date can be string or Date depending on Bun.YAML.parse() auto-conversion
 */
export interface HugoEpisodeFrontmatter {
  title: string;
  date: string | Date;
  episodeNumber: number;
  videoId: string;
  youtubeUrl: string;
  tags: string[];
  speakers: string[];
  draft?: boolean;
}
