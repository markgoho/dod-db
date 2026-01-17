/**
 * Format ISO 8601 date to YYYY-MM-DD.
 * Example: "2024-01-15T12:00:00Z" → "2024-01-15"
 */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toISOString().split("T")[0] ?? "";
}
