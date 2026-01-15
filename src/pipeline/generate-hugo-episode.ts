/**
 * Generate Hugo episode content for a single processed video.
 * Called automatically by the YouTube processing pipeline.
 */

import * as path from 'node:path';
import type { ProcessedVideo } from '../storage/processed-videos.js';

const HUGO_CONTENT_DIR = 'hugo/content/episodes';

/**
 * Extract the clean episode title from the full video title.
 * Handles formats like:
 * - 'Episode 1 (April 8, 2023), "In the Beginning"' -> 'In the Beginning'
 * - 'Episode 10 (June 12, 2023): "Adam and Steve..."' -> 'Adam and Steve...'
 * - 'Apostlepalooza!' -> 'Apostlepalooza!'
 */
function extractCleanTitle(fullTitle: string): string {
	const quotedMatch = /"([^"]+)"/.exec(fullTitle);
	if (quotedMatch?.[1]) {
		return quotedMatch[1];
	}
	return fullTitle;
}

/**
 * Generate YAML frontmatter for an episode.
 */
function generateFrontmatter(video: ProcessedVideo): string {
	const cleanTitle = extractCleanTitle(video.title);
	const tags = video.tags?.map((t) => t.tag) ?? [];
	const speakers = video.speakers ?? [];

	const lines: string[] = [
		'---',
		cleanTitle.includes(':') || cleanTitle.includes('#')
			? `title: "${cleanTitle.replaceAll('"', String.raw`\"`)}"`
			: `title: ${cleanTitle}`,
		`date: ${video.publishedAt}`,
		`episodeNumber: ${video.episodeNumber}`,
		`videoId: ${video.videoId}`,
	];

	if (tags.length > 0) {
		lines.push('tags:', ...tags.map((tag) => `  - ${tag}`));
	}

	if (speakers.length > 0) {
		lines.push('speakers:', ...speakers.map((speaker) => `  - ${speaker}`));
	}

	lines.push('draft: false', '---');

	return lines.join('\n');
}

/**
 * Generate Hugo content file for a single episode.
 * Returns true if successful, false if skipped.
 */
export async function generateHugoEpisode(video: ProcessedVideo): Promise<boolean> {
	if (video.episodeNumber === undefined) {
		console.warn(`⚠️  Cannot generate Hugo page: no episode number for ${video.videoId}`);
		return false;
	}

	const transcriptFile = Bun.file(video.transcriptPath);
	const transcriptExists = await transcriptFile.exists();

	if (!transcriptExists) {
		console.warn(
			`⚠️  Cannot generate Hugo page: transcript not found at ${video.transcriptPath}`,
		);
		return false;
	}

	const transcriptContent = await transcriptFile.text();
	const frontmatter = generateFrontmatter(video);
	const content = `${frontmatter}\n\n${transcriptContent}`;

	const outputPath = path.join(
		HUGO_CONTENT_DIR,
		String(video.episodeNumber),
		'index.md',
	);

	await Bun.write(outputPath, content);

	console.log(`✓ Generated Hugo page: /episodes/${video.episodeNumber}/`);
	return true;
}
