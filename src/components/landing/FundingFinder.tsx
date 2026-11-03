import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { signupHref } from '@/lib/signup-intent';
import { trackSignupCta } from '@/lib/conversion-events';
import { formatFreshness } from '@/lib/funding-freshness';
import {
  APPLICANT_LABELS, CATEGORY_LABELS, EMPTY_FILTERS, PROVINCES, deriveIntake, fetchPrograms, formatAmount,
  fundingTypeLabel, toSearchParams, type FilterState, type FundingProgram,
} from '@/lib/funding-catalog';
import { seededPrograms } from '@/lib/funding-prerender';

/**
 * The hero's product demo, live. Three questions, answered against the real
 * catalogue (public rows, no account), showing the first three programmes
 * that list the visitor's province and applicant type, each with the
 * funder's published amount and the date we last read the funder's page.
 *
 * What stood here before was a static screenshot of the funding page. A
 * visitor could look at the product; now they use it, and the "See all"
 * link and the signup CTA carry their answers forward. Nothing here is an
 * eligibility decision and the copy says so; counts and amounts are the
 * catalogue's, never invented.
 *
 * At build time scripts/prerender.mjs seeds the catalogue, so the static
 * HTML already carries three real programmes; in the browser the component
 * fetches live on every change.
 */

const APPLICANT_OPTIONS = ['individual', 'community_business', 'community', 'organization'] as const;
const PURPOSE_OPTIONS = ['startup', 'expansion', 'acquisition', 'working_capital', 'equipment', 'export', 'women', 'youth'] as const;
const SHOW = 3;

const S = {
  select: {
    width: '100%', minHeight: 44, borderRadius: 10, border: '1px solid rgba(74,56,38,.18)', background: 'var(--ir-paper)',
    color: 'var(--ir-ink)', fontSize: 15, padding: '0 36px 0 12px', appearance: 'none' as const, WebkitAppearance: 'none' as const,
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%236B5645' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
  },
  label: { display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ir-bark)', marginBottom: 6, letterSpacing: '.01em' },
  badge: { display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 100, border: '1px solid rgba(74,56,38,.14)', background: 'var(--ir-linen)', color: 'var(--ir-umber)' },
};

function defaultRows(all: FundingProgram[]): FundingProgram[] {
  // National first, then the most recently read, so the default view is the
  // programmes most visitors can act on today.
  return [...all]
    .filter((g) => g.intake_status === 'open' || g.intake_status === 'rolling')
    .sort((a, b) => (b.provinces.length >= 13 ? 1 : 0) - (a.provinces.length >= 13 ? 1 : 0) || (b.last_verified ?? '').localeCompare(a.last_verified ?? ''))
    .slice(0, SHOW);
}

