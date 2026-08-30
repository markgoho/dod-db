const NUMBER_WORDS: Record<string, string> = {
  one: "1",
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
  eleven: "11",
  twelve: "12",
  thirteen: "13",
  fourteen: "14",
  fifteen: "15",
  sixteen: "16",
  seventeen: "17",
  eighteen: "18",
  nineteen: "19",
  twenty: "20",
};

/**
 * Regex alternation of spelled-out chapter/verse numbers, longest word first
 * so e.g. "seventeen" matches before "seven" backtracks into it.
 */
export const numberWordPattern = Object.keys(NUMBER_WORDS)
  .toSorted((a, b) => b.length - a.length)
  .join("|");

/**
 * Spelled-out numbers safe to match right after a book name with no
 * "chapter" keyword present (e.g. "Genesis six", "Joshua six").
 * "one" is excluded: it collides constantly with ordinary English
 * ("the Mark one", "Luke one-ups him", "Psalms one after the other"),
 * so it only counts as a chapter number when "chapter" is said explicitly.
 */
export const bareNumberWordPattern = Object.keys(NUMBER_WORDS)
  .filter(word => word !== "one")
  .toSorted((a, b) => b.length - a.length)
  .join("|");

/**
 * Convert a spelled-out number word ("six") to its digit string ("6").
 * Returns the input unchanged if it isn't a recognized number word
 * (e.g. it was already a digit string).
 */
export function numberWordToDigits(value: string): string {
  return NUMBER_WORDS[value.toLowerCase()] ?? value;
}
