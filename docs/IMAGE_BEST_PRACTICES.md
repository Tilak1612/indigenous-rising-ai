# Image Optimization Best Practices

## Overview

Proper image optimization is crucial for performance, SEO, and user experience. This guide outlines best practices for handling images in the Indigenous Rising AI platform.

---

## Image Attributes Checklist

### Required Attributes

Every `<img>` tag must include:

```html
<img 
  src="image.jpg"
  alt="Descriptive alt text"
  width="800"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

### Attribute Breakdown

#### 1. `src` (Required)
Path to the image file.

```html
<img src="/images/hero-image.webp" />
```

#### 2. `alt` (Required)
Descriptive alt text for accessibility and SEO.

**❌ Bad:**
```html
<img alt="image" />
<img alt="" />  <!-- Only acceptable for purely decorative images -->
```

**✅ Good:**
```html
<img alt="Indigenous entrepreneur reviewing business plan with AI assistant" />
```

**Guidelines:**
- Describe what the image shows, not what it is
- Include relevant context and keywords naturally
- Keep under 125 characters for screen readers
- Don't start with "Image of..." or "Picture of..."

#### 3. `width` and `height` (Recommended)
Prevent layout shift by specifying dimensions.

```html
<img 
  src="hero.jpg" 
  width="1200" 
  height="600"
/>
```

**Why?**
- Prevents Cumulative Layout Shift (CLS)
- Browser reserves space before image loads
- Improves Core Web Vitals score

#### 4. `loading` (Recommended)
Controls when images load.

**Options:**
- `loading="lazy"` - Load when near viewport (default for below-fold)
- `loading="eager"` - Load immediately (for above-fold images)

```html
<!-- Above the fold (hero images) -->
<img src="hero.jpg" loading="eager" fetchpriority="high" />

<!-- Below the fold (footer, testimonials) -->
<img src="footer-logo.png" loading="lazy" />
```

**When to use lazy loading:**
- ✅ Footer images
- ✅ Testimonial avatars
- ✅ Gallery images
- ✅ Product thumbnails below fold
- ❌ Hero images
- ❌ Navigation logos
- ❌ Above-the-fold content

#### 5. `decoding` (Recommended)
Controls how browser decodes the image.

**Options:**
- `decoding="async"` - Decode asynchronously (recommended)
- `decoding="sync"` - Decode synchronously (blocking)
- `decoding="auto"` - Let browser decide

```html
<img 
  src="large-image.jpg"
  decoding="async"
  loading="lazy"
/>
```

**Benefits:**
- Prevents blocking the main thread
- Improves perceived performance
- Better for large images

#### 6. `fetchpriority` (Optional)
Hints to browser about resource priority.

**Options:**
- `fetchpriority="high"` - Prioritize this resource
- `fetchpriority="low"` - Deprioritize this resource
- `fetchpriority="auto"` - Let browser decide

```html
<!-- Hero image - load ASAP -->
<img 
  src="hero.jpg" 
  fetchpriority="high"
  loading="eager"
/>

<!-- Footer logo - low priority -->
<img 
  src="footer-logo.png"
  fetchpriority="low"
  loading="lazy"
/>
```

---

## Responsive Images

### Using `<picture>` Element

Best for art direction or format switching:

```html
<picture>
  <!-- Modern browsers: WebP -->
  <source
    srcSet="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    type="image/webp"
  />
  
  <!-- Fallback: JPEG -->
  <source
    srcSet="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    type="image/jpeg"
  />
  
  <!-- Ultimate fallback -->
  <img
    src="hero-800.jpg"
    alt="Indigenous entrepreneurs collaborating on business strategy"
    width="1200"
    height="600"
    loading="eager"
    decoding="async"
    fetchpriority="high"
  />
</picture>
```

### Using `srcset` Attribute

Best for resolution switching:

```html
<img
  src="image-800.webp"
  srcSet="
    image-400.webp 400w,
    image-800.webp 800w,
    image-1200.webp 1200w,
    image-1920.webp 1920w
  "
  sizes="
    (max-width: 640px) 400px,
    (max-width: 1024px) 800px,
    (max-width: 1440px) 1200px,
    1920px
  "
  alt="Description"
  width="1200"
  height="600"
  loading="lazy"
  decoding="async"
/>
```

**`sizes` Attribute Explained:**

Tells browser which image to load based on viewport:

```html
sizes="
  (max-width: 640px) 400px,   /* Mobile: load 400px image */
  (max-width: 1024px) 800px,  /* Tablet: load 800px image */
  (max-width: 1440px) 1200px, /* Desktop: load 1200px image */
  1920px                       /* Large screens: load 1920px image */
