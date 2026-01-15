/**
 * UI component utilities for DoD Tools
 */

import type { BreadcrumbItem, AudioPlayerOptions, Episode } from './types.js';
import { escapeHtml, formatDate } from './formatting.js';
import { secondsToTimestamp, timestampToSeconds } from './timestamp.js';
import type { TagCategory } from '../../src/config/tag-vocabulary.js';

// Render breadcrumb navigation
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

// Show toast notification
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info',
): void {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.append(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Create audio player with event handlers
export function createAudioPlayer(
  containerId: string,
  videoId: string,
  options: AudioPlayerOptions = {},
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
export function seekToTimestamp(
  audio: HTMLAudioElement,
  timestamp: string,
): void {
  const seconds = timestampToSeconds(timestamp);
  audio.currentTime = seconds;
  audio.play().catch(() => {
    // Autoplay may be blocked - user needs to interact first
  });
}

// Render episode card
export function renderEpisodeCard(
  episode: Episode,
  options: { linkTo?: string; maxTags?: number; showTags?: boolean } = {},
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

// Get tag category CSS class
export function getTagCategoryClass(category: TagCategory): string {
  return category;
}
