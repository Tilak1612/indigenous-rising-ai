# Indigenous Rising AI - API Integrations Documentation

## Overview
This document provides a comprehensive list of all APIs and external services integrated with the Indigenous Rising AI platform, including endpoints, authentication methods, and usage details.

---

## 1. SUPABASE APIs

### 1.1 Supabase Core Services
**Provider**: Supabase (PostgreSQL + Realtime)  
**Status**: Production  
**Authentication**: API Key (Anon) + Service Role Key  

#### Database Endpoints:
- **Base URL**: `https://fsqjgexjkjicwlzcgweu.supabase.co`
- **REST API Endpoint**: `/rest/v1/{table-name}`

#### Available Tables:
```
1. profiles
   - User account data
   - Fields: id, email, full_name, created_at, updated_at
   - RLS: Users can view/update own profile

2. user_roles
   - Role-based permissions (admin, team_member, user)
   - Fields: user_id, role, created_at
   - RLS: Only admins can view/manage

3. newsletter_subscriptions
   - Newsletter management and subscription tracking
   - Fields: email, consent, is_active, confirmed_at, unsubscribe_token, confirmation_token
   - RLS: Public can subscribe, admins can manage

4. data_requests
   - PIPEDA data rights requests tracking
   - Fields: id, full_name, email, request_type, description, status, tracking_number, submitted_at, completed_at, assigned_to
   - Request types: access, correction, deletion, portability, consent_withdrawal, objection
   - RLS: Public can submit/track, admins/team can manage

5. contact_submissions
   - Contact form submissions
   - Fields: id, full_name, email, subject, phone, message, status, admin_notes, submitted_at
   - RLS: Public can submit, authenticated users can read/update

6. content_sections
   - CMS content storage
   - Fields: section_key, section_data (JSONB), updated_by, updated_at
   - RLS: Public can read, only admins can modify

7. webhook_events
   - Webhook event tracking from external services
   - Fields: id, service, event_type, stripe_event_id, data, created_at
   - RLS: Protected access
```

### 1.2 Supabase Authentication API
**Endpoint**: `/auth/v1/`

#### Key Operations:
- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/signin` - User login
- `POST /auth/v1/logout` - User logout
- `GET /auth/v1/user` - Get current user
- `POST /auth/v1/refresh` - Token refresh
- `POST /auth/v1/recover` - Password reset

**Authentication Method**: Session-based with JWT tokens

### 1.3 Supabase Storage API
**Endpoint**: `/storage/v1/`

#### Storage Buckets:
```
1. data-request-documents
   - Stores: User-uploaded verification documents
   - Scope: Private (authenticated users only)
   - Usage: Document verification for data requests
   - Path: storage/v1/object/authenticated/data-request-documents/{path}
```

**Upload Endpoint**: `POST /storage/v1/object/{bucket}/{path}`  
**Download Endpoint**: `GET /storage/v1/object/{bucket}/{path}`

---

## 2. SUPABASE EDGE FUNCTIONS (Serverless)

All Edge Functions are Deno-based serverless functions deployed on Supabase.

### 2.1 Submit Contact Function
**Endpoint**: `/functions/v1/submit-contact`  
**Method**: POST  
**Authentication**: Public (no auth required)  
**Rate Limiting**: 3 requests/minute, 10 requests/hour per IP  

#### Request Body:
```json
{
  "full_name": "string (max 100 chars)",
  "email": "string (valid email)",
  "subject": "string (max 200 chars)",
  "phone": "string (optional, max 20 chars)",
  "message": "string (max 2000 chars)"
}
```

#### Response (Success):
```json
{
  "success": true,
  "id": "uuid",
  "message": "Contact form submitted successfully"
}
```

#### Error Responses:
- `400`: Missing required fields
- `429`: Rate limit exceeded
- `500`: Server error

**Database**: Stores in `contact_submissions` table

---

### 2.2 Newsletter Subscribe Function
**Endpoint**: `/functions/v1/newsletter-subscribe`  
**Method**: POST  
**Authentication**: Public (no auth required)  
**Rate Limiting**: 3 requests/minute per email  
**Query Parameters**: `?action=subscribe|confirm|unsubscribe`

#### Subscribe Request:
```json
{
  "email": "string (valid email)",
  "ipAddress": "string (optional, auto-detected if not provided)",
  "userAgent": "string (optional)"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Confirmation email sent. Please check your inbox."
}
```

#### Confirmation Request:
```
POST /functions/v1/newsletter-subscribe?action=confirm
{
  "token": "string (from confirmation email)"
}
```

#### HubSpot Integration:
When a subscription is confirmed, it:
1. Creates/updates contact in HubSpot CRM
2. Sets property: `newsletter_opt_in = true`
3. Sends welcome email via HubSpot transactional email API

**HubSpot API Endpoints Used**:
- `POST https://api.hubapi.com/contacts/v1/contact` - Create/update contact
- `POST https://api.hubapi.com/marketing/v3/transactional/single-email/send` - Send welcome email

