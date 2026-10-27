import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Target, DollarSign, Building2, Users, TrendingUp, Bell, Calendar, Info, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import FundingProgramCard from '@/components/funding/FundingProgramCard';
import FundingFiltersPanel from '@/components/funding/FundingFiltersPanel';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_TITLES } from '@/data/routeTitles';
import {
  EMPTY_FILTERS, PAGE_SIZE, PROVINCES, TYPE_PAGES, activeFilterCount, fetchPrograms, parseFilters,
  toSearchParams, type FilterState, type FundingProgram,
} from '@/lib/funding-catalog';
import { seededPrograms } from '@/lib/funding-prerender';

const fundingTypes = [
  { title: 'Grants and contributions', description: 'Non-repayable money from federal, provincial and territorial programmes and from Indigenous Financial Institutions. Most require your own equity and a business plan.', icon: Building2 },
  { title: 'Loans', description: 'Developmental lending from Indigenous Financial Institutions and Métis Capital Corporations, BDC and provincial loan programmes, often with business support alongside.', icon: DollarSign },
  { title: 'Loan guarantees and equity', description: 'Guarantees and investment for larger, usually community-owned projects, such as the Alberta Indigenous Opportunities Corporation.', icon: TrendingUp },
  { title: 'Community programmes', description: 'Nation, regional and territorial programmes with their own eligibility, such as the Nunatsiavut Business Grant or the GNWT SEED policy.', icon: Users },
];

/**
 * Public funding directory. Browsing is free and needs no account. Every
 * programme shows the funder, the type of money, the published amount (or
 * "not published"), the intake status, when we last checked it, and one
 * button that says where it actually goes.
 */
