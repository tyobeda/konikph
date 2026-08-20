/**
 * Formats a phone number to standard international format (defaults to +62 for Indonesia).
 * Examples:
 *   "08123456789" -> "+628123456789"
 *   "8123456789" -> "+628123456789"
 *   "+628123456789" -> "+628123456789"
 *   "628123456789" -> "+628123456789"
 */
export function formatPhoneNumber(phone: string, defaultCountryCode: string = '62'): string {
  if (!phone) return '';
  
  // Trim spaces and special characters except '+' at start
  let clean = phone.trim();
  const hasPlus = clean.startsWith('+');
  
  // Keep only digits
  clean = clean.replace(/[^0-9]/g, '');
  if (!clean) return '';

  if (hasPlus) {
    return `+${clean}`;
  }

  if (clean.startsWith('0')) {
    return `+${defaultCountryCode}${clean.slice(1)}`;
  }

  if (clean.startsWith(defaultCountryCode)) {
    return `+${clean}`;
  }

  return `+${defaultCountryCode}${clean}`;
}

/**
 * Strips non-digits and returns clean number formatted for WhatsApp API (e.g. 628123456789)
 */
export function formatPhoneForWA(phone: string, defaultCountryCode: string = '62'): string {
  const formatted = formatPhoneNumber(phone, defaultCountryCode);
  return formatted.replace(/[^0-9]/g, '');
}