**Authentication**: Bearer token (HubSpot API Key)

---

### 2.3 Submit Data Request Function
**Endpoint**: `/functions/v1/submit-data-request`  
**Method**: POST  
**Authentication**: Public (no auth required)  
**Query Parameters**: `?action=submit|track`  
**Rate Limiting**: 2 requests/hour per IP  

#### Submit Request:
```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string (optional)",
  "requestType": "access|correction|deletion|portability|consent_withdrawal|objection",
  "verificationMethod": "email|phone|government_id",
  "details": "string (optional)",
  "ipAddress": "string (optional, auto-detected if not provided)",
  "userAgent": "string (optional)"
}
```

#### Response:
```json
{
  "success": true,
  "trackingNumber": "string (12-character unique ID)",
  "message": "Your data request has been submitted successfully"
}
```

#### Track Request:
```
POST /functions/v1/submit-data-request?action=track
{
  "trackingNumber": "string (12-character code)"
}
```

#### Response:
```json
{
  "id": "uuid",
  "fullName": "string",
  "email": "string",
  "requestType": "string",
  "status": "pending|in_progress|completed|rejected",
  "submittedAt": "ISO-8601 datetime",
  "completedAt": "ISO-8601 datetime (if applicable)",
  "trackingNumber": "string"
}
```

**Database**: Stores in `data_requests` table  
**HubSpot Integration**: Sends request confirmation to HubSpot

---

### 2.4 Create Checkout Function
**Endpoint**: `/functions/v1/create-checkout`  
**Method**: POST  
**Authentication**: Required (Bearer JWT token)  

#### Request Body:
```json
{
  "priceId": "string (Stripe price ID)"
}
```

#### Response:
```json
{
  "sessionId": "string (Stripe session ID)",
  "url": "string (Stripe checkout URL)"
}
```

**Stripe Integration**:
- Uses Stripe SDK for Node/Deno
- Manages checkout sessions
- Links user email to Stripe customer
- Creates subscription records

---

### 2.5 Check Subscription Function
**Endpoint**: `/functions/v1/check-subscription`  
**Method**: GET  
**Authentication**: Required (Bearer JWT token)  

#### Response (Active Subscription):
```json
{
  "hasSubscription": true,
  "customerId": "string",
  "subscriptionId": "string",
  "status": "active|canceled|past_due",
  "currentPeriodEnd": "ISO-8601 datetime"
}
```

#### Response (No Subscription):
```json
{
  "hasSubscription": false,
  "message": "No active subscription found"
}
```

**Stripe Integration**: Queries Stripe API for customer subscriptions

---

### 2.6 Customer Portal Function
**Endpoint**: `/functions/v1/customer-portal`  
**Method**: POST  
**Authentication**: Required (Bearer JWT token)  

#### Request Body:
```json
{
  "returnUrl": "string (URL to return to after portal)"
}
```

#### Response:
```json
{
  "url": "string (Stripe Customer Portal URL)"
}
```

**Stripe Integration**: Creates billing portal session for users to manage subscriptions

---

### 2.7 Stripe Webhook Function
**Endpoint**: `/functions/v1/stripe-webhook`  
**Method**: POST  
**Authentication**: Stripe webhook signature verification  
**Content-Type**: `application/json`  

