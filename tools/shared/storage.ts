/**
 * Local storage utilities for DoD Tools
 */

// Save data to localStorage
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be full or disabled
  }
}

// Load data from localStorage
export function loadFromStorage<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : undefined;
  } catch {
    return undefined;
  }
}
