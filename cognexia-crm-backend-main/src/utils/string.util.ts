/**
 * Convert string to slug format
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(text: string): string {
  return text.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(text: string): string {
  return text.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

/**
 * Truncate string with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate alphanumeric code
 */
export function generateCode(prefix: string = '', length: number = 8): string {
  const randomPart = randomString(length).toUpperCase();
  return prefix ? `${prefix}-${randomPart}` : randomPart;
}

/**
 * Remove special characters
 */
export function removeSpecialChars(text: string): string {
  return text.replace(/[^a-zA-Z0-9\s]/g, '');
}

/**
 * Extract initials from name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  const words = name.trim().split(/\s+/);
  const initials = words.map((word) => word.charAt(0).toUpperCase());
  return initials.slice(0, maxLength).join('');
}

/**
 * Mask sensitive string (e.g., email, phone)
 */
export function maskString(text: string, visibleChars: number = 4): string {
  if (text.length <= visibleChars) return text;
  const masked = '*'.repeat(text.length - visibleChars);
  return masked + text.slice(-visibleChars);
}

/**
 * Check if string contains substring (case-insensitive)
 */
export function containsIgnoreCase(text: string, search: string): boolean {
  return text.toLowerCase().includes(search.toLowerCase());
}

/**
 * Parse comma-separated values
 */
export function parseCSV(csvString: string): string[] {
  return csvString.split(',').map((item) => item.trim()).filter((item) => item.length > 0);
}
