/**
 * Formatting utilities for DoD Tools
 */

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Escape HTML to prevent XSS
export function escapeHtml(string_: string): string {
  const div = document.createElement('div');
  div.textContent = string_;
  return div.innerHTML;
}
