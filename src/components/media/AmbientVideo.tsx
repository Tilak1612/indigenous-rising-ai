import React, { useEffect, useRef, useState } from 'react';

/**
 * A decorative background loop that costs nothing until it is worth playing.
 *
 * Motion here is atmosphere, never information, so every condition below
 * fails CLOSED to the poster image:
 *
 *   - prefers-reduced-motion: reduce  -> poster only, video never fetched
 *   - viewport below `minWidth`       -> poster only (a phone should not
 *                                        spend 120KB and a decode budget on
 *                                        background texture)
 *   - not yet scrolled into view      -> poster only
 *   - Save-Data / slow connection     -> poster only
 *
 * The <video> element is not rendered at all until those pass, so
 * preload="none" is belt-and-braces rather than the only defence — nothing
 * is requested, not merely deferred. Playback pauses when it scrolls away.
 */
type Props = {
  webm: string;
  mp4: string;
  poster: string;
  posterAvif?: string;
  posterWebp?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Below this width the poster is used and no video is fetched. */
  minWidth?: number;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const saveData = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!c) return false;
  return c.saveData === true || c.effectiveType === 'slow-2g' || c.effectiveType === '2g';
};

export const AmbientVideo: React.FC<Props> = ({
  webm, mp4, poster, posterAvif, posterWebp, className, style, minWidth = 768,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prefersReducedMotion() || saveData()) return;
    if (window.innerWidth < minWidth) return;
    const host = hostRef.current;
    if (!host) return;

    if (!('IntersectionObserver' in window)) { setPlay(true); return; }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        setPlay(visible);
        // Only PAUSE here. Playing is handled by the effect below, because on
        // the first intersection `play` is still false, so no <video> exists
        // yet and videoRef.current is null — calling play() here meant the
        // element mounted and then sat paused forever.
        if (!visible) videoRef.current?.pause();
      },
      { rootMargin: '200px' },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [minWidth]);

  // Start playback once the element actually exists.
  useEffect(() => {
    if (!play) return;
    const v = videoRef.current;
    if (!v) return;
    // Set muted as a PROPERTY before play(). React's `muted` prop is not
    // reliably reflected onto the element, and a browser refuses autoplay
    // for anything it considers unmuted — which would leave the poster up.
    v.muted = true;
    void v.play().catch(() => { /* autoplay refused; poster remains */ });
  }, [play]);

  return (
    <div ref={hostRef} className={className} style={style} aria-hidden="true">
      {play ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          aria-hidden="true"
          tabIndex={-1}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      ) : (
        <picture>
          {posterAvif && <source type="image/avif" srcSet={posterAvif} />}
          {posterWebp && <source type="image/webp" srcSet={posterWebp} />}
          <img
            src={poster}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </picture>
      )}
    </div>
  );
};

export default AmbientVideo;
