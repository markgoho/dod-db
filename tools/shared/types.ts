/**
 * Shared types for DoD Tools
 */

// Episode types
export interface Episode {
  videoId: string;
  title: string;
  publishedAt: string;
  processedAt: string;
  transcriptPath: string;
  episodeNumber?: number;
  tags?: EpisodeTag[];
  segments?: EpisodeSegment[];
}

export interface EpisodeTag {
  tag: string;
  mentions: number;
}

export interface EpisodeSegment {
  type: string;
  startTimestamp: string;
  endTimestamp: string | null;
  confidence: 'auto' | 'verified';
  detectionMethod?: 'pattern' | 'llm' | 'manual';
}

// Segment metadata (types, colors, labels)
export interface SegmentMetadata {
  types: string[];
  colors: Record<string, string>;
  labels: Record<string, string>;
}

// Transcript line with parsed timestamp
export interface TranscriptLine {
  index: number;
  timestamp: string;
  seconds: number;
  speaker: string;
  text: string;
}

export interface EpisodeWithAudio extends Episode {
  hasAudio: boolean;
}

// Tag category type
export type TagCategory =
  | 'character'
  | 'person'
  | 'place'
  | 'people'
  | 'literature'
  | 'theology'
  | 'scholarship';

// Backward compatibility alias
export type ParsedLine = TranscriptLine;

// Breadcrumb types
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Audio player options
export interface AudioPlayerOptions {
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

// Job status types
export interface JobStatus {
  jobId: string;
  status: 'running' | 'completed' | 'failed';
  logs?: string;
}

export interface PollJobOptions {
  statusBadge: HTMLElement;
  logsContainer: HTMLElement;
  completedMessage: string;
  failedMessage?: string;
  onComplete?: () => void;
  onFailed?: () => void;
}

// Tag vocabulary types
export interface TagVocabularyEntry {
  canonical: string;
  variations: string[];
  category: string;
  llmVerify?: boolean;
  caseSensitive?: boolean;
  description?: string;
  status?: string;
}
