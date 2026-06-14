/**
 * Trim a meta description to a SERP-safe length so Google doesn't truncate it.
 * Cuts on a word boundary near `max` (~160 chars) and appends an ellipsis.
 * Short descriptions pass through unchanged.
 */
export function truncateDescription(text: string | undefined | null, max = 160): string {
  if (!text) return '';
  const t = String(text).trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return base.replace(/[\s,.;:–—-]+$/, '') + '…';
}