"
```

---

## Image Formats

### Format Comparison

| Format | Use Case | Pros | Cons |
|--------|----------|------|------|
| **WebP** | Modern web | 30% smaller than JPEG, supports transparency | Not supported in very old browsers |
| **AVIF** | Next-gen | 50% smaller than JPEG, better quality | Limited browser support |
| **JPEG** | Photos | Universal support, good compression | No transparency |
| **PNG** | Graphics with transparency | Lossless, transparency | Larger file size |
| **SVG** | Icons, logos | Scalable, tiny file size | Not suitable for photos |

### Recommended Strategy

```html
<picture>
  <!-- Try AVIF first (best compression) -->
  <source srcSet="image.avif" type="image/avif" />
  
  <!-- Fall back to WebP (good compression + support) -->
  <source srcSet="image.webp" type="image/webp" />
  
  <!-- Final fallback to JPEG (universal support) -->
  <img src="image.jpg" alt="Description" />
</picture>
```

---

## Image Optimization Workflow

### 1. Choose Right Format

```
Photos → WebP (with JPEG fallback)
Logos/Icons → SVG or PNG
Illustrations → WebP or PNG
```

### 2. Resize Images

Create multiple sizes for responsive images:

```bash
# Using ImageMagick
magick hero.jpg -resize 400x hero-400.jpg
magick hero.jpg -resize 800x hero-800.jpg
magick hero.jpg -resize 1200x hero-1200.jpg
magick hero.jpg -resize 1920x hero-1920.jpg
```

### 3. Convert to WebP

```bash
# Using cwebp
cwebp -q 85 hero-400.jpg -o hero-400.webp
cwebp -q 85 hero-800.jpg -o hero-800.webp
cwebp -q 85 hero-1200.jpg -o hero-1200.webp
cwebp -q 85 hero-1920.jpg -o hero-1920.webp
```

### 4. Compress Images

**Tools:**
- **TinyPNG/TinyJPG** - Excellent lossy compression
- **Squoosh** - Google's image compression tool
- **ImageOptim** (Mac) - Lossless optimization
- **SVGOMG** - SVG optimization

**Target Sizes:**
- Hero images: <100KB per size
- Thumbnails: <30KB
- Icons: <10KB
- Logos: <20KB

### 5. Validate

Check compressed images:
- Visual quality acceptable?
- File size targets met?
- Proper dimensions?
- Correct format?

---

## File Organization

### Directory Structure

```
public/
├── images/
│   ├── hero/
│   │   ├── hero-400.webp
│   │   ├── hero-800.webp
│   │   ├── hero-1200.webp
│   │   └── hero-1920.webp
│   ├── logos/
│   │   ├── logo-full.png
│   │   └── logo-icon.svg
│   ├── og/
│   │   ├── og-home.jpg
│   │   ├── og-contact.jpg
│   │   └── og-privacy.jpg
│   └── avatars/
│       └── placeholder.svg
```

### Naming Conventions

```
Format: [name]-[width].[extension]

Examples:
hero-400.webp
hero-800.webp
logo-full.png
avatar-placeholder.svg
og-home-1200x630.jpg
```

---

## Performance Best Practices

### 1. Prioritize Above-the-Fold Images

```html
<!-- Hero image: High priority, eager loading -->
<img 
  src="hero.webp"
  alt="Hero image"
  loading="eager"
  fetchpriority="high"
  decoding="async"
/>

<!-- Below-fold image: Lazy load -->
<img 
  src="testimonial.webp"
  alt="Testimonial"
  loading="lazy"
  decoding="async"
/>
```

### 2. Use Appropriate Image Sizes

Don't serve 1920px images for mobile:

```html
<img
  srcSet="
    image-400.webp 400w,
    image-800.webp 800w,
    image-1200.webp 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
/>
```

### 3. Implement Lazy Loading

```javascript
// Only for very old browsers without native lazy loading
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading supported
  const images = document.querySelectorAll('img[loading="lazy"]');
} else {
  // Load polyfill
  import('lazysizes');
}
```

### 4. Preload Critical Images

```html
<head>
  <!-- Preload hero image -->
  <link 
    rel="preload" 
    as="image" 
    href="/images/hero-1200.webp"
    imagesrcset="
      /images/hero-400.webp 400w,
      /images/hero-800.webp 800w,
      /images/hero-1200.webp 1200w
    "
    imagesizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  />
</head>
```

### 5. Add Blur-Up Placeholder

Show low-quality placeholder while loading:

```html
<img
  src="image-lqip.jpg"  <!-- 20x15px blurred image -->
  data-src="image.jpg"  <!-- Full image -->
  alt="Description"
  class="blur-up"
  loading="lazy"
