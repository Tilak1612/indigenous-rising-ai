import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeInput, sanitizeEmail, sanitizePhone } from './sanitize';

describe('sanitizeHtml', () => {
  it('should remove all HTML tags', () => {
    const dirty = '<script>alert("xss")</script>Hello';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('Hello');
  });

  it('should remove dangerous attributes', () => {
    const dirty = '<div onclick="alert(1)">Click me</div>';
    const clean = sanitizeHtml(dirty);
    expect(clean).toBe('Click me');
  });
});

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello');
  });

  it('should remove angle brackets', () => {
    expect(sanitizeInput('hello<script>world</script>')).toBe('helloscriptworld/script');
  });

  it('should limit length', () => {
    const longString = 'a'.repeat(2000);
    const result = sanitizeInput(longString, 100);
    expect(result.length).toBe(100);
  });
});

describe('sanitizeEmail', () => {
  it('should lowercase email', () => {
    expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });

  it('should remove invalid characters', () => {
    expect(sanitizeEmail('test<>@example.com')).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
  });
});

describe('sanitizePhone', () => {
  it('should keep valid phone characters', () => {
    expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
  });

  it('should remove invalid characters', () => {
    expect(sanitizePhone('555-1234 ext.99')).toBe('555-1234 99');
  });
});