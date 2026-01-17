/**
 * Build a Bible Gateway URL for a scripture reference.
 * Uses NRSVUE (New Revised Standard Version Updated Edition) translation.
 */
export function buildBibleGatewayUrl(reference: string): string {
  const encodedReference = encodeURIComponent(reference);
  return `https://www.biblegateway.com/passage/?search=${encodedReference}&version=NRSVUE`;
}
