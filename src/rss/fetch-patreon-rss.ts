export async function fetchPatreonRss(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) {
    return undefined;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch Patreon RSS: ${response.status}`);
  }

  return response.text();
}
