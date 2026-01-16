/**
 * Shared utilities for generating Hugo episode pages.
 * Used by both the pipeline (automatic) and manual script (batch regeneration).
 */

import * as path from 'node:path';
import type { ProcessedVideo } from '../storage/processed-videos.js';
import { SEGMENT_LABELS, type SegmentType } from '../config/segment-patterns.js';

export const HUGO_CONTENT_DIR = 'hugo/content/episodes';

/** Regular hosts - anyone else in speakers array is a guest */
const HOSTS = new Set(['Dan McClellan', 'Dan Beecher']);

/** Segment types to exclude from episode pages (generic/placeholder types) */
const EXCLUDED_SEGMENT_TYPES = new Set<SegmentType>([
	'intro',
	'outro',
	'main-content',
	'segment',
	'advertisement',
]);

/**
 * Segment data for Hugo frontmatter.
 */
export interface SegmentData {
	type: string;
	label: string;
	startSeconds: number;
}

/**
 * Result of formatting segments for Hugo frontmatter.
 */
export interface FormattedSegments {
	segments: string[]; // Unique segment names for taxonomy
	segmentData: SegmentData[]; // All instances with timestamps
}

/**
 * Parse a timestamp string "[HH:MM:SS.mmm]" or "[HH:MM:SS]" to total seconds.
 */
function parseTimestampToSeconds(timestamp: string): number {
	// Remove brackets
	const clean = timestamp.replaceAll(/^\[|\]$/g, '');
	const parts = clean.split(':');
	const hours = Number.parseInt(parts[0] ?? '0', 10);
	const minutes = Number.parseInt(parts[1] ?? '0', 10);
	const secondsPart = parts[2] ?? '0';

	// Handle milliseconds
	const [seconds, milliseconds] = secondsPart.split('.');
	const totalSeconds =
		hours * 3600 +
		minutes * 60 +
		Number.parseInt(seconds ?? '0', 10) +
		(milliseconds ? Number.parseInt(milliseconds, 10) / 1000 : 0);

	return totalSeconds;
}

/**
 * Segment data as stored in ProcessedVideo (type is string from Zod).
 */
interface StoredSegment {
	type: string;
	startTimestamp: string;
	endTimestamp: string | null;
	confidence: 'auto' | 'verified';
	detectionMethod: string;
}

/**
 * Format segments for Hugo frontmatter.
 * - Filters: only verified segments, excludes generic types
 * - Sorts by timestamp (chronological order)
 * - Indexes multi-instance segments: "Chapter and Verse (1)", "(2)"
 *
 * @returns Object with segments (unique names for taxonomy) and segmentData (all instances)
 */
export function formatSegmentsForFrontmatter(
	segments: StoredSegment[] | undefined,
): FormattedSegments {
	if (!segments || segments.length === 0) {
		return { segments: [], segmentData: [] };
	}

	// Filter: only verified, exclude generic types
	const filtered = segments.filter(
		(segment) =>
			segment.confidence === 'verified' &&
			!EXCLUDED_SEGMENT_TYPES.has(segment.type as SegmentType),
	);

	if (filtered.length === 0) {
		return { segments: [], segmentData: [] };
	}

	// Sort by timestamp (chronological order)
	const sorted = [...filtered].sort((a, b) => {
		const aSeconds = parseTimestampToSeconds(a.startTimestamp);
		const bSeconds = parseTimestampToSeconds(b.startTimestamp);
		return aSeconds - bSeconds;
	});

	// Count instances of each segment type for indexing
	const typeCounts = new Map<string, number>();
	const typeInstanceCounts = new Map<string, number>();

	// First pass: count total instances per type
	for (const segment of sorted) {
		const count = typeCounts.get(segment.type) ?? 0;
		typeCounts.set(segment.type, count + 1);
	}

	// Second pass: create labeled segment data
	const segmentData: SegmentData[] = [];
	const uniqueSegmentNames = new Set<string>();

	for (const segment of sorted) {
		const segmentType = segment.type as SegmentType;
		const label = SEGMENT_LABELS[segmentType];
		const totalInstances = typeCounts.get(segment.type) ?? 1;
		const instanceNumber = (typeInstanceCounts.get(segment.type) ?? 0) + 1;
		typeInstanceCounts.set(segment.type, instanceNumber);

		// Add index only if multiple instances exist
		const displayLabel =
			totalInstances > 1 ? `${label} (${instanceNumber})` : label;

		const startSeconds = parseTimestampToSeconds(segment.startTimestamp);

		segmentData.push({
			type: segment.type,
			label: displayLabel,
			startSeconds,
		});

		// Track unique segment names for taxonomy (without instance numbers)
		uniqueSegmentNames.add(label);
	}

	return {
		segments: [...uniqueSegmentNames],
		segmentData,
	};
}

/**
 * Extract guest speakers (non-hosts) from the speakers array.
 * Returns guest names in the order they appear.
 */
export function getGuestSpeakers(speakers: string[] | undefined): string[] {
	if (!speakers) return [];
	return speakers.filter((speaker) => !HOSTS.has(speaker));
}

/**
 * Extract the clean episode title from the full video title.
 * Handles formats like:
 * - 'Episode 1 (April 8, 2023), "In the Beginning"' -> 'In the Beginning'
 * - 'Episode 10 (June 12, 2023): "Adam and Steve..."' -> 'Adam and Steve...'
 * - 'Apostlepalooza!' -> 'Apostlepalooza!'
 * - 'Christian Nationalism Ain't Christian: With Andrew Whitehead' -> 'Christian Nationalism Ain't Christian'
 * - 'Episode 47, Introducing History Daily' -> 'Introducing History Daily'
 */