#### Handled Events:
```
1. checkout.session.completed
   - Creates/updates subscription record in database
   - Links Stripe customer ID to user profile

2. customer.subscription.updated
   - Updates subscription status in database
   - Handles plan changes

3. customer.subscription.deleted
   - Updates subscription status to canceled
   - Marks subscription as inactive

4. invoice.payment_succeeded
   - Logs successful payment events
   - Updates webhook_events table

5. invoice.payment_failed
   - Logs payment failures
   - Stores in webhook_events table
```

**Security**: Webhook signature verification using Stripe secret key

---

### 2.8 Newsletter Unsubscribe Function
**Endpoint**: `/functions/v1/newsletter-unsubscribe`  
**Method**: POST  
**Authentication**: Public (no auth required)  

#### Request Body:
```json
{
  "token": "string (unsubscribe token from email)"
}
```

#### Response:
```json
{
  "success": true,
  "message": "You have been unsubscribed from our newsletter"
}
```

**Database**: Updates `newsletter_subscriptions` table, sets `is_active = false`

---

## 3. STRIPE API

### 3.1 Stripe Payment Processing
**Provider**: Stripe  
**Status**: Production  
**API Version**: 2025-08-27.basil  

#### Base URL
```
https://api.stripe.com/v1/
```

#### Key Endpoints Used:

**Customers**:
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `GET /customers/{customer_id}` - Get customer
- `POST /customers/{customer_id}` - Update customer

**Subscriptions**:
- `POST /subscriptions` - Create subscription
- `GET /subscriptions/{subscription_id}` - Get subscription
- `POST /subscriptions/{subscription_id}` - Update subscription
- `DELETE /subscriptions/{subscription_id}` - Cancel subscription

**Checkout Sessions**:
- `POST /checkout/sessions` - Create checkout session
- `GET /checkout/sessions/{session_id}` - Get session
- `GET /checkout/sessions/{session_id}/line_items` - Get line items

**Invoices**:
- `GET /invoices` - List invoices
- `GET /invoices/{invoice_id}` - Get invoice

**Billing Portal**:
- `POST /billing_portal/sessions` - Create customer portal session

#### Authentication
- **Method**: API Key (Bearer token)
- **Keys Used**:
  - `STRIPE_SECRET_KEY` (server-side, from environment)
  - `STRIPE_PUBLISHABLE_KEY` (client-side, from environment)

#### Webhook Configuration
**Webhook URL**: `https://{backend-url}/functions/v1/stripe-webhook`  
**Events Subscribed**:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

## 4. HUBSPOT API

### 4.1 HubSpot CRM and Marketing
**Provider**: HubSpot  
**Status**: Production (Used for contact and newsletter management)  
**Base URL**: `https://api.hubapi.com`

#### Authentication
- **Method**: Bearer token (API Key)
- **Key**: `HUBSPOT_API_KEY` (from environment)
- **Header**: `Authorization: Bearer {HUBSPOT_API_KEY}`

#### Key Endpoints Used:

**Contacts API**:
- `POST /contacts/v1/contact` - Create/update contact
  ```json
  {
    "properties": [
      { "property": "email", "value": "user@example.com" },
      { "property": "newsletter_opt_in", "value": true }
    ]
  }
  ```

**Transactional Email API**:
- `POST /marketing/v3/transactional/single-email/send` - Send email
  ```json
  {
    "emailId": "template-name",
    "message": {
      "to": "user@example.com",
      "from": "help@indigenousrising.ai"
    }
  }
  ```

#### Email Templates Used:
- `welcome-newsletter` - Welcome email sent upon newsletter subscription confirmation

#### Integration Points:
1. **Newsletter Subscribe**: Creates/updates HubSpot contact with `newsletter_opt_in = true`
2. **Newsletter Confirmation**: Sends welcome email via transactional email API
3. **Contact Form**: Can optionally send submissions to HubSpot (future enhancement)
4. **Data Requests**: Can optionally track in HubSpot (future enhancement)

#### Rate Limiting
- Standard HubSpot rate limits apply
- API tier: Standard

---

