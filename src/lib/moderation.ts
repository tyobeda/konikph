export function containsForbiddenWords(text: string, forbiddenWordsListStr?: string | null): string | null {
  if (!text || !forbiddenWordsListStr) return null;

  // Split words by comma or newline, clean whitespace, lowercase
  const forbiddenWords = forbiddenWordsListStr
    .split(/[\n,]/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length > 0);

  const lowerText = text.toLowerCase();

  for (const word of forbiddenWords) {
    // Regex check for word matching (or substring matching if word contains special chars)
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lowerText) || lowerText.includes(word)) {
      return word;
    }
  }

  return null;
}
