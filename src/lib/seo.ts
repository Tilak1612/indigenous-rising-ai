/**
 * Trim a meta description to a SERP-safe length (~160 chars).
 *
 * Mirrors truncateDesc() in scripts/prerender.mjs so the static HTML and the
 * client-rendered tags agree. They had drifted: this version cut at a word and
 * appended an ellipsis, so after hydration pages carried a fragment ending
 * "…" while the prerendered HTML carried a complete sentence. Never emit a
 * fragment: prefer the last complete sentence inside the limit, else the last
 * clause closed with a period.
 */
export function truncateDescription(text: string | undefined | null, max = 160): string {
  const t = String(text || '').trim().replace(/\s+/g, ' ');
  if (t.length <= max) return t;
  const cut = t.slice(0, max);

  const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (lastStop > max * 0.5) return cut.slice(0, lastStop + 1).trim();

  const lastClause = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf('; '), cut.lastIndexOf(' — '));
  const base = lastClause > max * 0.5 ? cut.slice(0, lastClause) : cut.slice(0, cut.lastIndexOf(' '));
  return base.replace(/[\s,;:–—-]+$/, '') + '.';
}
