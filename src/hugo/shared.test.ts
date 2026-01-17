/**
 * Unit tests for shared Hugo utilities.
 */

import { describe, test, expect } from 'bun:test';
import {
	slugifyTitle,
	getGuestSpeakers,
	parseTranscriptLine,
} from './shared.js';

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
