import { loadProcessedVideos } from "./load-processed-videos.js";
import { saveProcessedVideos } from "./save-processed-videos.js";

interface SegmentDescriptionUpdate {
  topicLabel: string;
  summary: string;
}

/**
 * Update description fields for a specific segment instance.
 */
export async function updateSegmentDescription(
  videoId: string,
  startTimestamp: string,
  updates: SegmentDescriptionUpdate,
): Promise<void> {
  const videos = await loadProcessedVideos();
  const videoIndex = videos.findIndex(video => video.videoId === videoId);

  if (videoIndex === -1) {
    throw new Error(`Video ${videoId} not found in processed videos`);
  }

  const video = videos[videoIndex];
  if (!video?.segments) {
    throw new Error(`Video ${videoId} has no segments`);
  }

  const segment = video.segments.find(
    candidate => candidate.startTimestamp === startTimestamp,
  );

  if (!segment) {
    throw new Error(`Segment ${startTimestamp} not found for video ${videoId}`);
  }

  segment.topicLabel = updates.topicLabel;
  segment.summary = updates.summary;

  await saveProcessedVideos(videos);
}