export function extractCleanTitle(fullTitle: string): string {
	// Try to extract quoted portion
	const quotedMatch = /"([^"]+)"/.exec(fullTitle);
	if (quotedMatch?.[1]) {
		return quotedMatch[1];
	}

	// No quotes - clean up the title
	let title = fullTitle;

	// Strip leading "Episode N," or "Episode N:" patterns
	title = title.replace(/^Episode\s+\d+[,:]\s*/i, '');

	// Strip trailing ": With Name" or "with Name" patterns
	// (guest names are added programmatically from speakers array)
	title = title.replace(/:?\s*[Ww]ith\s+[\w\s.]+$/, '');

	return title.trim();
}

/**
 * Convert a title to a URL-safe slug.
 * Examples:
 * - "The End(s) of Monotheism" -> "the-ends-of-monotheism"
 * - "God's Wife" -> "gods-wife"
 * - "Ehrmageddon!" -> "ehrmageddon"
 */
export function slugifyTitle(title: string): string {
	return title
		.toLowerCase()
		.replaceAll(/[()'"!?]/g, '') // Remove punctuation
		.replaceAll(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
		.replaceAll(/-+/g, '-') // Collapse multiple hyphens
		.replaceAll(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a transcript line into its components.
 * Expected format: [HH:MM:SS.mmm] or [HH:MM:SS] Speaker Name: Text content
 */
export function parseTranscriptLine(line: string): {
	timestamp: string;
	totalSeconds: number;
	speaker: string;
	text: string;
} | undefined {
	const pattern = /^\[(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?\]\s*([^:]+):\s*(.+)$/;
	const match = pattern.exec(line);

	if (!match) {
		return undefined;
	}

	const hours = match[1] ?? '00';
	const minutes = match[2] ?? '00';
	const seconds = match[3] ?? '00';
	const milliseconds = match[4] ?? '000';
	const speaker = match[5]?.trim() ?? '';
	const text = match[6]?.trim() ?? '';

	// Calculate total seconds with millisecond precision
	const totalSeconds =
		Number.parseInt(hours, 10) * 3600 +
		Number.parseInt(minutes, 10) * 60 +
		Number.parseInt(seconds, 10) +
		Number.parseInt(milliseconds, 10) / 1000;

	const timestamp = `${hours}:${minutes}:${seconds}`;

	return { timestamp, totalSeconds, speaker, text };
}

/**
 * Transform transcript content into Hugo shortcode format.
 * Each line becomes a {{< line >}}...{{< /line >}} shortcode.
 */
export function transformToShortcodes(content: string): string {
	const lines = content.split('\n');
	const shortcodeLines: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (trimmed.length === 0) {
			continue;
		}

		// Only wrap lines that match the transcript pattern
		const parsed = parseTranscriptLine(trimmed);
		if (parsed) {
			// Reconstruct the line with full millisecond precision
			const msString = String(Math.round((parsed.totalSeconds % 1) * 1000)).padStart(3, '0');
			const fullTimestamp = `[${parsed.timestamp}.${msString}]`;
			shortcodeLines.push(`{{< line >}}${fullTimestamp} ${parsed.speaker}: ${parsed.text}{{< /line >}}`);
		}
	}

	return shortcodeLines.join('\n');
}

/**
 * Generate YAML frontmatter for an episode.
 */
export function generateFrontmatter(video: ProcessedVideo, cleanTitle: string): string {
	const tags = video.tags?.map((t) => t.tag) ?? [];
	const guests = getGuestSpeakers(video.speakers);
	const { segments, segmentData } = formatSegmentsForFrontmatter(video.segments);

	const lines: string[] = [
		'---',
		// Title - quote if it contains special characters
		cleanTitle.includes(':') || cleanTitle.includes('#')
			? `title: "${cleanTitle.replaceAll('"', String.raw`\"`)}"`
			: `title: ${cleanTitle}`,
		`date: ${video.publishedAt}`,
		`episodeNumber: ${video.episodeNumber}`,
		`videoId: ${video.videoId}`,
		// Alias for redirect from short URL (/episodes/N/) to canonical slug URL
		'aliases:',
		`  - /episodes/${video.episodeNumber}/`,
	];

	// Tags as YAML array
	if (tags.length > 0) {
		lines.push('tags:', ...tags.map((tag) => `  - ${tag}`));
	}

	// Guests as YAML array (non-host speakers)
	if (guests.length > 0) {
		lines.push('guests:', ...guests.map((guest) => `  - ${guest}`));
	}

	// Segments taxonomy (unique segment names for /segments/ pages)
	if (segments.length > 0) {
		lines.push('segments:', ...segments.map((segment) => `  - ${segment}`));
	}

	// Segment data (all instances with timestamps for clickable UI)
	if (segmentData.length > 0) {
		lines.push('segmentData:');
		for (const data of segmentData) {
			lines.push(
				`  - type: ${data.type}`,
				`    label: "${data.label}"`,
				`    startSeconds: ${data.startSeconds}`,
			);
		}
	}

	lines.push('draft: false', '---');

	return lines.join('\n');
}

/**
 * Get the output path for an episode's Hugo content file.
 * Returns the directory path with slug-based naming.
 */
export function getEpisodeOutputPath(video: ProcessedVideo, cleanTitle: string): string {
	const guests = getGuestSpeakers(video.speakers);
	const titleSlug = slugifyTitle(cleanTitle);
	const guestSlug = guests.length > 0 ? `-with-${slugifyTitle(guests.join('-and-'))}` : '';
	const outputDir = path.join(HUGO_CONTENT_DIR, `${video.episodeNumber}-${titleSlug}${guestSlug}`);
	return path.join(outputDir, 'index.md');
}
