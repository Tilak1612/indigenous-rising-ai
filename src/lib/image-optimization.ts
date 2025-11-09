/**
 * Image optimization utilities for responsive images
 */

export interface ResponsiveImageSet {
  srcSet: string;
  sizes: string;
  fallback: string;
}

/**
 * Generate responsive image srcSet for WebP images
 * @param basePath - Base path to the image (e.g., '/images/hero')
 * @param widths - Array of widths for responsive images
 * @returns Responsive image configuration
 */
export const generateResponsiveSrcSet = (
  basePath: string,
  widths: number[] = [400, 800, 1200, 1920]
): ResponsiveImageSet => {
  const srcSet = widths.map(w => `${basePath}-${w}.webp ${w}w`).join(', ');
  
  // Generate sizes based on common breakpoints
  const sizes = [
    '(max-width: 640px) 400px',
    '(max-width: 1024px) 800px', 
    '(max-width: 1536px) 1200px',
    '1920px'
  ].join(', ');

  return {
    srcSet,
    sizes,
    fallback: `${basePath}-1200.webp`
  };
};

/**
 * Common sizes configurations for different use cases
 */
export const imageSizes = {
  hero: '100vw',
  fullWidth: '100vw',
  halfWidth: '(max-width: 768px) 100vw, 50vw',
  thirdWidth: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  quarterWidth: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw',
  thumbnail: '(max-width: 640px) 100px, (max-width: 1024px) 200px, 300px',
};

/**
 * Determine loading strategy based on image position
 */
export const getLoadingStrategy = (
  isAboveFold: boolean
): { loading: 'lazy' | 'eager'; fetchPriority: 'high' | 'low' | 'auto' } => {
  if (isAboveFold) {
    return {
      loading: 'eager',
      fetchPriority: 'high'
    };
  }
  
  return {
    loading: 'lazy',
    fetchPriority: 'auto'
  };
};
