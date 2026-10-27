import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import FundingProgramCard from '@/components/funding/FundingProgramCard';
import { ROUTE_TITLES } from '@/data/routeTitles';
import {
  EMPTY_FILTERS, PAGE_SIZE, PROVINCES, TYPE_PAGES, fetchPrograms, provinceBySlug, typePageBySlug, type FundingProgram,
} from '@/lib/funding-catalog';
import { seededPrograms } from '@/lib/funding-prerender';

/**
 * Region and type landing pages: /funding/<province-slug> and
 * /funding/indigenous-business-loans|grants. Each is a filtered view of the
 * same catalogue with its own canonical URL and original copy, so search and
 * AI answer engines have a page per province to cite.
 */
export default function FundingRegionPage({ slug }: { slug: string }) {
  const province = provinceBySlug(slug);
  const typePage = typePageBySlug(slug);
  const filters = useMemo(() => ({
    ...EMPTY_FILTERS,
    provinces: province ? [province.code] : [],
    types: typePage ? [...typePage.types] : [],
  }), [province, typePage]);

  const seed = useMemo(() => {
    const all = seededPrograms();
    if (!all) return null;
    return all.filter((g) =>
      (province ? g.provinces.includes(province.code) : true) &&
      (typePage ? (typePage.types as readonly string[]).includes(g.funding_type) : true));
  }, [province, typePage]);

  const [rows, setRows] = useState<FundingProgram[]>(seed ?? []);
  const [loading, setLoading] = useState(!seed);

  useEffect(() => {
    if (seed) return;
    let active = true;
    setLoading(true);
    fetchPrograms(filters)
      .then(async (first) => {
        let all = first.rows;
        for (let page = 2; all.length < first.total && page <= 10; page++) {
          const next = await fetchPrograms({ ...filters, page });
          all = all.concat(next.rows);
        }
        if (active) { setRows(all); setLoading(false); }
      })
      .catch(() => active && setLoading(false));
    return () => { active = false; };
  }, [filters, seed]);

  const path = `/funding/${slug}`;
  const title = ROUTE_TITLES[path] ?? 'Indigenous business funding | Indigenous Rising AI';
  const heading = province ? `Indigenous business funding in ${province.name}` : typePage?.title ?? 'Indigenous business funding';
  const national = rows.filter((g) => g.provinces.length >= 13);
  const regional = rows.filter((g) => g.provinces.length < 13);

  return (
    <div className="min-h-screen bg-background">
      <MetaTags title={title} />
      <Navigation />
      <main className="pt-24 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs customItems={[{ name: 'Home', path: '/' }, { name: 'Funding', path: '/funding' }, { name: province ? province.name : typePage?.title ?? 'Funding', path }]} />
          <header className="mb-8 max-w-3xl">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">{heading}</h1>
            {province ? (
              <p className="text-lg text-muted-foreground leading-relaxed">
                Grants, contributions, loans and guarantees that an Indigenous entrepreneur, community business or Nation in {province.name} can apply to: the programmes delivered inside the province or territory, plus the national programmes that apply everywhere in Canada. Each card says what kind of money it is, who may apply, what the funder publishes as the amount, and when we last read the funder&apos;s page. Indigenous Rising AI does not administer any of these programmes.
              </p>
            ) : (
              <p className="text-lg text-muted-foreground leading-relaxed">{typePage?.intro}</p>
            )}
          </header>

          {loading && <p className="text-muted-foreground">Loading programmes…</p>}
          {!loading && rows.length === 0 && (
            <p className="text-muted-foreground">No published programme matches this page yet. <Link to="/funding" className="underline">Browse the full directory</Link> or <Link to="/funding/alerts" className="underline">get weekly alerts</Link> when programmes are added.</p>
          )}

          {province && regional.length > 0 && (
            <section className="mb-10" aria-labelledby="regional-heading">
              <h2 id="regional-heading" className="font-display text-2xl font-semibold text-foreground mb-4">Delivered in {province.name}</h2>
              <div className="grid md:grid-cols-2 gap-6">{regional.map((g) => <FundingProgramCard key={g.id} program={g} />)}</div>
            </section>
          )}
          {province && national.length > 0 && (
            <section className="mb-10" aria-labelledby="national-heading">
              <h2 id="national-heading" className="font-display text-2xl font-semibold text-foreground mb-4">National programmes that also apply in {province.name}</h2>
              <div className="grid md:grid-cols-2 gap-6">{national.map((g) => <FundingProgramCard key={g.id} program={g} />)}</div>
            </section>
          )}
          {!province && rows.length > 0 && (
            <section className="mb-10">
              <div className="grid md:grid-cols-2 gap-6">{rows.map((g) => <FundingProgramCard key={g.id} program={g} />)}</div>
            </section>
          )}

          <section className="border-t border-border pt-8" aria-labelledby="other-regions">
            <h2 id="other-regions" className="font-display text-xl font-semibold text-foreground mb-3">{province ? 'Other provinces and territories' : 'Browse by province or territory'}</h2>
            <ul className="flex flex-wrap gap-2 mb-4">
              {PROVINCES.filter((p) => p.slug !== slug).map((p) => (
                <li key={p.code}><Link to={`/funding/${p.slug}`} className="inline-block rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary">{p.name}</Link></li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-2">
              {TYPE_PAGES.filter((t) => t.slug !== slug).map((t) => (
                <li key={t.slug}><Link to={`/funding/${t.slug}`} className="inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10">{t.title}</Link></li>
              ))}
              <li><Link to="/funding" className="inline-block rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary">All programmes and filters</Link></li>
            </ul>
            <p className="text-xs text-muted-foreground mt-4">Showing up to {PAGE_SIZE * 10} programmes. Amounts and eligibility come from each funder&apos;s page on the date shown; confirm current terms with the funder.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
