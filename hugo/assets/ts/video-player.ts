/**
 * YouTube video player with auto-scroll transcript synchronization.
 * Uses YouTube IFrame Player API for playback control and time tracking.
 */

// YouTube IFrame API types
// Using interface merging pattern instead of namespace for ESLint compliance

type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5;

const YT_PLAYER_STATE = {
	UNSTARTED: -1 as const,
	ENDED: 0 as const,
	PLAYING: 1 as const,
	PAUSED: 2 as const,
	BUFFERING: 3 as const,
	CUED: 5 as const,
};

interface YTPlayerEvent {
	target: YTPlayer;
}

interface YTOnStateChangeEvent {
	target: YTPlayer;
	data: YTPlayerState;
}

interface YTPlayerVariables {
	autoplay?: 0 | 1;
	rel?: 0 | 1;
	start?: number;
}

interface YTPlayerOptions {
	videoId: string;
	playerVars?: YTPlayerVariables;
	events?: {
		onReady?: (event: YTPlayerEvent) => void;
		onStateChange?: (event: YTOnStateChangeEvent) => void;
	};
}

interface YTPlayer {
	playVideo(): void;
	pauseVideo(): void;
	seekTo(seconds: number, allowSeekAhead: boolean): void;
	getCurrentTime(): number;
	getPlayerState(): YTPlayerState;
	destroy(): void;
}

interface YTPlayerConstructor {
	new (elementId: string | HTMLElement, options: YTPlayerOptions): YTPlayer;
}

interface YTNamespace {
	Player: YTPlayerConstructor;
}

declare global {
	interface Window {
		YT?: YTNamespace;
		onYouTubeIframeAPIReady?: () => void;
	}
}

// Constants
const STORAGE_KEY = 'dod-transcript-auto-scroll';
const POLL_INTERVAL_MS = 250;

// Module state
type TranscriptLine = {
	element: HTMLElement;
	start: number;
};

type State = {
	player: YTPlayer | undefined;
	videoId: string;
	lines: TranscriptLine[];
	currentLineIndex: number;
	autoScrollEnabled: boolean;
	pollIntervalId: ReturnType<typeof setInterval> | undefined;
	pendingSeekSeconds: number | undefined;
	lastManualScrollTime: number;
};

const state: State = {
	player: undefined,
	videoId: '',
	lines: [],
	currentLineIndex: -1,
	autoScrollEnabled: true,
	pollIntervalId: undefined,
	pendingSeekSeconds: undefined,
	lastManualScrollTime: 0,
};

/**
 * Load auto-scroll preference from localStorage.
 */
function loadAutoScrollPreference(): boolean {
	const stored = localStorage.getItem(STORAGE_KEY);
	// Default to true if not set
	return stored === null ? true : stored === 'true';
}

/**
 * Save auto-scroll preference to localStorage.
 */
function saveAutoScrollPreference(enabled: boolean): void {
	localStorage.setItem(STORAGE_KEY, String(enabled));
}

/**
 * Build index of transcript lines from DOM.
 * Uses parseFloat to preserve millisecond precision from data attributes.
 */
function buildLineIndex(): TranscriptLine[] {
	const lines: TranscriptLine[] = [];
	const elements = document.querySelectorAll<HTMLElement>('.transcript-line');

	for (const element of elements) {
		const start = Number.parseFloat(element.dataset['start'] ?? '0');
		lines.push({ element, start });
	}

	return lines;
}

/**
 * Binary search to find the last line that started before or at currentTime.
 * Returns -1 if currentTime is before the first line.
 */
function findCurrentLineIndex(currentTime: number): number {
	const lines = state.lines;

	if (lines.length === 0) {
		return -1;
	}

	// If before first line, no match
	const firstLine = lines[0];
	if (firstLine === undefined || currentTime < firstLine.start) {
		return -1;
	}

	// Binary search for rightmost line where start <= currentTime
	let low = 0;
	let high = lines.length - 1;
	let result = 0;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const line = lines[mid];

		if (line === undefined) {
			break;
		}

		if (line.start <= currentTime) {
			result = mid;
			low = mid + 1;
		} else {
			high = mid - 1;
		}
	}

	return result;
}

