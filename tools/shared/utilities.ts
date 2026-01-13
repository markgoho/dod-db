/**
 * Shared utilities for DoD Tools
 * Common TypeScript utilities used across all tool pages
 */

// Types
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
  detectionMethod: 'pattern' | 'llm' | 'manual';
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

// Formatting utilities
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function escapeHtml(string_: string): string {
  const div = document.createElement('div');
  div.textContent = string_;
  return div.innerHTML;
}

// Timestamp utilities
export function timestampToSeconds(timestamp: string): number {
  const clean = timestamp.replaceAll(/[[\]]/g, '');
  const parts = clean.split(':');
  const hours = Number.parseInt(parts[0] ?? '0', 10);
  const minutes = Number.parseInt(parts[1] ?? '0', 10);
  const seconds = Number.parseFloat(parts[2] ?? '0');
  return hours * 3600 + minutes * 60 + seconds;
}

export function secondsToTimestamp(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatTimestamp(timestamp: string): string {
  return timestamp.replaceAll(/[[\]]/g, '').replace(/\.\d{3}$/, '');
}

export function parseTimestamp(string_: string): string | undefined {
  const match = /^(\d{1,2}):(\d{2}):(\d{2})$/.exec(string_.trim());
  if (!match || !match[1] || !match[2] || !match[3]) return undefined;
  return `[${match[1].padStart(2, '0')}:${match[2]}:${match[3]}.000]`;
}

export function formatSecondsToTimestamp(sec: number): string {
  return `[${secondsToTimestamp(sec)}.000]`;
}

// Episode data fetching
export async function getEpisode(videoId: string): Promise<EpisodeWithAudio | undefined> {
  try {
    const response = await fetch(`/api/episode/${videoId}`);
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function getAllEpisodes(): Promise<Episode[]> {
  try {
    const response = await fetch('/api/tag-vocabulary/episodes');
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function getTranscript(videoId: string): Promise<string | undefined> {
  try {
    const response = await fetch(`/api/segment-verification/transcript/${videoId}`);
    if (!response.ok) return undefined;
    const data = await response.json();
    return data.transcript || undefined;
  } catch {
    return undefined;
  }
}

// Transcript parsing
export interface ParsedLine {
  timestamp: string;
  speaker: string;
  text: string;
  seconds: number;
}

export function parseTranscript(content: string): ParsedLine[] {
  const lines: ParsedLine[] = [];
  const regex = /^\[(\d{2}:\d{2}:\d{2}\.\d{3})\]\s+([^:]+):\s*(.*)$/;

  for (const line of content.split('\n')) {
    const match = regex.exec(line.trim());
    if (match && match[1] && match[2] && match[3]) {
      lines.push({
        timestamp: `[${match[1]}]`,
        speaker: match[2].trim(),
        text: match[3].trim(),
        seconds: timestampToSeconds(`[${match[1]}]`),
      });
    }
  }

  return lines;
}

// Breadcrumb rendering
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function renderBreadcrumbs(items: BreadcrumbItem[]): string {
  return items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      if (isLast) {
        return `<span class="current">${escapeHtml(item.label)}</span>`;
      }
      return `<a href="${item.href || '#'}">${escapeHtml(item.label)}</a><span class="separator">&gt;</span>`;
    })
    .join('');
}

// Toast notifications
export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Audio player creation
export interface AudioPlayerOptions {
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export function createAudioPlayer(
  containerId: string,
  videoId: string,
  options: AudioPlayerOptions = {}
): HTMLAudioElement | undefined {
  const container = document.querySelector(`#${containerId}`);
  if (!container) return undefined;

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.src = `/api/audio/${videoId}`;
  audio.style.width = '100%';

  const timeDisplay = document.createElement('span');
  timeDisplay.className = 'audio-time';
  timeDisplay.textContent = '00:00:00';

  audio.addEventListener('timeupdate', () => {
    timeDisplay.textContent = secondsToTimestamp(audio.currentTime);
    options.onTimeUpdate?.(audio.currentTime);
  });

  audio.addEventListener('play', () => options.onPlay?.());
  audio.addEventListener('pause', () => options.onPause?.());

  container.innerHTML = '';
  container.append(audio);
  container.append(timeDisplay);

  return audio;
}

// Seek audio to timestamp
export function seekToTimestamp(audio: HTMLAudioElement, timestamp: string): void {
  const seconds = timestampToSeconds(timestamp);
  audio.currentTime = seconds;
  audio.play().catch(() => {
    // Autoplay may be blocked - user needs to interact first
  });
}

// Episode card rendering
export function renderEpisodeCard(
  episode: Episode,
  options: { linkTo?: string; maxTags?: number; showTags?: boolean } = {}
): string {
  const { linkTo, maxTags = 5, showTags = true } = options;
  const tagCount = episode.tags?.length || 0;
  const tagsPreview = episode.tags?.slice(0, maxTags) || [];
  const moreCount = tagCount > maxTags ? tagCount - maxTags : 0;

  const href = linkTo || `/episode/${episode.videoId}`;

  let tagsHtml = '';
  if (showTags && tagsPreview.length > 0) {
    tagsHtml = `
      <div class="episode-tags">
        ${tagsPreview.map((tag) => `<span class="tag-badge">${escapeHtml(tag.tag)} (${tag.mentions})</span>`).join('')}
        ${moreCount > 0 ? `<span class="tag-badge">+${moreCount} more</span>` : ''}
      </div>
    `;
  }

  return `
    <a href="${href}" class="episode-card">
      <div class="episode-header">
        <div class="episode-number">Episode ${episode.episodeNumber || '?'}</div>
        <div class="episode-title">${escapeHtml(episode.title)}</div>
      </div>
      <div class="episode-meta">
        <span>${formatDate(episode.publishedAt)}</span>
        <span>${tagCount} tags</span>
        <span>${episode.segments?.length || 0} segments</span>
      </div>
      ${tagsHtml}
    </a>
  `;
}

// Tag category class
export function getTagCategoryClass(category: TagCategory): string {
  return category;
}

// URL utilities
export function getVideoIdFromUrl(): string | undefined {
  const path = globalThis.location.pathname;
  const match = /\/episode\/([^/]+)/.exec(path);
  return match?.[1];
}

export function getSubpageFromUrl(): string | undefined {
  const path = globalThis.location.pathname;
  const match = /\/episode\/[^/]+\/([^/]+)/.exec(path);
  return match?.[1];
}

// Segment utilities
export function getSegmentDuration(segment: EpisodeSegment, totalDuration?: number): number {
  const start = timestampToSeconds(segment.startTimestamp);
  const end = segment.endTimestamp
    ? timestampToSeconds(segment.endTimestamp)
    : totalDuration || start + 300; // Default 5 minutes if no end
  return end - start;
}

export function getTotalDuration(segments: EpisodeSegment[]): number {
  if (segments.length === 0) return 3600; // Default 1 hour
  let max = 0;
  for (const seg of segments) {
    const end = seg.endTimestamp
      ? timestampToSeconds(seg.endTimestamp)
      : timestampToSeconds(seg.startTimestamp) + 300;
    if (end > max) max = end;
  }
  return max;
}

// Debounce utility
export function debounce<T extends (...arguments_: unknown[]) => void>(
  function_: T,
  delay: number
): (...arguments_: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...arguments_: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => function_(...arguments_), delay);
  };
}

// Local storage utilities
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled
  }
}

export function loadFromStorage<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  } catch {
    return undefined;
  }
}

// Export as namespace for global access in HTML
declare global {
  interface Window {
    DoDTools: typeof DoDTools;
  }
}

export const DoDTools = {
  // Formatting
  formatDate,
  escapeHtml,
  timestampToSeconds,
  secondsToTimestamp,
  formatTimestamp,
  parseTimestamp,
  formatSecondsToTimestamp,

  // Data fetching
  getEpisode,
  getAllEpisodes,
  getTranscript,
  parseTranscript,

  // UI components
  renderBreadcrumbs,
  showToast,
  createAudioPlayer,
  seekToTimestamp,
  renderEpisodeCard,
  getTagCategoryClass,

  // URL utilities
  getVideoIdFromUrl,
  getSubpageFromUrl,

  // Segment utilities
  getSegmentDuration,
  getTotalDuration,

  // General utilities
  debounce,
  saveToStorage,
  loadFromStorage,
};

// Make available globally
if (globalThis.window !== undefined) {
  (globalThis as unknown as Window).DoDTools = DoDTools;
}
