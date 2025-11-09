# Image Optimization Guide

## Overview

This project uses modern image optimization techniques to ensure fast loading times and excellent performance.

## Optimization Strategy

### 1. WebP Format
All images are converted to WebP format, which provides:
- 25-35% better compression than JPEG
- Support for transparency (like PNG)
- Wide browser support (95%+)

### 2. Responsive Images
Images are generated in multiple sizes:
- **400px**: Mobile devices (< 640px)
- **800px**: Tablets (640px - 1024px)
- **1200px**: Small desktops (1024px - 1536px)
- **1920px**: Large desktops and high-DPI displays

### 3. Lazy Loading
Images below the fold use `loading="lazy"` to:
- Reduce initial page load time
- Save bandwidth
- Improve Core Web Vitals (LCP)

### 4. Priority Loading
Critical images (hero, logo) use:
- `fetchPriority="high"` for faster loading
- `loading="eager"` to load immediately
- Placed in the initial viewport

## File Structure

```
public/
├── hero-image-400.webp   # Mobile
├── hero-image-800.webp   # Tablet
├── hero-image-1200.webp  # Desktop
├── hero-image-1920.webp  # Large screens
├── og-home.jpg           # Social media
├── og-privacy.jpg
├── og-terms.jpg
├── og-data-rights.jpg
├── og-contact.jpg
└── og-compliance.jpg
```

## Usage Examples

### Using OptimizedImage Component

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Above the fold (hero image)
<OptimizedImage
  src="/hero-image"
  alt="Descriptive alt text"
  sizes="100vw"
  loading="eager"
  fetchPriority="high"
/>

// Below the fold (lazy loaded)
<OptimizedImage
  src="/feature-image"
  alt="Feature description"
  sizes="(max-width: 768px) 100vw, 50vw"
  loading="lazy"
/>
```

### Manual Responsive Images

```tsx
<picture>
  <source
    srcSet="/image-400.webp 400w, /image-800.webp 800w, /image-1200.webp 1200w"
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    type="image/webp"
  />
  <img
    src="/image-1200.webp"
    alt="Descriptive alt text"
    loading="lazy"
    width="1200"
    height="630"
  />
</picture>
```

## Image Sizes Reference

Use predefined sizes from `src/lib/image-optimization.ts`:

```tsx
import { imageSizes } from '@/lib/image-optimization';

// Hero: 100vw
sizes={imageSizes.hero}

// Half width column: (max-width: 768px) 100vw, 50vw
sizes={imageSizes.halfWidth}

// Third width grid: (max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw
sizes={imageSizes.thirdWidth}
```

## Best Practices

### 1. Alt Text
Always provide descriptive alt text:
- ✅ "Indigenous entrepreneurs collaborating with technology"
- ❌ "image1" or "hero"

### 2. Dimensions
Always specify width and height to prevent layout shift:
```tsx
<img width="1200" height="630" ... />
```

### 3. Loading Strategy
- **Above the fold**: `loading="eager"`, `fetchPriority="high"`
- **Below the fold**: `loading="lazy"`, `fetchPriority="auto"`

### 4. File Sizes
Target file sizes:
- Mobile (400px): < 30KB
- Tablet (800px): < 60KB
- Desktop (1200px): < 100KB
- Large (1920px): < 150KB

## Performance Metrics

### Target Scores
- Lighthouse Performance: > 90
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

### Current Implementation
- ✅ WebP format for all images
- ✅ Responsive srcset with 4 sizes
- ✅ Lazy loading below fold
- ✅ Priority hints for critical images
- ✅ Explicit dimensions to prevent CLS

## Adding New Images

When adding new images:

1. **Generate WebP versions**:
   ```bash
   # Using ImageMagick
   convert original.jpg -quality 85 -resize 400x image-400.webp
   convert original.jpg -quality 85 -resize 800x image-800.webp
   convert original.jpg -quality 85 -resize 1200x image-1200.webp
   convert original.jpg -quality 85 -resize 1920x image-1920.webp
   ```

2. **Place in public folder**:
   ```
   public/
   ├── image-400.webp
   ├── image-800.webp
   ├── image-1200.webp
   └── image-1920.webp
   ```

3. **Use OptimizedImage component**:
   ```tsx
   <OptimizedImage
     src="/image"
     alt="Descriptive alt text"
     sizes={imageSizes.hero}
     loading="lazy"
   />
   ```

## Browser Support

- **WebP**: Chrome 23+, Firefox 65+, Safari 14+, Edge 18+ (95%+ coverage)
- **srcset**: All modern browsers (98%+ coverage)
- **loading="lazy"**: Chrome 77+, Firefox 75+, Safari 15.4+, Edge 79+ (93%+ coverage)
- **fetchpriority**: Chrome 101+, Edge 101+ (limited but gracefully degrades)

## Testing

Test image optimization:

```bash
# Check image sizes
ls -lh public/*.webp

# Test loading performance
npm run build
npm run preview

# Use Lighthouse in Chrome DevTools
# Target: Performance score > 90
```

## Troubleshooting

### Images not loading
- Check file paths are correct
- Verify WebP files exist in public folder
- Check browser console for 404 errors

### Poor performance
- Ensure images are compressed
- Verify lazy loading is working
- Check fetchPriority is set correctly
- Review Network tab in DevTools

### Layout shift
- Always specify width and height
- Use CSS to maintain aspect ratio
- Avoid inserting content above images

## References

- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [WebP Format](https://developers.google.com/speed/webp)
- [Lazy Loading](https://web.dev/browser-level-image-lazy-loading/)
