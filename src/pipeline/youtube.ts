/**
 * Shared types for YouTube video processing.
 */

export interface VideoChapter {
  title: string;
  startTime: number;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  channelTitle: string;
  chapters?: VideoChapter[];
}
