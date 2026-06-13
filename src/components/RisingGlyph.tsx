interface RisingGlyphProps {
  /** Rendered px size of the square glyph. */
  size?: number;
  className?: string;
}

/**
 * The brand "rising sun" mark — an abstract sunrise (half-sun + rays over a
 * horizon) that replaces the old "IR" monogram. Drawn in a single color via
 * `currentColor`, so it inherits whatever text color its container sets
 * (cream on the terracotta header/footer boxes, terracotta on the cream box in
 * the dark nav). Kept geometric/non-figurative on purpose — no specific
 * cultural motif. Scales crisply from favicon size up to the header lockup.
 */
export function RisingGlyph({ size = 18, className }: RisingGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* horizon */}
      <path d="M3.5 18.5h17" />
      {/* half-sun rising over the horizon */}
      <path d="M7 18.5a5 5 0 0 1 10 0" />
      {/* rays */}
      <path d="M12 4.5v2.4" />
      <path d="M5.1 7.6l1.7 1.7" />
      <path d="M18.9 7.6l-1.7 1.7" />
    </svg>
  );
}

export default RisingGlyph;