/**
 * Scroll the transcript to show the given line.
 */
function scrollToLine(element: HTMLElement): void {
	element.scrollIntoView({
		behavior: 'smooth',
		block: 'center',
	});
}

/**
 * Update the active transcript line based on current video time.
 */
function updateActiveTranscriptLine(): void {
	if (!state.player || !state.autoScrollEnabled) {
		return;
	}

	// Don't auto-scroll if user recently scrolled manually (3 second grace period)
	const timeSinceManualScroll = Date.now() - state.lastManualScrollTime;
	if (timeSinceManualScroll < 3000) {
		return;
	}

	const currentTime = state.player.getCurrentTime();
	const lineIndex = findCurrentLineIndex(currentTime);

	if (lineIndex !== state.currentLineIndex) {
		// Remove highlight from previous line
		if (state.currentLineIndex >= 0) {
			const previousLine = state.lines[state.currentLineIndex];
			previousLine?.element.classList.remove('active');
		}

		// Add highlight and scroll to new line
		if (lineIndex >= 0) {
			const line = state.lines[lineIndex];
			if (line) {
				line.element.classList.add('active');
				scrollToLine(line.element);
			}
		}

		state.currentLineIndex = lineIndex;
	}
}

/**
 * Start polling for auto-scroll updates.
 */
function startPolling(): void {
	if (state.pollIntervalId !== undefined) {
		return;
	}

	state.pollIntervalId = globalThis.setInterval(updateActiveTranscriptLine, POLL_INTERVAL_MS);
}

/**
 * Stop polling for auto-scroll updates.
 */
function stopPolling(): void {
	if (state.pollIntervalId !== undefined) {
		globalThis.clearInterval(state.pollIntervalId);
		state.pollIntervalId = undefined;
	}
}

/**
 * Handle YouTube player state changes.
 */
function onPlayerStateChange(event: YTOnStateChangeEvent): void {
	if (event.data === YT_PLAYER_STATE.PLAYING) {
		startPolling();
	} else {
		stopPolling();
	}
}

/**
 * Handle YouTube player ready event.
 */
function onPlayerReady(_event: YTPlayerEvent): void {
	// If there was a pending seek, execute it now
	if (state.pendingSeekSeconds !== undefined) {
		state.player?.seekTo(state.pendingSeekSeconds, true);
		state.player?.playVideo();
		state.pendingSeekSeconds = undefined;
	}
}

/**
 * Get the Window object with proper typing.
 */
function getWindow(): Window {
	return globalThis as unknown as Window;
}

/**
 * Load YouTube IFrame API script.
 */
function loadYouTubeAPI(): Promise<void> {
	return new Promise((resolve) => {
		const win = getWindow();

		// Check if API is already loaded
		if (win.YT?.Player) {
			resolve();
			return;
		}

		// Set up callback for when API is ready
		const existingCallback = win.onYouTubeIframeAPIReady;
		win.onYouTubeIframeAPIReady = () => {
			existingCallback?.();
			resolve();
		};

		// Load the API script
		const script = document.createElement('script');
		script.src = 'https://www.youtube.com/iframe_api';
		document.head.append(script);
	});
}

/**
 * Create YouTube player instance.
 */
function createPlayer(container: HTMLElement, startSeconds?: number): void {
	// Create a div for the player (API needs an element to replace)
	const playerDiv = document.createElement('div');
	playerDiv.id = 'youtube-player';
	container.innerHTML = '';
	container.append(playerDiv);

	// Store pending seek if provided
	if (startSeconds !== undefined) {
		state.pendingSeekSeconds = startSeconds;
	}

	const YT = getWindow().YT;
	if (!YT) {
		return;
	}

	state.player = new YT.Player('youtube-player', {
		videoId: state.videoId,
		playerVars: {
			autoplay: 1,
			rel: 0,
			start: startSeconds,
		},
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange,
		},
	});
}

/**
 * Seek to a specific time in the video.
 */
