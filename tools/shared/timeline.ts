/**
 * Timeline visualization utilities for DoD Tools
 * Shared logic for rendering segment timelines
 */

import type { EpisodeSegment, SegmentMetadata } from './types.js';
import { timestampToSeconds } from './timestamp.js';
import { escapeHtml } from './formatting.js';

// Render timeline visualization with segments
export function renderTimeline({
  segments,
  totalDuration,
  metadata,
  selectedIndex,
  onSegmentClick,
}: {
  segments: EpisodeSegment[];
  totalDuration: number;
  metadata: SegmentMetadata;
  selectedIndex?: number;
  onSegmentClick?: string; // onclick handler name, e.g., 'selectSegment'
}): string {
  if (segments.length === 0) {
    return '<div class="timeline-empty">No segments detected</div>';
  }

  return segments
    .map((seg, index) => {
      const start = timestampToSeconds(seg.startTimestamp);
      const end = seg.endTimestamp
        ? timestampToSeconds(seg.endTimestamp)
        : totalDuration;
      const left = (start / totalDuration) * 100;
      const width = ((end - start) / totalDuration) * 100;
      const color = metadata.colors[seg.type] || '#666';
      const label = metadata.labels[seg.type] || seg.type;
      const isSelected = index === selectedIndex;

      const clickHandler = onSegmentClick ? `onclick="${onSegmentClick}(${index})"` : '';

      return `
        <div
          class="timeline-segment ${isSelected ? 'selected' : ''}"
          style="left: ${left}%; width: ${width}%; background-color: ${color};"
          ${clickHandler}
          title="${escapeHtml(label)}: ${seg.startTimestamp} - ${seg.endTimestamp || 'end'}"
        >
          <span class="timeline-label">${escapeHtml(label)}</span>
        </div>
      `;
    })
    .join('');
}

// Render segment type legend
export function renderSegmentLegend({
  metadata,
}: {
  metadata: SegmentMetadata;
}): string {
  return metadata.types
    .map((type) => {
      const color = metadata.colors[type] || '#666';
      const label = metadata.labels[type] || type;

      return `
        <div class="legend-item">
          <span class="legend-color" style="background-color: ${color};"></span>
          <span class="legend-label">${escapeHtml(label)}</span>
        </div>
      `;
    })
    .join('');
}
