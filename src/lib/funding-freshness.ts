export type GrantFreshness = {
  last_verified: string | null;
  verification_status: string | null;
};

/**
 * Programme freshness, stated rather than implied.
 *
 * CLAUDE.md: "Keep program source links and freshness dates visible ... stale
 * funding data must be labelled, never silently shown as current." This page
 * selected the columns but rendered neither, so every programme read as
 * current. Of 17 published rows, 2 carry a verified date — saying nothing was
 * the least honest of the available options.
 */
export function formatFreshness(g: GrantFreshness): {
  text: string;
  verified: boolean;
} {
  if (g.last_verified) {
    const d = new Date(g.last_verified + 'T00:00:00');
    const when = Number.isNaN(d.getTime())
      ? g.last_verified
      : d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    return { text: 'Details last verified ' + when, verified: true };
  }
  return { text: 'Details not yet verified — confirm with the funder', verified: false };
}
