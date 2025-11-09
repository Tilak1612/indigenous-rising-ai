import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all HTML tags and attributes
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

/**
 * Sanitize user input by removing dangerous characters
 * and limiting length
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .slice(0, maxLength);
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9@._+-]/g, ''); // Only allow valid email characters
}

/**
 * Sanitize phone numbers (keep only digits, spaces, and common separators)
 */
export function sanitizePhone(phone: string): string {
  return phone
    .trim()
    .replace(/[^0-9\s\-\+\(\)]/g, '');
}