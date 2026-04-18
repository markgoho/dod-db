import { loadProcessedVideos } from "./load-processed-videos.js";
import { saveProcessedVideos } from "./save-processed-videos.js";

export async function updateVideoEpisodeTopic(
  videoId: string,
  episodeTopic: string,
): Promise<void> {
  const videos = await loadProcessedVideos();

  const videoIndex = videos.findIndex(v => v.videoId === videoId);
  if (videoIndex === -1) {
    throw new Error(`Video ${videoId} not found in processed videos`);
  }

  const video = videos[videoIndex];
  if (!video) {
    throw new Error(`Video ${videoId} not found in processed videos`);
  }

  video.episodeTopic = episodeTopic;
  await saveProcessedVideos(videos);
}