## 5. EXTERNAL SERVICE APIs (Informational)

### 5.1 Google APIs (Used via sitemap/robots.txt)
**Services**:
- **Google Search Console**: Submit sitemap and monitor indexing
- **Google Analytics** (optional): Track user behavior
- **Google Maps** (future feature): Could be integrated for location-based services

### 5.2 Schema.org Structured Data
**Type**: Not a direct API, but semantic markup  
**Usage**: JSON-LD structured data for SEO
**Endpoints**:
- Organization schema (for rich snippets)
- WebPage schema (for search results)
- FAQPage schema (for FAQ indexing)
- Service schema (for service offerings)
- SearchAction schema (for site search capability)

---

## 6. INTERNAL API ENDPOINTS

### 6.1 REST API Base
**Base URL**: `https://fsqjgexjkjicwlzcgweu.supabase.co`

#### Authentication
- Public endpoints: Supabase Anon Key in Authorization header
- Protected endpoints: JWT token in Authorization header

#### Rate Limiting (Application Level)
```
Contact Form: 3/minute, 10/hour per IP
Newsletter: 3/minute per email
Data Requests: 2/hour per IP
```

### 6.2 Security Headers on All Responses
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

---

## 7. DATABASE FUNCTIONS (SQL-Level)

### 7.1 Authentication Functions
- `handle_new_user()` - Trigger: Creates profile on signup
- `update_updated_at_column()` - Trigger: Auto-updates timestamps

### 7.2 Security Functions
- `has_role(user_id, role)` - Security definer: Checks user role
- `check_contact_rate_limit(ip_address)` - Rate limiting check

### 7.3 Row-Level Security (RLS) Policies
All tables have RLS enabled with policies for:
- Public read access (for public data)
- Authenticated user access
- Admin-only access
- Self-access (users can only modify their own data)

---

## 8. ENVIRONMENT VARIABLES REFERENCE

### Frontend (.env file)
```bash
VITE_SUPABASE_PROJECT_ID="fsqjgexjkjicwlzcgweu"
VITE_SUPABASE_URL="https://fsqjgexjkjicwlzcgweu.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Backend/Edge Functions (Supabase Secrets)
```bash
SUPABASE_URL="https://fsqjgexjkjicwlzcgweu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
SUPABASE_ANON_KEY="<anon-key>"
STRIPE_SECRET_KEY="<stripe-secret-key>"
STRIPE_PUBLISHABLE_KEY="<stripe-publishable-key>"
HUBSPOT_API_KEY="<hubspot-api-key>"
```

---

## 9. API USAGE EXAMPLES

### Example 1: Create Checkout Session (Frontend)
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase.functions.invoke('create-checkout', {
  body: {
    priceId: 'price_xxxxx'
  }
});

if (error) {
  console.error('Checkout error:', error);
} else {
  window.location.href = data.url; // Redirect to Stripe
}
```

### Example 2: Submit Contact Form (Frontend)
```typescript
const response = await fetch('https://fsqjgexjkjicwlzcgweu.supabase.co/functions/v1/submit-contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    full_name: 'John Doe',
    email: 'john@example.com',
    subject: 'Support Request',
    message: 'I need help with...'
  })
});

const result = await response.json();
```

### Example 3: Track Data Request (Frontend)
```typescript
const { data, error } = await supabase.functions.invoke('submit-data-request', {
  body: { trackingNumber: 'ABC123XYZ789' },
  method: 'POST'
});
```

### Example 4: Check User Subscription (Backend/Admin)
```typescript
const { data, error } = await supabase.functions.invoke('check-subscription', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
```

---

## 10. CORS & SECURITY CONFIGURATION

### CORS Headers Applied to All Edge Functions
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Security Headers Applied to All Responses
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

### Input Validation
- All inputs validated on client-side with Zod schemas
- All inputs re-validated on server-side
- DOMPurify used to sanitize HTML inputs
- Maximum length enforcement on all text fields

---

## 11. API VERSIONING & DEPRECATION

### Current Versions
- Stripe API: v1 (2025-08-27.basil)
- HubSpot API: v1 and v3 (mixed versions)
- Supabase: v1 (latest)

