/**
 * Hugo frontmatter utilities for reading and writing episode metadata.
 */

import * as yaml from 'js-yaml';
import * as path from 'node:path';
import {
	extractCleanTitle,
	getEpisodeOutputPath,
} from '../hugo/episode-generator.js';
import type { ProcessedVideo } from '../storage/processed-videos.js';

/**
 * Hugo episode frontmatter structure.
 * Matches the frontmatter in hugo/content/episodes/{number}/index.md
 * Note: date can be string or Date depending on yaml.load() auto-conversion
 */
export interface HugoEpisodeFrontmatter {
	title: string;
	date: string | Date;
	episodeNumber: number;
	videoId: string;
	youtubeUrl: string;
	tags: string[];
	speakers: string[];
	draft?: boolean;
}

/**
 * Parse a Hugo markdown file and extract frontmatter + content.
 *
 * @param filePath - Path to the Hugo markdown file
 * @returns Object with frontmatter and content
 */
export async function parseHugoFile(filePath: string): Promise<{
	frontmatter: HugoEpisodeFrontmatter;
	content: string;
}> {
	const file = Bun.file(filePath);
	const fullContent = await file.text();

	// Hugo frontmatter is between --- markers
	const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = fullContent.match(frontmatterRegex);

	if (!match || !match[1] || !match[2]) {
		throw new Error(`No frontmatter found in ${filePath}`);
	}

	const frontmatterYaml = match[1];
	const content = match[2];
	const frontmatter = yaml.load(frontmatterYaml) as HugoEpisodeFrontmatter;

	return { frontmatter, content };
}

/**
 * Write Hugo markdown file with updated frontmatter.
 *
 * @param filePath - Path to the Hugo markdown file
 * @param frontmatter - Frontmatter object
 * @param content - Markdown content (unchanged)
 */
export async function writeHugoFile({
	filePath,
	frontmatter,
	content,
}: {
	filePath: string;
	frontmatter: HugoEpisodeFrontmatter;
	content: string;
}): Promise<void> {
	// Normalize date to Date object for consistent formatting
	// Ensures yaml.dump produces unquoted date with milliseconds
	const normalizedFrontmatter = {
		...frontmatter,
		date: typeof frontmatter.date === 'string' ? new Date(frontmatter.date) : frontmatter.date,
	};

	const frontmatterYaml = yaml.dump(normalizedFrontmatter);
	const fullContent = `---\n${frontmatterYaml}---\n${content}`;
	await Bun.write(filePath, fullContent);
}

/**
 * Get the Hugo episode file path for a processed video.
 * Uses the same slug generation logic as the episode generator.
 *
 * @param video - ProcessedVideo object with title and speakers
 * @returns Absolute path to the Hugo episode markdown file
 */
export function getHugoEpisodePath(video: ProcessedVideo): string {
	const cleanTitle = extractCleanTitle(video.title);
	const relativePath = getEpisodeOutputPath(video, cleanTitle);
	return path.join(process.cwd(), relativePath);
}

/**
 * Remove a tag from an episode's frontmatter.
 *
 * @param video - ProcessedVideo object
 * @param tagToRemove - Tag to remove (case-insensitive)
 * @returns true if tag was found and removed, false otherwise
 */
export async function removeTagFromEpisode({
	video,
	tagToRemove,
}: {
	video: ProcessedVideo;
	tagToRemove: string;
}): Promise<boolean> {
	const filePath = getHugoEpisodePath(video);
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		console.warn(
			`Hugo episode file not found for episode ${video.episodeNumber}: ${filePath}`,
		);
		return false;
	}

	const { frontmatter, content } = await parseHugoFile(filePath);

	// Filter out the tag (case-insensitive)
	const originalLength = frontmatter.tags.length;
	frontmatter.tags = frontmatter.tags.filter(
		(tag) => tag.toLowerCase() !== tagToRemove.toLowerCase(),
	);

	// If no tags were removed, return false
	if (frontmatter.tags.length === originalLength) {
		return false;
	}

	// Write back updated frontmatter
	await writeHugoFile({ filePath, frontmatter, content });

	return true;
}

/**
 * Update tags for an episode's frontmatter.
 *
 * @param video - ProcessedVideo object
 * @param tags - New tags array
 */
export async function updateEpisodeTags({
	video,
	tags,
}: {
	video: ProcessedVideo;
	tags: string[];
}): Promise<void> {
	const filePath = getHugoEpisodePath(video);
	const file = Bun.file(filePath);

	if (!(await file.exists())) {
		throw new Error(
			`Hugo episode file not found for episode ${video.episodeNumber}: ${filePath}`,
		);
	}

	const { frontmatter, content } = await parseHugoFile(filePath);
	frontmatter.tags = tags;

	await writeHugoFile({ filePath, frontmatter, content });
}
