/**
 * CLI script to generate Hugo episode content from processed videos.
 *
 * Usage:
 *   bun run src/scripts/generate-hugo-episodes.ts --all              # Generate all episodes
 *   bun run src/scripts/generate-hugo-episodes.ts --newest           # Generate most recent episode
 *   bun run src/scripts/generate-hugo-episodes.ts --episode 42       # Generate specific episode
 */

import * as path from 'node:path';
import {
	getProcessedVideosWithNumbers,
	getVideoByEpisodeNumber,
	type ProcessedVideo,
} from '../storage/processed-videos.js';

const HUGO_CONTENT_DIR = 'hugo/content/episodes';

/** Regular hosts - anyone else in speakers array is a guest */
const HOSTS = new Set(['Dan McClellan', 'Dan Beecher']);

/**
 * Extract guest speakers (non-hosts) from the speakers array.
 * Returns guest names in the order they appear.
 */
function getGuestSpeakers(speakers: string[] | undefined): string[] {
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
function extractCleanTitle(fullTitle: string): string {
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
function slugifyTitle(title: string): string {
	return title
		.toLowerCase()
		.replaceAll(/[()'"!?]/g, '') // Remove punctuation
		.replaceAll(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
		.replaceAll(/-+/g, '-') // Collapse multiple hyphens
		.replaceAll(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parsed transcript line with timestamp, speaker, and text.
 */
type ParsedLine = {
	timestamp: string;
	totalSeconds: number;
	speaker: string;
	speakerSlug: string;
	text: string;
};

/**
 * Parse a transcript line into its components.
 * Expected format: [HH:MM:SS.mmm] Speaker Name: Text content here
 */
function parseTranscriptLine(line: string): ParsedLine | undefined {
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
	const speakerSlug = speaker.toLowerCase().replaceAll(/\s+/g, '-');

	return { timestamp, totalSeconds, speaker, speakerSlug, text };
}

/**
 * Transform transcript content into Hugo shortcode format.
 * Each line becomes a {{< line >}}...{{< /line >}} shortcode.
 * The shortcode handles parsing and HTML generation.
 */
function transformToShortcodes(content: string): string {
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
function generateFrontmatter(video: ProcessedVideo, cleanTitle: string): string {
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
 * Generate Hugo content file for a single episode.
 */
async function generateEpisodeContent(video: ProcessedVideo): Promise<boolean> {
	if (video.episodeNumber === undefined) {
		console.warn(`⚠️  Skipping video ${video.videoId}: no episode number`);
		return false;
	}

	// Check if transcript exists
	const transcriptFile = Bun.file(video.transcriptPath);
	const transcriptExists = await transcriptFile.exists();

	if (!transcriptExists) {
		console.warn(
			`⚠️  Skipping episode ${video.episodeNumber}: transcript not found at ${video.transcriptPath}`,
		);
		return false;
	}

	// Read transcript content
	const transcriptContent = await transcriptFile.text();

	// Transform to Hugo shortcode format
	const transcriptWithShortcodes = transformToShortcodes(transcriptContent);

	// Generate frontmatter
	const cleanTitle = extractCleanTitle(video.title);
	const frontmatter = generateFrontmatter(video, cleanTitle);

	// Combine frontmatter and transcript
	const content = `${frontmatter}\n\n${transcriptWithShortcodes}`;

	// Write to Hugo content directory with slug-based path
	// Include guest name(s) in URL for SEO
	const guests = getGuestSpeakers(video.speakers);
	const titleSlug = slugifyTitle(cleanTitle);
	const guestSlug = guests.length > 0 ? `-with-${slugifyTitle(guests.join('-and-'))}` : '';
	const outputDir = path.join(HUGO_CONTENT_DIR, `${video.episodeNumber}-${titleSlug}${guestSlug}`);
	const outputPath = path.join(outputDir, 'index.md');

	// Ensure directory exists
	await Bun.write(outputPath, content);

	console.log(`✓ Generated episode ${video.episodeNumber}: ${extractCleanTitle(video.title)}`);
	return true;
}

/**
 * Generate content for all episodes.
 */
async function generateAllEpisodes(): Promise<{ success: number; failed: number }> {
	const videos = await getProcessedVideosWithNumbers();
	let success = 0;
	let failed = 0;

	console.log(`📚 Generating content for ${videos.length} episodes...\n`);

	for (const video of videos) {
		const result = await generateEpisodeContent(video);
		if (result) {
			success++;
		} else {
			failed++;
		}
	}

	return { success, failed };
}

/**
 * Generate content for the newest episode (highest episode number).
 */
async function generateNewestEpisode(): Promise<boolean> {
	const videos = await getProcessedVideosWithNumbers();

	if (videos.length === 0) {
		console.error('❌ No processed videos found');
		return false;
	}

	// Find the video with highest episode number using a for loop
	let newest = videos[0];
	for (const video of videos) {
		if (newest === undefined) {
			newest = video;
			continue;
		}
		const newestNumber = newest.episodeNumber ?? 0;
		const currentNumber = video.episodeNumber ?? 0;
		if (currentNumber > newestNumber) {
			newest = video;
		}
	}

	if (newest === undefined) {
		console.error('❌ Could not determine newest episode');
		return false;
	}

	console.log(`📺 Generating content for newest episode (${newest.episodeNumber})...\n`);
	return generateEpisodeContent(newest);
}

/**
 * Generate content for a specific episode by number.
 */
async function generateSpecificEpisode(episodeNumber: number): Promise<boolean> {
	const video = await getVideoByEpisodeNumber(episodeNumber);

	if (!video) {
		console.error(`❌ Episode ${episodeNumber} not found`);
		return false;
	}

	console.log(`📺 Generating content for episode ${episodeNumber}...\n`);
	return generateEpisodeContent(video);
}

async function main(): Promise<void> {
	console.log('🎙️  Hugo Episode Generator\n');

	// Parse CLI arguments
	const isAll = process.argv.includes('--all');
	const isNewest = process.argv.includes('--newest');
	const episodeArgumentIndex = process.argv.indexOf('--episode');
	const specificEpisode =
		episodeArgumentIndex === -1
			? undefined
			: Number.parseInt(process.argv[episodeArgumentIndex + 1] ?? '', 10);

	// Validate arguments
	const modeCount = [isAll, isNewest, specificEpisode !== undefined].filter(Boolean).length;

	if (modeCount === 0) {
		console.log('Usage:');
		console.log('  bun run src/scripts/generate-hugo-episodes.ts --all');
		console.log('  bun run src/scripts/generate-hugo-episodes.ts --newest');
		console.log('  bun run src/scripts/generate-hugo-episodes.ts --episode <number>');
		process.exit(1);
	}

	if (modeCount > 1) {
		console.error('❌ Please specify only one mode: --all, --newest, or --episode <number>');
		process.exit(1);
	}

	// Execute the appropriate mode
	if (isAll) {
		const { success, failed } = await generateAllEpisodes();
		console.log(`\n✅ Generated ${success} episodes`);
		if (failed > 0) {
			console.log(`⚠️  Skipped ${failed} episodes`);
			process.exit(1);
		}
	} else if (isNewest) {
		const success = await generateNewestEpisode();
		if (!success) {
			process.exit(1);
		}
	} else if (specificEpisode !== undefined) {
		if (Number.isNaN(specificEpisode)) {
			console.error('❌ Invalid episode number');
			process.exit(1);
		}
		const success = await generateSpecificEpisode(specificEpisode);
		if (!success) {
			process.exit(1);
		}
	}
}

await main();