/>
```

---

## Accessibility

### Alt Text Guidelines

**Do:**
- ✅ Describe what's in the image
- ✅ Include context if relevant
- ✅ Keep it concise (<125 characters)
- ✅ Include keywords naturally

**Don't:**
- ❌ Start with "Image of" or "Picture of"
- ❌ Repeat information from surrounding text
- ❌ Use excessive keywords
- ❌ Leave alt empty (unless purely decorative)

**Examples:**

```html
<!-- ❌ Bad -->
<img alt="image" />
<img alt="Picture of a person" />

<!-- ✅ Good -->
<img alt="Indigenous entrepreneur presenting business plan to investors" />
<img alt="Traditional medicine workshop with Elder teaching youth" />

<!-- Decorative image (empty alt OK) -->
<img alt="" role="presentation" />
```

### Decorative Images

If image is purely decorative:

```html
<img 
  src="decorative-pattern.svg"
  alt=""
  role="presentation"
  aria-hidden="true"
/>
```

---

## SEO Optimization

### 1. Descriptive File Names

```
❌ Bad: img123.jpg, photo.png, download.jpg
✅ Good: indigenous-entrepreneur-business-plan.jpg
```

### 2. Structured Data

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": "https://indigenousrising.ai/images/hero.jpg",
  "license": "https://indigenousrising.ai/license",
  "acquireLicensePage": "https://indigenousrising.ai/license",
  "creditText": "Indigenous Rising AI",
  "creator": {
    "@type": "Organization",
    "name": "Indigenous Rising AI"
  }
}
</script>
```

### 3. Open Graph Images

For social sharing:

```html
<meta property="og:image" content="https://indigenousrising.ai/og-home.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Indigenous Rising AI platform" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://indigenousrising.ai/og-home.jpg" />
```

**OG Image Specs:**
- Dimensions: 1200x630px
- Format: JPG or PNG
- Max size: 1MB
- Aspect ratio: 1.91:1

---

## Testing & Validation

### Performance Testing

```bash
# Lighthouse
npx lighthouse https://indigenousrising.ai --view

# WebPageTest
# https://www.webpagetest.org/

# Google PageSpeed Insights
# https://pagespeed.web.dev/
```

### Image Analysis Tools

- **Chrome DevTools** - Network tab, Coverage tab
- **ImageOptim** - Check compression savings
- **WebP Converter** - Validate WebP quality
- **Alt Text Checker** - Verify accessibility

### Automated Checks

Add to CI/CD pipeline:

```yaml
# .github/workflows/images.yml
name: Image Optimization Check

on: [pull_request]

jobs:
  check-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check image sizes
        run: |
          find public/images -type f -size +100k -exec echo "Warning: {} exceeds 100KB" \;
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: No Alt Text
```html
<img src="image.jpg" />
```

### ✅ Fix:
```html
<img src="image.jpg" alt="Descriptive text" />
```

---

### ❌ Mistake 2: Lazy Loading Above-Fold Images
```html
<img src="hero.jpg" loading="lazy" />
```

### ✅ Fix:
```html
<img src="hero.jpg" loading="eager" fetchpriority="high" />
```

---

### ❌ Mistake 3: No Width/Height
```html
<img src="image.jpg" alt="Description" />
```

### ✅ Fix:
```html
<img src="image.jpg" alt="Description" width="800" height="600" />
```

---

### ❌ Mistake 4: Huge File Sizes
```html
<img src="4000x3000-uncompressed.jpg" />  <!-- 5MB! -->
```

### ✅ Fix:
```html
<img 
  srcSet="
    image-400.webp 400w,
    image-800.webp 800w,
    image-1200.webp 1200w
  "
  src="image-800.webp"
/>  <!-- <100KB per size -->
```

---

### ❌ Mistake 5: Not Using Modern Formats
```html
<img src="large-photo.png" />  <!-- 2MB PNG! -->
```

### ✅ Fix:
```html
<picture>
  <source srcSet="photo.webp" type="image/webp" />
  <img src="photo.jpg" alt="Description" />
</picture>  <!-- <200KB -->
```

---

## Current Implementation Status

### ✅ Implemented
- Footer logo: `loading="lazy"`, `decoding="async"`
- Hero images: WebP format with responsive sizes
- Navigation logo: `fetchPriority="high"`
- Proper alt text across all images

### 🔄 In Progress
- AVIF format support
- Blur-up placeholders
- Image CDN integration

### 📋 Planned
- Automated image optimization in build
- Visual regression testing
- Dynamic image resizing
- Art direction for mobile vs desktop

---

## Resources

- [MDN: Responsive Images](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Web.dev: Optimize Images](https://web.dev/fast/#optimize-your-images)
- [Image CDN Comparison](https://www.cdnplanet.com/compare/cloudinary-vs-imgix/)
- [WebP Converter](https://developers.google.com/speed/webp/download)
- [Squoosh App](https://squoosh.app/)

---

Last Updated: 2025-01-15
