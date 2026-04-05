export async function fetchPodcastRss(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) {
    return undefined;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch podcast RSS: ${response.status}`);
  }

  return response.text();
}

export const fetchPatreonRss = fetchPodcastRss;
