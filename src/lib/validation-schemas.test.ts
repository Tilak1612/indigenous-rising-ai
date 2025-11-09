import { describe, it, expect } from 'vitest';
import {
  newsletterSchema,
  dataRequestSchema,
  contactSchema,
  type NewsletterFormData,
  type DataRequestFormData,
  type ContactFormData,
} from './validation-schemas';

describe('Newsletter Schema', () => {
  it('validates correct email and consent', () => {
    const validData: NewsletterFormData = {
      email: 'test@example.com',
      consent: true,
    };
    
    const result = newsletterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'not-an-email',
      consent: true,
    };
    
    const result = newsletterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('valid email');
    }
  });

  it('rejects emails with plus-addressing', () => {
    const invalidData = {
      email: 'test+alias@example.com',
      consent: true,
    };
    
    const result = newsletterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Plus-addressing');
    }
  });

  it('requires consent to be true', () => {
    const invalidData = {
      email: 'test@example.com',
      consent: false,
    };
    
    const result = newsletterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('consent');
    }
  });

  it('rejects emails shorter than 5 characters', () => {
    const invalidData = {
      email: 'a@b',
      consent: true,
    };
    
    const result = newsletterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects emails longer than 100 characters', () => {
    const invalidData = {
      email: 'a'.repeat(95) + '@example.com',
      consent: true,
    };
    
    const result = newsletterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('Data Request Schema', () => {
  const validData: DataRequestFormData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    requestType: 'access',
    details: 'I would like to access all my personal data.',
    phone: '+1 555-1234',
  };

  it('validates complete valid data', () => {
    const result = dataRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects names shorter than 2 characters', () => {
    const invalidData = { ...validData, fullName: 'A' };
    const result = dataRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('at least 2 characters');
    }
  });

  it('rejects names with invalid characters', () => {
    const invalidData = { ...validData, fullName: 'John123' };
    const result = dataRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('invalid characters');
    }
  });

  it('accepts names with hyphens and apostrophes', () => {
    const validName = { ...validData, fullName: "Mary O'Connor-Smith" };
    const result = dataRequestSchema.safeParse(validName);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidData = { ...validData, email: 'not-an-email' };
    const result = dataRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates all request types', () => {
    const requestTypes = ['access', 'correction', 'deletion', 'portability', 'withdraw-consent'];
    
    requestTypes.forEach(type => {
      const data = { ...validData, requestType: type as any };
      const result = dataRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('rejects invalid request type', () => {
    const invalidData = { ...validData, requestType: 'invalid' as any };
    const result = dataRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('requires details with minimum length', () => {
    const invalidData = { ...validData, details: 'Too short' };
    const result = dataRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('more details');
    }
  });

  it('rejects details longer than 2000 characters', () => {
    const invalidData = { ...validData, details: 'a'.repeat(2001) };
    const result = dataRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('allows optional phone number', () => {
    const { phone, ...dataWithoutPhone } = validData;
    const result = dataRequestSchema.safeParse(dataWithoutPhone);
    expect(result.success).toBe(true);
  });
});

describe('Contact Schema', () => {
  const validData: ContactFormData = {
    full_name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Inquiry about services',
    phone: '+1 555-1234',
    message: 'I would like to know more about your platform and services.',
  };

  it('validates complete valid contact data', () => {
    const result = contactSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects names shorter than 2 characters', () => {
    const invalidData = { ...validData, full_name: 'A' };
    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects names longer than 100 characters', () => {
    const invalidData = { ...validData, full_name: 'a'.repeat(101) };
    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects names with invalid characters', () => {
    const invalidData = { ...validData, full_name: 'Jane123' };
    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates email format', () => {
    const invalidData = { ...validData, email: 'invalid' };
    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects emails longer than 255 characters', () => {
    const invalidData = { ...validData, email: 'a'.repeat(250) + '@example.com' };
    const result = contactSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates subject length constraints', () => {
    const tooShort = { ...validData, subject: 'Hi' };
    const tooLong = { ...validData, subject: 'a'.repeat(201) };
    
    expect(contactSchema.safeParse(tooShort).success).toBe(false);
    expect(contactSchema.safeParse(tooLong).success).toBe(false);
  });

  it('validates message length constraints', () => {
    const tooShort = { ...validData, message: 'Hi there' };
    const tooLong = { ...validData, message: 'a'.repeat(2001) };
    
    const shortResult = contactSchema.safeParse(tooShort);
    const longResult = contactSchema.safeParse(tooLong);
    
    expect(shortResult.success).toBe(false);
    expect(longResult.success).toBe(false);
  });

  it('allows optional phone number', () => {
    const { phone, ...dataWithoutPhone } = validData;
    const result = contactSchema.safeParse(dataWithoutPhone);
    expect(result.success).toBe(true);
  });

  it('accepts valid international phone formats', () => {
    const phoneFormats = [
      '+1 555-1234',
      '+44 20 1234 5678',
      '(555) 123-4567',
      '555-123-4567',
    ];
    
    phoneFormats.forEach(phone => {
      const data = { ...validData, phone };
      const result = contactSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  it('provides meaningful error messages', () => {
    const emptyData = {
      full_name: '',
      email: '',
      subject: '',
      message: '',
    };
    
    const result = contactSchema.safeParse(emptyData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errors = result.error.issues;
      expect(errors.length).toBeGreaterThan(0);
      errors.forEach(error => {
        expect(error.message).toBeTruthy();
      });
    }
  });
});
