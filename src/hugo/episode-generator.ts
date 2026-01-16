/**
 * Shared utilities for generating Hugo episode pages.
 * Used by both the pipeline (automatic) and manual script (batch regeneration).
 */

import * as path from 'node:path';
import type { ProcessedVideo } from '../storage/processed-videos.js';

export const HUGO_CONTENT_DIR = 'hugo/content/episodes';

/** Regular hosts - anyone else in speakers array is a guest */
const HOSTS = new Set(['Dan McClellan', 'Dan Beecher']);

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
	const speakers = video.speakers ?? [];

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

	// Speakers as YAML array
	if (speakers.length > 0) {
		lines.push('speakers:', ...speakers.map((speaker) => `  - ${speaker}`));
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
