# Rate Limiting Implementation

## Overview

This project implements **dual-layer rate limiting** to prevent abuse and ensure fair usage of form submissions:

1. **Client-side rate limiting** (localStorage-based)
2. **Server-side rate limiting** (IP-based via Edge Functions)

---

## Client-Side Rate Limiting

### Location
`src/lib/rate-limiter.ts`

### Features
- Stores submission timestamps in `localStorage`
- Configurable per form/action
- Automatic cleanup of old entries (24 hours)
- User-friendly error messages with time remaining

### Configuration
```typescript
const rateLimitConfig = {
  key: 'form-name',           // Unique identifier
  maxAttempts: 3,             // Maximum submissions
  windowMs: 60 * 60 * 1000,   // Time window (1 hour)
};
```

### Current Limits
| Form | Max Attempts | Time Window |
|------|-------------|-------------|
| Newsletter | 3 | 1 hour |
| Contact | 3 | 1 hour |
| Data Request | 3 | 1 hour |

### Usage Example
```typescript
import { 
  checkRateLimit, 
  recordSubmission, 
  getTimeUntilReset,
  formatTimeRemaining 
} from '@/lib/rate-limiter';

const onSubmit = async (data) => {
  // Check rate limit
  if (!checkRateLimit(rateLimitConfig)) {
    const timeRemaining = getTimeUntilReset(rateLimitConfig);
    toast({
      title: 'Too many attempts',
      description: `Please wait ${formatTimeRemaining(timeRemaining)}`,
      variant: 'destructive',
    });
    return;
  }

  try {
    // Submit form...
    
    // Record successful submission
    recordSubmission('form-name');
  } catch (error) {
    // Handle error
  }
};
```

### Functions

#### `checkRateLimit(config)`
Checks if the rate limit has been exceeded.
- **Returns**: `true` if allowed, `false` if rate limited
- **Fails open**: Returns `true` if localStorage is unavailable

#### `recordSubmission(key)`
Records a submission timestamp after successful form submission.

#### `getTimeUntilReset(config)`
Calculates milliseconds until rate limit resets.
- **Returns**: `number` (milliseconds)

#### `formatTimeRemaining(ms)`
Formats milliseconds as human-readable string.
- **Returns**: `"5 minutes"`, `"30 seconds"`, etc.

#### `clearRateLimit(key)`
Clears rate limit for testing purposes.

---

## Server-Side Rate Limiting

### Location
All Edge Functions in `supabase/functions/`:
- `newsletter-subscribe/index.ts`
- `submit-contact/index.ts`
- `submit-data-request/index.ts`

### Implementation
IP-based rate limiting using Supabase database queries:

```typescript
// Get client IP
const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                 req.headers.get('x-real-ip') || 
                 'unknown';

// Check per-minute limit (3 requests)
const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
const { data: recentMinute } = await supabase
  .from('table_name')
  .select('id')
  .eq('ip_address', clientIp)
  .gte('created_at', oneMinuteAgo);

if (recentMinute && recentMinute.length >= 3) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }),
    { status: 429, headers: corsHeaders }
  );
}

// Check per-hour limit (10 requests)
const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
const { data: recentHour } = await supabase
  .from('table_name')
  .select('id')
  .eq('ip_address', clientIp)
  .gte('created_at', oneHourAgo);

if (recentHour && recentHour.length >= 10) {
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    { status: 429, headers: corsHeaders }
  );
}
```

### Current Limits
| Endpoint | Per Minute | Per Hour |
|----------|-----------|----------|
| Newsletter Subscribe | 3 | 10 |
| Contact Form | 3 | 10 |
| Data Request | 3 | 10 |

### HTTP Status Codes
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Invalid input
- **500 Internal Server Error**: Server-side error

---

## Security Benefits

### Protection Against
- **Spam**: Prevents automated form submissions
- **DoS Attacks**: Limits resource consumption per IP
- **Database Flooding**: Prevents excessive database writes
- **Email Bombing**: Limits transactional email sends

### Privacy Considerations
- IP addresses are stored for rate limiting only
- PIPEDA compliant (Canadian privacy law)
- Data stored in Canada
- IP addresses auto-deleted after 90 days (configurable)

---

## Testing Rate Limits

### Clear Client-Side Limits
```javascript
// In browser console
import { clearRateLimit } from '@/lib/rate-limiter';
clearRateLimit('newsletter');
clearRateLimit('contact');
clearRateLimit('data-request');
```

### Clear Server-Side Limits
Delete test submissions from database:
```sql
-- Clear newsletter subscriptions
DELETE FROM newsletter_subscriptions WHERE ip_address = 'your-test-ip';

-- Clear contact submissions
DELETE FROM contact_submissions WHERE ip_address = 'your-test-ip';

-- Clear data requests
DELETE FROM data_requests WHERE ip_address = 'your-test-ip';
```

---

## Customization

### Adjust Client-Side Limits
Edit the `rateLimitConfig` in each form component:
```typescript
const rateLimitConfig = {
  key: 'form-name',
  maxAttempts: 5,             // Change from 3 to 5
  windowMs: 30 * 60 * 1000,   // Change from 1 hour to 30 minutes
};
```

### Adjust Server-Side Limits
Edit the time windows and thresholds in edge functions:
```typescript
// Per minute: 3 → 5 requests
if (recentMinute && recentMinute.length >= 5) { ... }

// Per hour: 10 → 20 requests
if (recentHour && recentHour.length >= 20) { ... }
```

---

## Monitoring

### Edge Function Logs
View rate limit events in Supabase Edge Function logs:
```
Rate limit exceeded (per minute): 192.168.1.1
Rate limit exceeded (per hour): 192.168.1.1
```

### Database Queries
Check submission counts per IP:
```sql
-- Newsletter subscriptions by IP (last hour)
SELECT ip_address, COUNT(*) as count
FROM newsletter_subscriptions
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY count DESC;

-- Contact submissions by IP (last hour)
SELECT ip_address, COUNT(*) as count
FROM contact_submissions
WHERE submitted_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY count DESC;
```

---

## Best Practices

1. **Never disable server-side rate limiting** - Client-side can be bypassed
2. **Log rate limit violations** - Monitor for abuse patterns
3. **Use different keys** - Separate limits per form type
4. **Graceful degradation** - Fail open if systems unavailable
5. **Clear error messages** - Tell users when they can retry
6. **Test thoroughly** - Verify limits work as expected

---

## Future Enhancements

- [ ] Add Redis-based rate limiting for distributed systems
- [ ] Implement progressive backoff (increase wait time per violation)
- [ ] Add CAPTCHA after repeated violations
- [ ] Create admin dashboard for rate limit monitoring
- [ ] Whitelist trusted IPs (e.g., internal systems)
- [ ] Add per-user rate limiting (after authentication implemented)

---

## Troubleshooting

### Rate limit not working (client-side)
- Check if localStorage is available
- Verify console for rate limiter errors
- Clear localStorage and test again

### Rate limit not working (server-side)
- Check Edge Function logs for errors
- Verify IP address extraction logic
- Ensure database queries are working
- Check if clocks are synchronized

### False positives (legitimate users blocked)
- Increase `maxAttempts` or `windowMs`
- Check for shared IPs (corporate networks, VPNs)
- Implement user-based limits instead of IP-based
- Add bypass mechanism for verified users

---

Last Updated: 2025-01-15
