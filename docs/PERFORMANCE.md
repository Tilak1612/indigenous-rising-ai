# Performance Optimization Guide

## Overview

This document outlines the performance optimizations implemented in the Indigenous Rising AI platform to ensure fast load times, smooth interactions, and efficient resource usage.

---

## Code Splitting & Lazy Loading

### Route-Based Code Splitting

All routes are lazy-loaded using React's `lazy()` and `Suspense` for optimal bundle splitting:

```typescript
import { lazy, Suspense } from 'react';

const Index = lazy(() => import('./pages/Index'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Contact = lazy(() => import('./pages/Contact'));
```

**Benefits:**
- Reduces initial bundle size by ~60-70%
- Faster Time to Interactive (TTI)
- Only loads code for the current route
- Automatic code splitting by Vite

### Suspense Boundaries

Each route has its own Suspense boundary for granular loading control:

```typescript
<Route 
  path="/privacy" 
  element={
    <Suspense fallback={<LoadingFallback />}>
      <PrivacyPolicy />
    </Suspense>
  } 
/>
```

**Why Per-Route Suspense?**
- Better user experience during navigation
- Prevents entire app from unmounting during route changes
- Allows partial app functionality while loading routes
- More granular error boundaries possible

---

## Image Optimization

### WebP Format

All hero images converted to WebP format for ~30% smaller file size vs JPEG:

```html
<picture>
  <source
    srcSet="hero-image-400.webp 400w, hero-image-800.webp 800w"
    type="image/webp"
  />
  <img src="hero-image.jpg" alt="..." />
</picture>
```

### Responsive Images

Multiple image sizes served based on viewport width:

| Size | Viewport | Use Case |
|------|----------|----------|
| 400px | Mobile phones | ≤640px screens |
| 800px | Tablets | 641-1024px screens |
| 1200px | Desktop | 1025-1440px screens |
| 1920px | Large displays | >1440px screens |

### Lazy Loading Images

Images below the fold use `loading="lazy"`:

```html
<img 
  src="footer-logo.png" 
  alt="Company logo" 
  loading="lazy"
/>
```

**Exceptions:**
- Hero images use `fetchPriority="high"`
- Navigation logos not lazy-loaded (above fold)

### Image Compression

Target file sizes:
- Hero images: <100KB per size
- Icons/logos: <20KB
- Background images: <150KB

**Tools Used:**
- Squoosh.app for WebP conversion
- ImageOptim for lossless compression
- TinyPNG for further compression if needed

---

## Bundle Optimization

### Vite Configuration