function seekTo(seconds: number): void {
	if (state.player) {
		state.player.seekTo(seconds, true);
		state.player.playVideo();
	} else {
		// Player not loaded yet - store for later
		state.pendingSeekSeconds = seconds;
	}
}

/**
 * Handle click on transcript line.
 */
function handleLineClick(event: Event): void {
	const line = (event.currentTarget as HTMLElement);
	const seconds = Number.parseFloat(line.dataset['start'] ?? '0');

	// Prevent default if clicking the hidden timestamp anchor
	const target = event.target as HTMLElement;
	if (target.classList.contains('timestamp')) {
		event.preventDefault();
	}

	const container = document.querySelector<HTMLElement>('.video-player');
	if (!container) {
		return;
	}

	if (state.player) {
		seekTo(seconds);
	} else {
		// Load player and seek
		loadYouTubeAPI().then(() => {
			createPlayer(container, seconds);
		});
	}
}

/**
 * Handle click on video facade.
 */
function handleFacadeClick(event: Event, container: HTMLElement): void {
	event.preventDefault();

	loadYouTubeAPI().then(() => {
		createPlayer(container);
	});
}

/**
 * Handle click on segment chip.
 */
function handleSegmentClick(event: Event): void {
	const button = event.currentTarget as HTMLButtonElement;
	const seconds = Number.parseFloat(button.dataset['start'] ?? '0');

	const container = document.querySelector<HTMLElement>('.video-player');
	if (!container) {
		return;
	}

	if (state.player) {
		seekTo(seconds);
	} else {
		// Load player and seek to segment
		loadYouTubeAPI().then(() => {
			createPlayer(container, seconds);
		});
	}
}

/**
 * Handle auto-scroll toggle change.
 */
function handleToggleChange(event: Event): void {
	const checkbox = event.target as HTMLInputElement;
	state.autoScrollEnabled = checkbox.checked;
	saveAutoScrollPreference(checkbox.checked);

	// If turning off auto-scroll, clear active state
	if (!checkbox.checked && state.currentLineIndex >= 0) {
		const line = state.lines[state.currentLineIndex];
		line?.element.classList.remove('active');
		state.currentLineIndex = -1;
	}
}

/**
 * Detect manual scroll in transcript area.
 */
function handleTranscriptScroll(): void {
	state.lastManualScrollTime = Date.now();
}

/**
 * Initialize the video player and transcript sync.
 */
function init(): void {
	const player = document.querySelector<HTMLElement>('.video-player');
	const thumbnail = player?.querySelector<HTMLAnchorElement>('a');

	if (!player) {
		return;
	}

	const videoId = player.dataset['videoId'];
	if (!videoId) {
		return;
	}

	state.videoId = videoId;

	// Build line index
	state.lines = buildLineIndex();

	// Load auto-scroll preference
	state.autoScrollEnabled = loadAutoScrollPreference();

	// Set checkbox state
	const checkbox = document.querySelector<HTMLInputElement>('#auto-scroll-checkbox');
	if (checkbox) {
		checkbox.checked = state.autoScrollEnabled;
		checkbox.addEventListener('change', handleToggleChange);
	}

	// Handle thumbnail click
	if (thumbnail) {
		thumbnail.addEventListener('click', (event) => {
			handleFacadeClick(event, player);
		});
	}

	// Handle transcript line clicks
	for (const line of state.lines) {
		line.element.addEventListener('click', handleLineClick);
	}

	// Handle segment chip clicks
	const segmentChips = document.querySelectorAll<HTMLButtonElement>('.segment-chip');
	for (const chip of segmentChips) {
		chip.addEventListener('click', handleSegmentClick);
	}

	// Detect manual scroll in transcript
	const transcriptContent = document.querySelector('.transcript-content');
	if (transcriptContent) {
		transcriptContent.addEventListener('scroll', handleTranscriptScroll, { passive: true });
	}

	// Also detect scroll on window (for when transcript scrolls the page)
	globalThis.addEventListener('scroll', handleTranscriptScroll, { passive: true });
}

// Script in footer-scripts block runs after DOM is ready
init();
