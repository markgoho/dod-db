/**
 * Unit tests for Hugo episode generator utilities.
 */

import { describe, test, expect } from 'bun:test';
import {
	extractCleanTitle,
	slugifyTitle,
	generateFrontmatter,
	getGuestSpeakers,
	parseTranscriptLine,
} from './episode-generator.js';
import type { ProcessedVideo } from '../storage/processed-videos.js';

describe('extractCleanTitle', () => {
	test('extracts quoted title', () => {
		const input = 'Episode 1 (April 8, 2023), "In the Beginning"';
		expect(extractCleanTitle(input)).toBe('In the Beginning');
	});

	test('extracts quoted title with colon format', () => {
		const input = 'Episode 10 (June 12, 2023): "Adam and Steve..."';
		expect(extractCleanTitle(input)).toBe('Adam and Steve...');
	});

	test('handles title without quotes', () => {
		const input = 'Apostlepalooza!';
		expect(extractCleanTitle(input)).toBe('Apostlepalooza!');
	});

	test('removes "Episode N," prefix', () => {
		const input = 'Episode 47, Introducing History Daily';
		expect(extractCleanTitle(input)).toBe('Introducing History Daily');
	});

	test('removes trailing "with Guest" pattern', () => {
		const input = 'Christian Nationalism Ain\'t Christian: With Andrew Whitehead';
		expect(extractCleanTitle(input)).toBe('Christian Nationalism Ain\'t Christian');
	});
});

describe('slugifyTitle', () => {
	test('converts title to lowercase', () => {
		const input = 'The End(s) of Monotheism';
		expect(slugifyTitle(input)).toBe('the-ends-of-monotheism');
	});

	test('removes apostrophes', () => {
		const input = 'God\'s Wife';
		expect(slugifyTitle(input)).toBe('gods-wife');
	});

	test('removes exclamation marks', () => {
		const input = 'Ehrmageddon!';
		expect(slugifyTitle(input)).toBe('ehrmageddon');
	});

	test('replaces spaces with hyphens', () => {
		const input = 'Multiple Word Title';
		expect(slugifyTitle(input)).toBe('multiple-word-title');
	});

	test('collapses multiple hyphens', () => {
		const input = 'Title   With   Spaces';
		expect(slugifyTitle(input)).toBe('title-with-spaces');
	});
});

describe('getGuestSpeakers', () => {
	test('filters out hosts', () => {
		const speakers = ['Dan McClellan', 'Andrew Whitehead', 'Dan Beecher'];
		expect(getGuestSpeakers(speakers)).toEqual(['Andrew Whitehead']);
	});

	test('returns empty array if no speakers', () => {
		expect(getGuestSpeakers([])).toEqual([]);
	});

	test('returns empty array when speakers is undefined', () => {
		// Simulate a variable that might be undefined (e.g., from optional property)
		const maybeVideo: { speakers?: string[] } = {};
		expect(getGuestSpeakers(maybeVideo.speakers)).toEqual([]);
	});

	test('returns all speakers if no hosts present', () => {
		const speakers = ['Guest One', 'Guest Two'];
		expect(getGuestSpeakers(speakers)).toEqual(['Guest One', 'Guest Two']);
	});
});

describe('parseTranscriptLine', () => {
	test('parses line with milliseconds', () => {
		const line = '[00:05:23.456] Dan McClellan: Hello world';
		const result = parseTranscriptLine(line);

		expect(result).toBeDefined();
		expect(result?.timestamp).toBe('00:05:23');
		expect(result?.totalSeconds).toBe(323.456);
		expect(result?.speaker).toBe('Dan McClellan');
		expect(result?.text).toBe('Hello world');
	});

	test('parses line without milliseconds', () => {
		const line = '[00:05:23] Dan McClellan: Hello world';
		const result = parseTranscriptLine(line);

		expect(result).toBeDefined();
		expect(result?.timestamp).toBe('00:05:23');
		expect(result?.totalSeconds).toBe(323);
		expect(result?.speaker).toBe('Dan McClellan');
		expect(result?.text).toBe('Hello world');
	});

	test('returns undefined for invalid format', () => {
		const line = 'This is not a transcript line';
		expect(parseTranscriptLine(line)).toBeUndefined();
	});
});

describe('generateFrontmatter', () => {
	test('generates valid YAML frontmatter', () => {
		const video: ProcessedVideo = {
			videoId: 'abc123',
			title: 'Episode 1, "Test Episode"',
			publishedAt: '2024-01-15T10:00:00Z',
			processedAt: '2024-01-15T12:00:00Z',
			transcriptPath: 'data/transcripts/2024-01-15-test-episode.txt',
			episodeNumber: 1,
			tags: [
				{ tag: 'theology', mentions: 5 },
				{ tag: 'Torah', mentions: 10 },
			],
			speakers: ['Dan McClellan', 'Dan Beecher'],
		};

		const cleanTitle = 'Test Episode';
		const frontmatter = generateFrontmatter(video, cleanTitle);

		// Should start and end with ---
		expect(frontmatter.startsWith('---\n')).toBe(true);
		expect(frontmatter.endsWith('---')).toBe(true);

		// Should contain key fields
		expect(frontmatter).toContain('title: Test Episode');
		expect(frontmatter).toContain('episodeNumber: 1');
		expect(frontmatter).toContain('videoId: abc123');
		expect(frontmatter).toContain('draft: false');

		// Should contain tags
		expect(frontmatter).toContain('tags:');
		expect(frontmatter).toContain('- theology');
		expect(frontmatter).toContain('- Torah');

		// Should contain date (format may vary, just check it's present)
		expect(frontmatter).toContain('date:');

		// Should contain aliases
		expect(frontmatter).toContain('aliases:');
		expect(frontmatter).toContain('- /episodes/1/');
	});

	test('omits optional fields when empty', () => {
		const video: ProcessedVideo = {
			videoId: 'abc123',
			title: 'Episode 1',
			publishedAt: '2024-01-15T10:00:00Z',
			processedAt: '2024-01-15T12:00:00Z',
			transcriptPath: 'data/transcripts/2024-01-15-episode-1.txt',
			episodeNumber: 1,
			// No tags
			speakers: ['Dan McClellan'], // Only hosts, no guests
		};

		const cleanTitle = 'Episode 1';
		const frontmatter = generateFrontmatter(video, cleanTitle);

		// Should not contain tags or guests sections
		expect(frontmatter).not.toContain('tags:');
		expect(frontmatter).not.toContain('guests:');
	});

	test('includes guests when present', () => {
		const video: ProcessedVideo = {
			videoId: 'abc123',
			title: 'Episode 1',
			publishedAt: '2024-01-15T10:00:00Z',
			processedAt: '2024-01-15T12:00:00Z',
			transcriptPath: 'data/transcripts/2024-01-15-episode-1.txt',
			episodeNumber: 1,
			speakers: ['Dan McClellan', 'Andrew Whitehead', 'Dan Beecher'],
		};

		const cleanTitle = 'Episode 1';
		const frontmatter = generateFrontmatter(video, cleanTitle);

		// Should contain guests section
		expect(frontmatter).toContain('guests:');
		expect(frontmatter).toContain('- Andrew Whitehead');
	});
});