const PublicFunding: React.FC = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(params), [params]);
  const seed = useMemo(() => seededPrograms(), []);
  const unfiltered = activeFilterCount(filters) === 0 && filters.page === 1;
  const [data, setData] = useState<{ rows: FundingProgram[]; total: number } | null>(
    seed && unfiltered ? { rows: seed.slice(0, PAGE_SIZE), total: seed.length } : null,
  );
  const [loading, setLoading] = useState(!seed);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (seed) return; // build-time render: the seed is the data
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    fetchPrograms(filters, ac.signal)
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { if (ac.signal.aborted) return; setError((e as Error).message); setData({ rows: [], total: 0 }); setLoading(false); });
    return () => ac.abort();
  }, [filters, seed]);

  const update = (next: FilterState) => setParams(toSearchParams(next), { replace: false });
  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageLink = (page: number) => `/funding?${toSearchParams({ ...filters, page }).toString()}`;

  return (
    <>
      <MetaTags title={ROUTE_TITLES['/funding']} />

      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="mb-4">
                <Target className="w-3 h-3 mr-1" />
                Funding Navigator
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Indigenous business funding across Canada
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Grants, contributions, loans and loan guarantees for First Nations, Métis and Inuit entrepreneurs, community businesses and Nations. Filter by province, who is applying and the kind of money, then go straight to the funder&apos;s own page.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/funding/alerts">
                    <Bell className="w-4 h-4 mr-2" />
                    Get free weekly alerts
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary bg-white hover:bg-primary/5">
                  <Link to={user ? '/dashboard/funding/matches' : '/signup'}>
                    {user ? 'Match me to funding' : 'Start free account for matches'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <section className="py-12 px-4 sm:px-6" aria-labelledby="directory-heading">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 id="directory-heading" className="text-3xl font-display font-bold text-foreground mb-3">Funding programmes</h2>
              <p className="text-muted-foreground max-w-3xl">
                Indigenous Rising AI is an independent platform. We are not a government agency and we do not administer any of these programmes. Amounts, deadlines and eligibility are read from each funder&apos;s own page on the date shown; confirm current terms with the funder before applying. Nothing here is an eligibility decision.
              </p>
            </div>

            <div className="lg:grid lg:grid-cols-[290px_1fr] lg:gap-8">
              <div className="mb-6 lg:mb-0">
                <div className="lg:hidden">
                  <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <SlidersHorizontal className="w-4 h-4 mr-2" aria-hidden="true" />
                        {filtersOpen ? 'Hide filters' : `Filters${activeFilterCount(filters) ? ` (${activeFilterCount(filters)})` : ''}`}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <FundingFiltersPanel value={filters} onChange={update} />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
                <div className="hidden lg:block sticky top-24">
                  <FundingFiltersPanel value={filters} onChange={update} />
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
                  {loading ? 'Loading programmes…' : error ? error : `${total} programme${total === 1 ? '' : 's'}${activeFilterCount(filters) ? ' match these filters' : ''}${pages > 1 ? ` · page ${filters.page} of ${pages}` : ''}`}
                </p>

                {!loading && !error && total === 0 && (
                  <Card>
                    <CardContent className="p-10 text-center space-y-4">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-semibold text-foreground">No programmes match those filters</h3>
                      <p className="text-muted-foreground">Try fewer filters. National programmes apply in every province, and most Indigenous Financial Institutions do not publish a loan ceiling, so an amount filter hides them.</p>
                      <Button variant="outline" onClick={() => update({ ...EMPTY_FILTERS })}>Clear all filters</Button>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {(data?.rows ?? []).map((g) => <FundingProgramCard key={g.id} program={g} />)}
                </div>

                {pages > 1 && (
                  <nav className="flex items-center justify-center gap-2 mt-8" aria-label="Pagination">
                    {filters.page > 1 && <Button asChild variant="outline" size="sm"><Link to={pageLink(filters.page - 1)}>Previous</Link></Button>}
                    <span className="text-sm text-muted-foreground">Page {filters.page} of {pages}</span>
                    {filters.page < pages && <Button asChild variant="outline" size="sm"><Link to={pageLink(filters.page + 1)}>Next</Link></Button>}
                  </nav>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 px-4 sm:px-6 bg-muted/30" aria-labelledby="browse-heading">
          <div className="max-w-7xl mx-auto">
            <h2 id="browse-heading" className="text-2xl font-display font-bold text-foreground mb-2">Browse by region and type</h2>
            <p className="text-muted-foreground mb-6">Each page lists the programmes available in that province or territory, including national programmes.</p>
            <ul className="flex flex-wrap gap-2 mb-6">
              {PROVINCES.map((p) => (
                <li key={p.code}>
                  <Link to={`/funding/${p.slug}`} className="inline-block rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary">{p.name}</Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-2">
              {TYPE_PAGES.map((t) => (
                <li key={t.slug}>
                  <Link to={`/funding/${t.slug}`} className="inline-block rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm text-primary hover:bg-primary/10">{t.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <AllProgramsIndex seed={seed} />

        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Kinds of funding in the directory</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Not every programme is a grant, and not every Indigenous programme is open to individual business owners. The type and the applicant rules are shown on every card.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fundingTypes.map((type) => (
                <Card key={type.title} className="hover:shadow-lg hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{type.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{type.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto rounded-2xl border border-border p-6 md:p-8 flex gap-4">
            <Info className="w-6 h-6 text-primary shrink-0 mt-1" aria-hidden="true" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">How we check this directory</p>
              <p>Every programme links to the funder&apos;s own page. Amounts, deadlines and eligibility rules are quoted from that page and carry the date they were read. Automated checks flag links that stop working; a person reviews every record before it is published and after any change. See <Link to="/guides/indigenous-business-funding-statistics" className="underline">what we can and cannot verify</Link>.</p>
              <p>Something wrong on a programme page? Each page has a &ldquo;Report a problem&rdquo; link that goes straight to our review queue.</p>
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">Never miss a funding opportunity</h2>
            <p className="text-muted-foreground mb-8">A short email every Friday morning with new and updated programmes for your province and industry. Free, double opt-in, unsubscribe any time.</p>
            <Button asChild size="lg" className="h-auto max-w-full whitespace-normal py-3">
              <Link to="/funding/alerts">
                <Bell className="w-4 h-4 mr-2" />
                Subscribe to free weekly alerts
              </Link>
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

/**
 * A plain A–Z list of every published programme. It exists so that each
 * programme page has at least one inbound link in the static HTML regardless
 * of pagination or filters (the internal-linking CI gate), and so a reader
 * who knows the programme name can get there in one click.
 */
function AllProgramsIndex({ seed }: { seed: FundingProgram[] | null }) {
  const [rows, setRows] = useState<Array<Pick<FundingProgram, 'slug' | 'name' | 'funder'>>>(seed ?? []);
  useEffect(() => {
    if (seed) return;
    fetchPrograms({ ...EMPTY_FILTERS }, undefined)
      .then((first) => {
        if (first.total <= first.rows.length) { setRows(first.rows); return; }
        return Promise.all(
          Array.from({ length: Math.ceil(first.total / PAGE_SIZE) - 1 }, (_, i) => fetchPrograms({ ...EMPTY_FILTERS, page: i + 2 })),
        ).then((rest) => setRows([...first.rows, ...rest.flatMap((r) => r.rows)]));
      })
      .catch(() => undefined);
  }, [seed]);
  if (!rows.length) return null;
  const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name, 'en-CA'));
  return (
    <section className="py-12 px-4 sm:px-6" aria-labelledby="index-heading">
      <div className="max-w-7xl mx-auto">
        <h2 id="index-heading" className="text-2xl font-display font-bold text-foreground mb-4">All programmes, A to Z</h2>
        <ul className="columns-1 sm:columns-2 lg:columns-3 gap-6 text-sm">
          {sorted.map((g) => (
            <li key={g.slug} className="break-inside-avoid py-1">
              <Link to={`/funding/${g.slug}`} className="text-foreground hover:text-primary hover:underline">{g.name}</Link>
              <span className="text-muted-foreground"> · {g.funder}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default PublicFunding;
