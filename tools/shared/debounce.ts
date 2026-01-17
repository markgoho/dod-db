/**
 * Debounce utility for DoD Tools
 */

// Debounce function calls
export function debounce<T extends (...arguments_: unknown[]) => void>(
  function_: T,
  delay: number,
): (...arguments_: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...arguments_: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => function_(...arguments_), delay);
  };
}
