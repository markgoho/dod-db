/**
 * YouTube IFrame Player utilities
 * Provides Promise-based API for loading and controlling YouTube players
 */

import type {
  YTGlobal,
  YTPlayer,
  YTPlayerEvent,
  YouTubePlayerState,
} from "./youtube-player-types.js";
import { YTPlayerState } from "./youtube-player-types.js";

/** Promise resolvers waiting for API to load */
let apiLoadPromise: Promise<void> | undefined;

/** Get the YouTube API global */
function getYT(): YTGlobal | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Access dynamic YouTube API
  return (globalThis as any).YT as YTGlobal | undefined;
}

/** Set the YouTube API ready callback */
function setYouTubeReadyCallback(callback: () => void): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Set dynamic YouTube API callback
  (globalThis as any).onYouTubeIframeAPIReady = callback;
}

/**
 * Load the YouTube IFrame API script
 * @returns Promise that resolves when the API is ready
 */
export function loadYouTubeAPI(): Promise<void> {
  // Return existing promise if already loading/loaded
  if (apiLoadPromise) {
    return apiLoadPromise;
  }

  // Return immediately if already loaded
  const existingYT = getYT();
  if (existingYT?.Player) {
    apiLoadPromise = Promise.resolve();
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise<void>((resolve, reject) => {
    // Set up callback for when API is ready
    setYouTubeReadyCallback((): void => {
      resolve();
    });

    // Create and inject script element
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => {
      reject(new Error("Failed to load YouTube IFrame API"));
    });

    const firstScript = document.querySelectorAll("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.append(script);
    }
  });

  return apiLoadPromise;
}

/** Options for creating a YouTube player */
export interface CreateYouTubePlayerOptions {
  containerId: string;
  videoId: string;
  onReady?: (event: YTPlayerEvent) => void;
  onStateChange?: (event: YTPlayerEvent) => void;
  onError?: (event: YTPlayerEvent) => void;
}

/**
 * Create a YouTube player in the specified container
 * @param options Player creation options
 * @returns The created YouTube player instance
 */
export async function createYouTubePlayer(
  options: CreateYouTubePlayerOptions,
): Promise<YTPlayer> {
  await loadYouTubeAPI();

  const { containerId, videoId, onReady, onStateChange, onError } = options;

  const YT = getYT();
  if (!YT) {
    throw new Error("YouTube API not loaded");
  }

  return new Promise<YTPlayer>((resolve, reject) => {
    try {
      new YT.Player(containerId, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: {
          enablejsapi: 1,
          playsinline: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event: YTPlayerEvent): void => {
            onReady?.(event);
            resolve(event.target);
          },
          onStateChange,
          onError: (event: YTPlayerEvent): void => {
            onError?.(event);
            // Don't reject here - player may still be usable
          },
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Create initial player state
 */
export function createInitialPlayerState(): YouTubePlayerState {
  return {
    player: undefined,
    videoId: undefined,
    isReady: false,
    duration: 0,
    pollingInterval: undefined,
    pendingSeek: undefined,
  };
}

/**
 * Start polling for time updates
 * @param state The player state
 * @param onTimeUpdate Callback for time updates
 * @param intervalMs Polling interval in milliseconds (default 250)
 */
export function startTimePolling(
  state: YouTubePlayerState,
  onTimeUpdate: (currentTime: number, duration: number) => void,
  intervalMs = 250,
): void {
  // Clear any existing interval
  stopTimePolling(state);

  state.pollingInterval = setInterval(() => {
    if (state.player && state.isReady) {
      const currentTime = state.player.getCurrentTime();
      const duration = state.player.getDuration();
      onTimeUpdate(currentTime, duration);
    }
  }, intervalMs);
}

/**
 * Stop polling for time updates
 * @param state The player state
 */
export function stopTimePolling(state: YouTubePlayerState): void {
  if (state.pollingInterval !== undefined) {
    clearInterval(state.pollingInterval);
    state.pollingInterval = undefined;
  }
}

/**
 * Seek to a specific time in the video
 * If player isn't ready yet, stores as pending seek
 * @param state The player state
 * @param seconds Time in seconds to seek to
 * @param autoPlay Whether to auto-play after seeking (default true)
 */
export function seekYouTube(
  state: YouTubePlayerState,
  seconds: number,
  autoPlay = true,
): void {
  if (!state.player || !state.isReady) {
    state.pendingSeek = seconds;
    return;
  }

  state.player.seekTo(seconds, true);
  if (autoPlay) {
    state.player.playVideo();
  }
}

/**
 * Apply any pending seek operation
 * Call this when the player becomes ready
 * @param state The player state
 * @param autoPlay Whether to auto-play after seeking (default false for initial load)
 */
export function applyPendingSeek(
  state: YouTubePlayerState,
  autoPlay = false,
): void {
  if (state.pendingSeek !== undefined && state.player && state.isReady) {
    const seekTime = state.pendingSeek;
    state.pendingSeek = undefined;
    state.player.seekTo(seekTime, true);
    if (autoPlay) {
      state.player.playVideo();
    }
  }
}

/**
 * Get the current playback time
 * @param state The player state
 * @returns Current time in seconds, or 0 if not ready
 */
export function getYouTubeCurrentTime(state: YouTubePlayerState): number {
  if (!state.player || !state.isReady) {
    return 0;
  }
  return state.player.getCurrentTime();
}

/**
 * Get the video duration
 * @param state The player state
 * @returns Duration in seconds, or 0 if not ready
 */
export function getYouTubeDuration(state: YouTubePlayerState): number {
  if (!state.player || !state.isReady) {
    return state.duration || 0;
  }
  return state.player.getDuration();
}

/**
 * Play the video
 * @param state The player state
 */
export function playYouTube(state: YouTubePlayerState): void {
  if (state.player && state.isReady) {
    state.player.playVideo();
  }
}

/**
 * Pause the video
 * @param state The player state
 */
export function pauseYouTube(state: YouTubePlayerState): void {
  if (state.player && state.isReady) {
    state.player.pauseVideo();
  }
}

/**
 * Check if the video is currently playing
 * @param state The player state
 * @returns true if playing
 */
export function isYouTubePlaying(state: YouTubePlayerState): boolean {
  if (!state.player || !state.isReady) {
    return false;
  }
  return state.player.getPlayerState() === YTPlayerState.PLAYING;
}

/**
 * Destroy the player and clean up resources
 * @param state The player state
 */
export function destroyYouTubePlayer(state: YouTubePlayerState): void {
  stopTimePolling(state);

  if (state.player) {
    try {
      state.player.destroy();
    } catch {
      // Player may already be destroyed
    }
    state.player = undefined;
  }

  state.isReady = false;
  state.videoId = undefined;
  state.duration = 0;
  state.pendingSeek = undefined;
}

// Re-export types and constants for convenience
export { YTPlayerState } from "./youtube-player-types.js";
export type {
  YTGlobal,
  YTPlayer,
  YTPlayerEvent,
  YTPlayerStateValue,
  YouTubePlayerState,
} from "./youtube-player-types.js";
