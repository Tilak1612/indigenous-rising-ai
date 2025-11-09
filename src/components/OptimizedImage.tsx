interface OptimizedImageProps {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  width?: number;
  height?: number;
}

/**
 * OptimizedImage component for responsive, lazy-loaded images
 * Automatically uses WebP format when available with fallback to original format
 */
export const OptimizedImage = ({
  src,
  alt,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  width,
  height,
}: OptimizedImageProps) => {
  // Extract filename without extension
  const getBaseName = (path: string) => {
    const parts = path.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace(/\.[^/.]+$/, '');
  };

  // Check if it's a public asset
  const isPublicAsset = src.startsWith('/') || src.startsWith('http');
  
  if (!isPublicAsset) {
    // For imported assets, just render normally
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
        {...(fetchPriority !== 'auto' && { fetchpriority: fetchPriority })}
      />
    );
  }

  const baseName = getBaseName(src);
  const basePath = src.substring(0, src.lastIndexOf('/') + 1);

  return (
    <picture>
      <source
        srcSet={`${basePath}${baseName}-400.webp 400w, ${basePath}${baseName}-800.webp 800w, ${basePath}${baseName}-1200.webp 1200w, ${basePath}${baseName}-1920.webp 1920w`}
        sizes={sizes}
        type="image/webp"
      />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
        {...(fetchPriority !== 'auto' && { fetchpriority: fetchPriority })}
      />
    </picture>
  );
};
