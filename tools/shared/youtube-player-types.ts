/**
 * YouTube IFrame API type definitions
 * @see https://developers.google.com/youtube/iframe_api_reference
 */

/** YouTube player state constants */
export const YTPlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YTPlayerStateValue =
  (typeof YTPlayerState)[keyof typeof YTPlayerState];

/** YouTube player quality levels */
export type YTQuality =
  | "small"
  | "medium"
  | "large"
  | "hd720"
  | "hd1080"
  | "highres"
  | "default";

/** YouTube player event data */
export interface YTPlayerEvent {
  target: YTPlayer;
  data?: YTPlayerStateValue;
}

/** YouTube player instance */
export interface YTPlayer {
  // Playback controls
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;

  // Volume controls
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volume: number): void;
  getVolume(): number;

  // Playback status
  getPlayerState(): YTPlayerStateValue;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoLoadedFraction(): number;

  // Video info
  getVideoUrl(): string;
  getVideoEmbedCode(): string;

  // Player info
  getIframe(): HTMLIFrameElement;
  destroy(): void;

  // Cue/load video
  cueVideoById(videoId: string, startSeconds?: number): void;
  loadVideoById(videoId: string, startSeconds?: number): void;
}

/** YouTube player constructor options */
export interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  videoId?: string;
  playerVars?: YTPlayerVariables;
  events?: YTPlayerEvents;
}

/** YouTube player embed parameters */
export interface YTPlayerVariables {
  autoplay?: 0 | 1;
  cc_load_policy?: 0 | 1;
  color?: "red" | "white";
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
  end?: number;
  fs?: 0 | 1;
  iv_load_policy?: 1 | 3;
  loop?: 0 | 1;
  modestbranding?: 0 | 1;
  origin?: string;
  playlist?: string;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
  start?: number;
}

/** YouTube player event callbacks */
export interface YTPlayerEvents {
  onReady?: (event: YTPlayerEvent) => void;
  onStateChange?: (event: YTPlayerEvent) => void;
  onError?: (event: YTPlayerEvent) => void;
  onPlaybackQualityChange?: (event: YTPlayerEvent) => void;
  onPlaybackRateChange?: (event: YTPlayerEvent) => void;
}

/** YouTube IFrame API global */
export interface YTGlobal {
  Player: new (
    elementId: string | HTMLElement,
    options: YTPlayerOptions,
  ) => YTPlayer;
  PlayerState: typeof YTPlayerState;
}

/** State for managing YouTube player in the app */
export interface YouTubePlayerState {
  player: YTPlayer | undefined;
  videoId: string | undefined;
  isReady: boolean;
  duration: number;
  pollingInterval: ReturnType<typeof setInterval> | undefined;
  pendingSeek: number | undefined;
}