### Deprecation Policy
- No deprecated APIs currently in use
- Will maintain backward compatibility for 6 months before deprecation
- Breaking changes require database migration with rollback plan

---

## 12. MONITORING & ALERTING

### Endpoints to Monitor
1. `/functions/v1/submit-contact` - Form submissions
2. `/functions/v1/submit-data-request` - Data rights requests
3. `/functions/v1/newsletter-subscribe` - Newsletter signups
4. `/functions/v1/stripe-webhook` - Payment processing
5. `/functions/v1/create-checkout` - Checkout sessions

### Error Tracking
- Implemented via: Sentry.io (recommended)
- Logs: Server-side logging in Edge Functions
- Alerts: Email notifications for critical errors

### Rate Limit Monitoring
- Contact form: Track IP addresses exceeding limits
- Newsletter: Monitor email-based throttling
- Data requests: Alert on repeated requests from same IP

---

## 13. FUTURE API INTEGRATIONS

### Planned Integrations
1. **Twilio SMS API** - Two-factor authentication
2. **SendGrid** - Transactional emails
3. **Slack API** - Admin notifications
4. **Google Analytics 4** - Enhanced analytics
5. **Auth0** - Alternative authentication provider

### Considered Integrations
1. **AWS S3** - Enhanced file storage
2. **Cloudflare Workers** - Edge computing
3. **DataBox** - Analytics dashboard
4. **Zapier** - Workflow automation

---

## 14. API TESTING

### Test Files
- `tests/test_backend_endpoints.py` - Python test suite
- `tests/test_create_checkout.py` - Stripe integration tests
- `tests/test_stripe_webhook.py` - Webhook handling tests
- `tests/test_submit_contact.py` - Contact form tests
- `tests/test_newsletter_subscribe.py` - Newsletter tests
- `tests/test_subscription_check.py` - Subscription status tests
- `tests/test_backend_api_complete.py` - Comprehensive test suite

### Running Tests
```bash
# Run all Python tests
python -m pytest tests/

# Run specific test
python tests/test_backend_endpoints.py

# Run frontend tests
npm test
```

---

## 15. TROUBLESHOOTING & COMMON ISSUES

### Issue: CORS Error on Form Submission
**Solution**: Ensure CORS headers are correctly set on Edge Function responses

### Issue: Stripe Webhook Not Firing
**Cause**: Webhook URL not configured in Stripe Dashboard  
**Solution**: 
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://{backend-url}/functions/v1/stripe-webhook`
3. Select required events: `checkout.session.completed`, etc.

### Issue: HubSpot Contact Not Created
**Cause**: Missing or invalid HUBSPOT_API_KEY  
**Solution**: Verify API key in Supabase Edge Function secrets

### Issue: Rate Limit Blocking Legitimate Traffic
**Solution**: Adjust rate limit thresholds in Edge Function code

### Issue: Newsletter Confirmation Email Not Sent
**Cause**: Invalid HubSpot template ID  
**Solution**: 
1. Create email template in HubSpot
2. Get template ID
3. Update `welcome-newsletter` template reference in code

---

## 16. SUPPORT & DOCUMENTATION LINKS

### Official Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [HubSpot API Docs](https://developers.hubspot.com/docs/api/overview)
- [Deno Runtime](https://deno.land/manual)

### Project Documentation
- `ADMIN_SETUP.md` - Admin access setup
- `COMPLIANCE_GUIDE.md` - PIPEDA compliance
- `SECURITY_HEADERS.md` - Security configuration
- `PRODUCTION_CHECKLIST.md` - Pre-launch verification

---

## 17. CONTACT & SUPPORT

### Development Support
- **Project Platform Team**: For Supabase/deployment issues
- **Stripe Support**: For payment processing issues
- **HubSpot Support**: For CRM/email issues

### Internal Team
- Lead Developer: [Contact info]
- Backend Specialist: [Contact info]
- DevOps: [Contact info]

---

**Last Updated**: February 3, 2026  
**Document Version**: 1.0  
**Status**: Production

For updates or corrections, please submit a pull request or contact the development team.
