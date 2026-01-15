/**
 * Shared utilities for DoD Tools
 * Barrel export - re-exports all utilities from their respective files
 */

// Re-export constants
export { API_BASE_URL, CATEGORY_LABELS } from './constants.js';

// Re-export types
export type {
  Episode,
  EpisodeTag,
  EpisodeSegment,
  EpisodeWithAudio,
  ParsedLine,
  TranscriptLine,
  BreadcrumbItem,
  AudioPlayerOptions,
  JobStatus,
  PollJobOptions,
  TagVocabularyEntry,
  SegmentMetadata,
} from './types.js';

// Re-export formatting utilities
export { formatDate, escapeHtml } from './formatting.js';

// Re-export timestamp utilities
export {
  timestampToSeconds,
  secondsToTimestamp,
  formatTimestamp,
  parseTimestamp,
  formatSecondsToTimestamp,
} from './timestamp.js';

// Re-export API utilities
export {
  getEpisode,
  getAllEpisodes,
  getTranscript,
  parseTranscript,
  fetchSegmentMetadata,
  saveSegments,
} from './api.js';

// Re-export UI utilities
export {
  renderBreadcrumbs,
  showToast,
  createAudioPlayer,
  seekToTimestamp,
  renderEpisodeCard,
  getTagCategoryClass,
} from './ui.js';

// Re-export URL utilities
export { getVideoIdFromUrl, getSubpageFromUrl } from './url.js';

// Re-export segment utilities
export { getSegmentDuration, getTotalDuration } from './segment.js';

// Re-export segment operations
export {
  addSegmentAtTime,
  deleteSegmentAtIndex,
  updateSegmentType,
  updateSegmentStart,
  updateSegmentEnd,
  markAllSegmentsVerified,
  sortSegmentsByTime,
} from './segment-operations.js';

// Re-export timeline utilities
export { renderTimeline, renderSegmentLegend } from './timeline.js';

// Re-export job polling utilities
export { pollJobStatus, startJobPolling } from './job-polling.js';

// Re-export storage utilities
export { saveToStorage, loadFromStorage } from './storage.js';

// Re-export debounce utility
export { debounce } from './debounce.js';

// Re-export vocabulary utilities
export {
  getTagVocabEntry,
  getTagCategory,
  fetchVocabulary,
} from './vocabulary.js';

// Re-export form utilities
export {
  getTagFormData,
  clearTagForm,
  parseVariations,
  validateTagForm,
  toggleDescriptionField,
  updateFormButtonState,
  type TagFormData,
} from './form-utils.js';

// Re-export tag management utilities
export {
  addTagWithPolling,
  reprocessTag,
  reprocessAllEpisodes,
  startJobPollingWithUI,
  type JobPollingUIConfig,
} from './tag-management.js';

// Import for namespace object
import { API_BASE_URL, CATEGORY_LABELS } from './constants.js';
import { formatDate, escapeHtml } from './formatting.js';
import {
  timestampToSeconds,
  secondsToTimestamp,
  formatTimestamp,
  parseTimestamp,
  formatSecondsToTimestamp,
} from './timestamp.js';
import {
  getEpisode,
  getAllEpisodes,
  getTranscript,
  parseTranscript,
  fetchSegmentMetadata,
  saveSegments,
} from './api.js';
import {
  renderBreadcrumbs,
  showToast,
  createAudioPlayer,
  seekToTimestamp,
  renderEpisodeCard,
  getTagCategoryClass,
} from './ui.js';
import { getVideoIdFromUrl, getSubpageFromUrl } from './url.js';
import { getSegmentDuration, getTotalDuration } from './segment.js';
import {
  addSegmentAtTime,
  deleteSegmentAtIndex,
  updateSegmentType,
  updateSegmentStart,
  updateSegmentEnd,
  markAllSegmentsVerified,
  sortSegmentsByTime,
} from './segment-operations.js';
import { renderTimeline, renderSegmentLegend } from './timeline.js';
import { pollJobStatus, startJobPolling } from './job-polling.js';
import { saveToStorage, loadFromStorage } from './storage.js';
import { debounce } from './debounce.js';
import {
  getTagVocabEntry,
  getTagCategory,
  fetchVocabulary,
} from './vocabulary.js';
import {
  getTagFormData,
  clearTagForm,
  parseVariations,
  validateTagForm,
  toggleDescriptionField,
  updateFormButtonState,
} from './form-utils.js';
import {
  addTagWithPolling,
  reprocessTag,
  reprocessAllEpisodes,
  startJobPollingWithUI,
} from './tag-management.js';

// Export namespace for global access in HTML
export const DoDTools = {
  // Constants
  API_BASE_URL,
  CATEGORY_LABELS,

  // Formatting
  formatDate,
  escapeHtml,

  // Timestamp
  timestampToSeconds,
  secondsToTimestamp,
  formatTimestamp,
  parseTimestamp,
  formatSecondsToTimestamp,

  // API
  getEpisode,
  getAllEpisodes,
  getTranscript,
  parseTranscript,
  fetchSegmentMetadata,
  saveSegments,

  // UI
  renderBreadcrumbs,
  showToast,
  createAudioPlayer,
  seekToTimestamp,
  renderEpisodeCard,
  getTagCategoryClass,

  // URL
  getVideoIdFromUrl,
  getSubpageFromUrl,

  // Segment
  getSegmentDuration,
  getTotalDuration,

  // Segment operations
  addSegmentAtTime,
  deleteSegmentAtIndex,
  updateSegmentType,
  updateSegmentStart,
  updateSegmentEnd,
  markAllSegmentsVerified,
  sortSegmentsByTime,

  // Timeline
  renderTimeline,
  renderSegmentLegend,

  // Job polling
  pollJobStatus,
  startJobPolling,

  // Storage
  saveToStorage,
  loadFromStorage,

  // Vocabulary
  getTagVocabEntry,
  getTagCategory,
  fetchVocabulary,

  // Form utilities
  getTagFormData,
  clearTagForm,
  parseVariations,
  validateTagForm,
  toggleDescriptionField,
  updateFormButtonState,

  // Tag management
  addTagWithPolling,
  reprocessTag,
  reprocessAllEpisodes,
  startJobPollingWithUI,

  // General
  debounce,
};

// Make available globally
declare global {
  interface Window {
    DoDTools: typeof DoDTools;
  }
}

if (globalThis.window !== undefined) {
  (globalThis as unknown as Window).DoDTools = DoDTools;
}
