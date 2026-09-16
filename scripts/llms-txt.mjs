// Builds /llms.txt (https://llmstxt.org) from the same sources as the sitemap,
// the pricing page and the structured data — so it can never describe a page
// that isn't indexable, a price that isn't live, or a planned capability as
// available.
//
// What this file is and isn't: llms.txt is a PROPOSAL, not a standard. Google
// says no special AI text files are needed for AI Overviews or AI Mode, and no
// AI vendor has confirmed its crawlers read it. It is a cheap, optional,
// human-readable map of the site. robots.txt, the sitemap, structured data and
// the pages themselves are what search and answer engines actually rely on.

const clean = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/**
 * @param {object} o
 * @param {string} o.base                 e.g. https://www.indigenousrising.ai
 * @param {string} o.definition           one-sentence product definition
 * @param {string} o.audience
 * @param {{name:string, priceLabel:string, period:string}[]} o.plans
 * @param {string[]} o.available          live self-serve capabilities
 * @param {string[]} o.planned            capabilities marked not available
 * @param {{loc:string, title?:string, description?:string}[]} o.pages
 *        indexable URLs only — the sitemap entries
 */
export function buildLlmsTxt({ base, definition, audience, plans, available, planned, pages }) {
  const link = (p) => {
    const title = clean(p.title).replace(/\s*\|\s*Indigenous Rising AI$/, '') || p.loc;
    const desc = clean(p.description);
    return `- [${title}](${p.loc})${desc ? `: ${desc}` : ''}`;
  };
  const isPost = (p) => p.loc.startsWith(`${base}/blog/`);
  const price = (pl) =>
    /^\$/.test(pl.priceLabel)
      ? `${pl.priceLabel} CAD${pl.period ? ` ${pl.period}` : ''}`
      : 'custom pricing — contact the team';
  const liveSet = new Set(available);
  const plannedOnly = [...new Set(planned)].filter((f) => !liveSet.has(f));

  const out = [
    '# Indigenous Rising AI',
    '',
    `> ${clean(definition)}`,
    '',
    `Who it is for: ${clean(audience)}.`,
    '',
    'Funding information on this site is decision support, not an eligibility decision or a guarantee of funding. Indigenous Rising AI does not administer the programs it lists; confirm requirements, amounts and deadlines with the funder before applying.',
    '',
    'OCAP® is a registered trademark of the First Nations Information Governance Centre (FNIGC). The platform is designed around OCAP® principles, not certified by FNIGC, and is not affiliated with or endorsed by FNIGC.',
    '',
    '## Plans',
    '',
    ...plans.map((pl) => `- ${pl.name}: ${price(pl)}`),
    `- Full comparison: ${base}/pricing`,
    '',
    '## Available today',
    '',
    ...available.map((f) => `- ${clean(f)}`),
    '',
    '## Planned — not available yet',
    '',
    ...plannedOnly.map((f) => `- ${clean(f)}`),
    '',
    '## Pages',
    '',
    ...pages.filter((p) => !isPost(p)).map(link),
    '',
    '## Guides and articles',
    '',
    ...pages.filter(isPost).map(link),
    '',
    '## Contact and crawling',
    '',
    '- Support: help@indigenousrising.ai',
    '- Privacy: privacy@indigenousrising.ai',
    `- AI search and answer engines may crawl public pages; crawlers used for model training are blocked. See ${base}/robots.txt`,
    '',
  ];
  return out.join('\n');
}
