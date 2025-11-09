import { z } from 'zod';

// Newsletter form validation
export const newsletterSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(5, "Email is too short")
    .max(100, "Email is too long")
    .refine((email) => !email.includes('+'), {
      message: "Plus-addressing is not allowed for newsletters"
    }),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to receive emails"
  })
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// Data request form validation
export const dataRequestSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s-']+$/, "Name contains invalid characters"),
  email: z.string().email("Please enter a valid email"),
  requestType: z.enum(['access', 'correction', 'deletion', 'portability', 'withdraw-consent']),
  details: z
    .string()
    .min(10, "Please provide more details")
    .max(2000, "Description is too long"),
  phone: z.string().optional(),
});

export type DataRequestFormData = z.infer<typeof dataRequestSchema>;

// Contact form validation
export const contactSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s-']+$/, "Name contains invalid characters"),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject is too long'),
  phone: z.string().optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message is too long'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
