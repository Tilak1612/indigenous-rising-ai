# Security Headers Configuration

## Overview

This document outlines the security headers that should be configured for production deployment to protect against common web vulnerabilities.

---

## Required Headers

### 1. Content-Security-Policy (CSP)

Prevents XSS attacks by controlling which resources can be loaded.

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.hubapi.com;
```

**Breakdown:**
- `default-src 'self'` - Only load resources from same origin by default
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Allow scripts from same origin, inline scripts (React needs this), and eval (needed by some libraries)
- `style-src 'self' 'unsafe-inline'` - Allow styles from same origin and inline styles (Tailwind needs this)
- `img-src 'self' data: https:` - Allow images from same origin, data URIs, and any HTTPS source
- `font-src 'self' data:` - Allow fonts from same origin and data URIs
- `connect-src 'self' https://*.supabase.co https://api.hubapi.com` - Allow API calls to same origin, Supabase, and HubSpot

**⚠️ Note:** `'unsafe-inline'` and `'unsafe-eval'` reduce CSP effectiveness but are required for React + Vite. Consider using nonces or hashes in the future.

### 2. X-Frame-Options

Prevents clickjacking attacks by controlling if the site can be embedded in iframes.

```
X-Frame-Options: DENY
```

**Options:**
- `DENY` - Cannot be embedded in any iframe (recommended)
- `SAMEORIGIN` - Can only be embedded by same origin
- `ALLOW-FROM https://example.com` - Can be embedded by specific origin (deprecated)

### 3. X-Content-Type-Options

Prevents MIME-sniffing attacks.

```
X-Content-Type-Options: nosniff
```

Forces browsers to respect the declared Content-Type header instead of trying to guess.

### 4. Referrer-Policy

Controls how much referrer information is sent with requests.

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Options:**
- `no-referrer` - Never send referrer
- `strict-origin-when-cross-origin` - Send full URL for same-origin, origin only for cross-origin HTTPS, nothing for HTTP
- `same-origin` - Only send referrer for same-origin requests

### 5. Permissions-Policy

Controls which browser features can be used.

```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

Disables geolocation, microphone, and camera access (not needed for this app).

**Syntax:**
- `feature=()` - Disabled for all origins
- `feature=(self)` - Enabled for same origin only
- `feature=(self "https://example.com")` - Enabled for specific origins

### 6. Strict-Transport-Security (HSTS)

Forces HTTPS connections (configure after HTTPS is set up).

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**⚠️ Important:** Only enable after confirming HTTPS works correctly!

**Parameters:**
- `max-age=31536000` - Force HTTPS for 1 year
- `includeSubDomains` - Apply to all subdomains
- `preload` - Submit to HSTS preload list

---

## Deployment Configuration

### Lovable Hosting

If deploying through Lovable, contact support to configure custom headers.

### Vercel

Create `vercel.json` in project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.hubapi.com;"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        }
      ]
    }
  ]
}
```

### Netlify

Create `netlify.toml` in project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.hubapi.com;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

### Cloudflare Pages

Create `_headers` file in `public/` directory:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.hubapi.com;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Nginx

Add to nginx configuration:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.hubapi.com;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Apache

Add to `.htaccess` or Apache configuration:

```apache
<IfModule mod_headers.c>
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://api.hubapi.com;"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>
```

---

## Testing Headers

### Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on the main document request
5. Check Response Headers

### Online Tools

- **SecurityHeaders.com**: https://securityheaders.com/
- **Mozilla Observatory**: https://observatory.mozilla.org/

### Command Line

```bash
curl -I https://indigenousrising.ai | grep -i "content-security-policy\|x-frame-options\|x-content-type-options\|referrer-policy\|permissions-policy"
```

---

## Edge Function Headers

Headers are already configured in all Edge Functions:

- `newsletter-subscribe/index.ts`
- `submit-contact/index.ts`
- `submit-data-request/index.ts`

All include CORS headers:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## Header Priorities

Security headers should be configured in this order:

1. **CDN/Hosting Platform** (Cloudflare, Vercel, Netlify) - Highest priority
2. **Web Server** (Nginx, Apache) - Medium priority
3. **Application Code** (Express, Edge Functions) - Lowest priority

**Best Practice:** Configure at CDN/hosting level for all static assets and HTML, then supplement with Edge Function headers for API responses.

---

## Common Issues

### 1. CSP Blocking Resources

**Symptom:** Images, scripts, or styles not loading

**Solution:** 
- Check browser console for CSP violations
- Add the blocked domain to the appropriate CSP directive
- Use `report-uri` to monitor violations without blocking:
  ```
  Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-violation-report
  ```

### 2. Inline Styles Blocked

**Symptom:** Tailwind styles not applying

**Solution:** 
- Keep `'unsafe-inline'` in `style-src`
- Or use CSS extraction in production build

### 3. Third-party Scripts Blocked

**Symptom:** Analytics, HubSpot forms not working

**Solution:**
- Add domains to `script-src`: `script-src 'self' 'unsafe-inline' https://js.hs-scripts.com`
- Add to `connect-src` for API calls

### 4. X-Frame-Options vs frame-ancestors

**Note:** `X-Frame-Options` is legacy. CSP's `frame-ancestors` directive is preferred:
```
Content-Security-Policy: frame-ancestors 'none';
```

However, keep `X-Frame-Options: DENY` for older browser compatibility.

---

## Gradual Rollout Strategy

### Phase 1: Report-Only Mode
```
Content-Security-Policy-Report-Only: [your policy]
```
Monitor violations without blocking anything.

### Phase 2: Permissive Policy
Start with permissive policy, gradually tighten:
```
script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
```

### Phase 3: Strict Policy
Remove `'unsafe-inline'` and `'unsafe-eval'`, use nonces:
```
script-src 'self' 'nonce-{random}';
```

### Phase 4: Monitoring & Refinement
- Set up CSP violation reporting endpoint
- Analyze violations and adjust policy
- Remove unnecessary allowances

---

## Security Checklist

Before going to production:

- [ ] All headers configured at CDN/hosting level
- [ ] CSP policy tested and not blocking legitimate resources
- [ ] HTTPS enforced (HSTS enabled after confirmation)
- [ ] Headers verified using SecurityHeaders.com
- [ ] No security warnings in browser console
- [ ] Third-party integrations (HubSpot, analytics) working
- [ ] Forms submitting successfully
- [ ] Images and fonts loading correctly
- [ ] CSP violation reporting configured (optional)

---

## Additional Security Measures

Beyond headers, also implement:

1. **Input Validation** - ✅ Already implemented with Zod schemas
2. **Rate Limiting** - ✅ Already implemented (client + server)
3. **XSS Prevention** - ✅ DOMPurify installed
4. **CSRF Protection** - Consider adding for authenticated endpoints
5. **SQL Injection Prevention** - ✅ Using Supabase client (parameterized queries)
6. **Secure Cookies** - Set `Secure`, `HttpOnly`, `SameSite=Strict` flags
7. **HTTPS Only** - Enforce at CDN/hosting level

---

## Resources

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)

---

Last Updated: 2025-01-15
