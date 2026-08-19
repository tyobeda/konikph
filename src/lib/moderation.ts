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

export function containsLink(text: string): boolean {
  if (!text) return false;
  // Match http://, https://, www., or domain pattern (xxx.xxx / xxx.com / xxx.id, etc.)
  const linkRegex = /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/|\b))/i;
  return linkRegex.test(text);
}