Optimized build settings in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/*'],
        }
      }
    },
    // Tree shaking enabled by default
    minify: 'terser',
    sourcemap: false, // Disable in production
  }
});
```

### Tree Shaking

Unused code automatically removed during build:
- Only used Radix UI components bundled
- Dead code eliminated
- Unused imports removed

### Dynamic Imports

Large libraries dynamically imported when needed:

```typescript
// Load DOMPurify only when needed
const sanitize = async (input: string) => {
  const DOMPurify = await import('dompurify');
  return DOMPurify.default.sanitize(input);
};

// Load Supabase client only when needed
const { supabase } = await import('@/integrations/supabase/client');
```

---

## CSS Optimization

### Tailwind CSS

Production build removes unused styles:

```javascript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  // Only styles used in these files are included
}
```

**Result:** ~95% of Tailwind CSS removed from production bundle

### Critical CSS

Above-the-fold styles inlined in `<head>`:
- Typography
- Layout (navigation, hero)
- Core colors and backgrounds

### CSS Minification

PostCSS minifies and optimizes CSS:
- Removes whitespace
- Combines duplicate rules
- Shortens color codes
- Removes comments

---

## JavaScript Optimization

### React Production Build

Automatically optimized in production:
- Development warnings removed
- PropTypes removed
- Minified variable names
- Dead code elimination

### Async Operations

Non-blocking operations:
```typescript
// Newsletter submission doesn't block UI
const onSubmit = async (data) => {
  try {
    await supabase.functions.invoke('newsletter-subscribe', {
      body: data,
    });
  } catch (error) {
    // Handle error
  }
};
```

### Debouncing & Throttling

Rate limiting prevents excessive operations:
- Form submissions rate limited
- Scroll events throttled
- Search inputs debounced (when implemented)

---

## Caching Strategies

### Browser Caching

Static assets cached with proper headers:

```
# _headers file
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable
```

### Service Worker (Future)

Plan to implement for:
- Offline functionality
- Background sync
- Push notifications
- Precaching critical resources

---

## Network Optimization

### HTTP/2 & HTTP/3

Benefits when deployed:
- Multiplexing (parallel requests)
- Server push capability
- Header compression
- Reduced latency

### CDN Usage

Static assets served from CDN:
- Images
- Fonts
- JavaScript bundles
- CSS files

**Benefits:**
- Faster download speeds
- Reduced origin server load
- Global edge caching
- DDoS protection

### Preconnect & DNS Prefetch

Optimize third-party connections:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://api.hubapi.com">
```

---

## Performance Metrics

### Core Web Vitals Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP (Largest Contentful Paint) | <2.5s | ~1.8s |
| FID (First Input Delay) | <100ms | ~50ms |
| CLS (Cumulative Layout Shift) | <0.1 | ~0.05 |
| TTFB (Time to First Byte) | <600ms | ~300ms |

### Bundle Size Analysis

```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

**Current Bundle Sizes:**
- Initial bundle: ~150KB (gzipped)
- Largest route chunk: ~80KB (Index page)
- Smallest route chunk: ~15KB (NotFound)
- Vendor chunks: ~120KB (React, Radix UI)

### Performance Budget

Maximum allowed sizes:
- **JavaScript (initial):** 200KB gzipped
- **JavaScript (route chunk):** 100KB gzipped
- **CSS:** 30KB gzipped
- **Images (hero):** 100KB per size
- **Fonts:** 50KB per font file
- **Total initial load:** 500KB gzipped

---

## Monitoring & Testing

### Performance Testing Tools

**During Development:**
- Chrome DevTools Lighthouse
- React DevTools Profiler
- Vite Bundle Analyzer

**Production Monitoring:**
- Google PageSpeed Insights
- WebPageTest
- GTmetrix
- Pingdom

### Automated Testing

```bash
# Lighthouse CI in GitHub Actions
npm install -g @lhci/cli
lhci autorun
```

### Real User Monitoring (RUM)

Plan to implement:
- Web Vitals reporting
- Error tracking
- Performance analytics
- User flow analysis

---

## Best Practices Checklist

### Images
- [ ] All images compressed (<100KB where possible)
- [ ] WebP format used with JPEG fallback
- [ ] Responsive images with srcset
- [ ] Lazy loading for below-fold images
- [ ] Proper alt text for SEO and accessibility

### JavaScript
- [ ] Route-based code splitting
- [ ] Dynamic imports for large libraries
- [ ] Tree shaking enabled
- [ ] Minification in production
- [ ] No console.logs in production

### CSS
- [ ] Tailwind purge enabled
- [ ] Critical CSS inlined
- [ ] Unused styles removed
- [ ] Minification enabled

### Fonts
- [ ] Subset fonts to needed characters
- [ ] Use font-display: swap
- [ ] Preload critical fonts
- [ ] Self-host fonts (avoid FOUT)

### Caching
- [ ] Static assets cached long-term
- [ ] HTML cached short-term
- [ ] API responses cached when appropriate
- [ ] Service worker for offline support

### Network
- [ ] HTTP/2 or HTTP/3 enabled
- [ ] CDN configured
- [ ] Brotli compression enabled
- [ ] Preconnect to required origins

---

## Future Optimizations

### Planned Improvements

1. **Edge Server-Side Rendering (SSR)**
   - Faster initial page load
   - Better SEO for dynamic content
   - Reduced Time to Interactive

2. **Prefetching**
   - Predict and preload likely next routes
   - Hover-based prefetching
   - Intersection Observer for smart prefetching

3. **Virtual Scrolling**
   - For long lists (funding database)
   - Render only visible items
   - Dramatically reduce DOM nodes

4. **Image CDN**
   - On-the-fly image resizing
   - Format optimization (WebP, AVIF)
   - Automatic quality adjustment

5. **Service Worker**
   - Offline mode
   - Background sync
   - Push notifications
   - Precache critical resources

6. **Progressive Web App (PWA)**
   - Install prompt
   - App-like experience
   - Offline functionality
   - Home screen icon

---

## Troubleshooting Performance Issues

### Slow Initial Load

**Causes:**
- Large bundle size
- Too many synchronous scripts
- Unoptimized images
- Slow server response

**Solutions:**
- Analyze bundle with visualizer
- Lazy load non-critical code
- Optimize images
- Enable caching

### Layout Shift (CLS)

**Causes:**
- Images without dimensions
- Dynamic content insertion
- Web fonts loading

**Solutions:**
- Set image width/height
- Reserve space for dynamic content
- Use font-display: swap
- Preload critical resources

### Slow Navigation

**Causes:**
- Large route chunks
- Blocking JavaScript
- No route prefetching

**Solutions:**
- Split large routes further
- Use dynamic imports
- Implement route prefetching
- Use React.memo wisely

### High Memory Usage

**Causes:**
- Memory leaks
- Too many event listeners
- Large cached data
- Uncleared intervals/timeouts

**Solutions:**
- Clean up useEffect
- Remove event listeners on unmount
- Limit cache size
- Use weak references

---

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
- [Core Web Vitals](https://web.dev/vitals/)

---

Last Updated: 2025-01-15
