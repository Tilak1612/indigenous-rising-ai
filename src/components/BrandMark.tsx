interface BrandMarkProps {
  /** Rendered px size of the square mark. */
  size?: number;
  className?: string;
}

/**
 * The Indigenous Rising brand mark — two open rings radiating outward from a
 * solid centre.
 *
 * Full colour and self-contained: unlike the previous single-colour glyph it
 * does NOT inherit `currentColor`, so it must sit on a light surface rather
 * than inside a filled brand-colour chip. Every lockup on the site places it
 * directly beside the wordmark on the cream/white ground.
 *
 * Geometry is shared byte-for-byte with public/brand-mark.svg and
 * public/icon-master-fullbleed.svg (the favicon / app-icon master), so the
 * in-app logo and the browser-tab icon cannot drift apart.
 *
 * Deliberately geometric and non-figurative — no specific cultural motif.
 */
export function BrandMark({ size = 32, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Indigenous Rising"
    >
      <g fill="none" strokeLinecap="butt">
        <path d="M 157.4 413.7 A 186 186 0 1 1 354.6 413.7" stroke="#123F2B" strokeWidth="40" />
        <path d="M 183.4 349.0 A 118 118 0 1 1 328.6 349.0" stroke="#E8A317" strokeWidth="38" />
      </g>
      <circle cx="256" cy="256" r="57" fill="#DD4B26" />
    </svg>
  );
}

export default BrandMark;
