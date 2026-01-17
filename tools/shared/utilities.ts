/**
 * Shared utilities for DoD Tools
 * Barrel export - re-exports all utilities from their respective files
 */

// Re-export constants
export { API_BASE_URL, CATEGORY_LABELS } from "./constants.js";

// Re-export types
export type {
  AudioPlayerOptions,
  BreadcrumbItem,
  Episode,
  EpisodeSegment,
  EpisodeTag,
  EpisodeWithAudio,
  JobStatus,
  ParsedLine,
  PollJobOptions,
  SegmentMetadata,
  TagVocabularyEntry,
  TranscriptLine,
} from "./types.js";

// Re-export formatting utilities
export { escapeHtml, formatDate } from "./formatting.js";

// Re-export timestamp utilities
export {
  formatSecondsToTimestamp,
  formatTimestamp,
  parseTimestamp,
  secondsToTimestamp,
  timestampToSeconds,
} from "./timestamp.js";

// Re-export API utilities
export {
  fetchSegmentMetadata,
  getAllEpisodes,
  getEpisode,
  getTranscript,
  parseTranscript,
  saveSegments,
} from "./api.js";

// Re-export UI utilities
export {
  createAudioPlayer,
  getTagCategoryClass,
  renderBreadcrumbs,
  renderEpisodeCard,
  seekToTimestamp,
  showToast,
} from "./ui.js";

// Re-export URL utilities
export { getSubpageFromUrl, getVideoIdFromUrl } from "./url.js";

// Re-export segment utilities
export { getSegmentDuration, getTotalDuration } from "./segment.js";

// Re-export segment operations
export {
  addSegmentAtTime,
  deleteSegmentAtIndex,
  markAllSegmentsVerified,
  sortSegmentsByTime,
  updateSegmentEnd,
  updateSegmentStart,
  updateSegmentType,
} from "./segment-operations.js";

// Re-export timeline utilities
export { renderSegmentLegend, renderTimeline } from "./timeline.js";

// Re-export job polling utilities
export { pollJobStatus, startJobPolling } from "./job-polling.js";

// Re-export storage utilities
export { loadFromStorage, saveToStorage } from "./storage.js";

// Re-export debounce utility
export { debounce } from "./debounce.js";

// Re-export vocabulary utilities
export {
  fetchVocabulary,
  getTagCategory,
  getTagVocabEntry,
} from "./vocabulary.js";

// Re-export form utilities
export {
  clearTagForm,
  getTagFormData,
  parseVariations,
  toggleDescriptionField,
  updateFormButtonState,
  validateTagForm,
  type TagFormData,
} from "./form-utils.js";

// Re-export tag management utilities
export {
  addTagWithPolling,
  reprocessAllEpisodes,
  reprocessTag,
  startJobPollingWithUI,
  type JobPollingUIConfig,
} from "./tag-management.js";

// Import for namespace object
import {
  fetchSegmentMetadata,
  getAllEpisodes,
  getEpisode,
  getTranscript,
  parseTranscript,
  saveSegments,
} from "./api.js";
import { API_BASE_URL, CATEGORY_LABELS } from "./constants.js";
import { debounce } from "./debounce.js";
import {
  clearTagForm,
  getTagFormData,
  parseVariations,
  toggleDescriptionField,
  updateFormButtonState,
  validateTagForm,
} from "./form-utils.js";
import { escapeHtml, formatDate } from "./formatting.js";
import { pollJobStatus, startJobPolling } from "./job-polling.js";
import {
  addSegmentAtTime,
  deleteSegmentAtIndex,
  markAllSegmentsVerified,
  sortSegmentsByTime,
  updateSegmentEnd,
  updateSegmentStart,
  updateSegmentType,
} from "./segment-operations.js";
import { getSegmentDuration, getTotalDuration } from "./segment.js";
import { loadFromStorage, saveToStorage } from "./storage.js";
import {
  addTagWithPolling,
  reprocessAllEpisodes,
  reprocessTag,
  startJobPollingWithUI,
} from "./tag-management.js";
import { renderSegmentLegend, renderTimeline } from "./timeline.js";
import {
  formatSecondsToTimestamp,
  formatTimestamp,
  parseTimestamp,
  secondsToTimestamp,
  timestampToSeconds,
} from "./timestamp.js";
import {
  createAudioPlayer,
  getTagCategoryClass,
  renderBreadcrumbs,
  renderEpisodeCard,
  seekToTimestamp,
  showToast,
} from "./ui.js";
import { getSubpageFromUrl, getVideoIdFromUrl } from "./url.js";
import {
  fetchVocabulary,
  getTagCategory,
  getTagVocabEntry,
} from "./vocabulary.js";

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