export default function FundingFinder() {
  const id = useId();
  const seed = useMemo(() => seededPrograms(), []);
  const [province, setProvince] = useState('');
  const [applicant, setApplicant] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rows, setRows] = useState<FundingProgram[]>(() => (seed ? defaultRows(seed) : []));
  const [total, setTotal] = useState<number | null>(seed ? seed.filter((g) => g.intake_status === 'open' || g.intake_status === 'rolling').length : null);
  const [loading, setLoading] = useState(!seed);
  const [error, setError] = useState(false);
  const touched = useRef(false);

  const filters: FilterState = useMemo(() => ({
    ...EMPTY_FILTERS,
    provinces: province ? [province] : [],
    applicants: applicant ? [applicant] : [],
    categories: purpose ? [purpose] : [],
    acceptingOnly: true,
  }), [province, applicant, purpose]);

  useEffect(() => {
    if (seed && !touched.current) return; // build-time render, or first client paint with the seed
    const ac = new AbortController();
    setLoading(true);
    setError(false);
    fetchPrograms(filters, ac.signal, { pageSize: SHOW })
      .then((d) => {
        setRows(d.rows);
        setTotal(d.total);
        setLoading(false);
        if (touched.current) {
          import('@/utils/analytics')
            .then((m) => m.trackEvent('hero_finder_used', { province: province || 'all', applicant: applicant || 'any', purpose: purpose || 'any', total: d.total }))
            .catch(() => undefined);
        }
      })
      .catch(() => { if (!ac.signal.aborted) { setError(true); setLoading(false); } });
    return () => ac.abort();
  }, [filters, seed, province, applicant, purpose]);

  const onChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => { touched.current = true; setter(e.target.value); };
  const allHref = `/funding?${toSearchParams(filters).toString()}`;
  const provinceName = PROVINCES.find((p) => p.code === province)?.name;

  return (
    <div style={{ padding: 'clamp(16px,2.4vw,26px)', background: 'var(--ir-paper)', borderTop: '1px solid rgba(74,56,38,.08)', textAlign: 'left' }} data-testid="funding-finder">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <h2 style={{ fontSize: 'clamp(18px,1.9vw,22px)', fontWeight: 600, color: 'var(--ir-ink)', margin: 0, letterSpacing: '-.01em' }}>
          Find funding that fits, in three answers
        </h2>
        <span style={{ fontSize: 13, color: 'var(--ir-stone)' }}>Real programmes, read from each funder&apos;s own page. No account needed.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <div>
          <label htmlFor={`${id}-province`} style={S.label}>Where is the business?</label>
          <select id={`${id}-province`} value={province} onChange={onChange(setProvince)} style={S.select}>
            <option value="">Anywhere in Canada</option>
            {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-applicant`} style={S.label}>Who is applying?</label>
          <select id={`${id}-applicant`} value={applicant} onChange={onChange(setApplicant)} style={S.select}>
            <option value="">Anyone</option>
            {APPLICANT_OPTIONS.map((a) => <option key={a} value={a}>{APPLICANT_LABELS[a]}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-purpose`} style={S.label}>What is the money for?</label>
          <select id={`${id}-purpose`} value={purpose} onChange={onChange(setPurpose)} style={S.select}>
            <option value="">Anything</option>
            {PURPOSE_OPTIONS.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 16, minHeight: 120 }} aria-live="polite">
        {error ? (
          <p style={{ fontSize: 14, color: 'var(--ir-bark)' }}>We couldn&apos;t load programmes just now. <Link to="/funding" style={{ color: 'var(--ir-green)' }}>Open the full directory</Link>.</p>
        ) : loading && rows.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--ir-stone)' }}>Looking through the directory…</p>
        ) : rows.length === 0 ? (
          <p style={{ fontSize: 14, color: 'var(--ir-bark)' }}>
            No programme in the directory lists that combination yet. National programmes still apply{provinceName ? ` in ${provinceName}` : ''}: <Link to="/funding" style={{ color: 'var(--ir-green)' }}>browse all programmes</Link>.
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10, opacity: loading ? 0.6 : 1, transition: 'opacity .2s' }}>
            {rows.map((g) => {
              const intake = deriveIntake(g);
              const fresh = formatFreshness(g);
              return (
                <li key={g.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(74,56,38,.1)', background: 'var(--ir-cream-light)' }}>
                  <div style={{ minWidth: 0 }}>
                    <Link to={`/funding/${g.slug}`} style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ir-ink)', textDecoration: 'none' }}>{g.name}</Link>
                    <div style={{ fontSize: 13, color: 'var(--ir-stone)', marginTop: 2 }}>{g.funder}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      <span style={S.badge}>{fundingTypeLabel(g)}</span>
                      <span style={S.badge}>{formatAmount(g)}</span>
                      <span style={S.badge}>{intake.text}</span>
                    </div>
                    <div style={{ fontSize: 12, marginTop: 6, color: fresh.verified ? 'var(--ir-stone)' : 'var(--ir-umber)' }}>{fresh.text}</div>
                  </div>
                  <Link to={`/funding/${g.slug}`} aria-label={`View ${g.name}`} style={{ fontSize: 14, fontWeight: 600, color: 'var(--ir-green)', textDecoration: 'none', padding: '10px 12px', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Details →</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(74,56,38,.08)' }}>
        <Link to={allHref} style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ir-green)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
          {total !== null ? `See all ${total} programme${total === 1 ? '' : 's'}${provinceName ? ` for ${provinceName}` : ''}` : 'See the full directory'} →
        </Link>
        <Link
          to={signupHref()}
          onClick={() => trackSignupCta('hero_finder')}
          className="irv2-hov-cta"
          style={{ background: 'var(--ir-green)', color: 'var(--ir-cream)', textDecoration: 'none', fontSize: 14.5, fontWeight: 600, padding: '12px 18px', borderRadius: 10, minHeight: 44, display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(18,76,59,.28)' }}
        >
          Get matched to these, free
        </Link>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ir-stone)', marginTop: 10, marginBottom: 0 }}>
        Programmes are listed by the province and applicant type the funder names. Only the funder decides eligibility; confirm current terms on their page.
      </p>
    </div>
  );
}
