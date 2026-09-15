import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { grantsHubFaqs } from '@/data/grantsHubFaqs';

const read = (p: string) => readFileSync(p, 'utf8');
const prerender = read('scripts/prerender.mjs');
const crumbs = read('src/components/Breadcrumbs.tsx');

// Every structured-data type has exactly one emitter. Measured on a Vercel
// preview before this change: /demo carried two BreadcrumbLists, and the
// grants hub and every blog post carried two of each of their types, because
// the prerender and the React page both emitted them.
describe('structured data has one owner per type', () => {
  test('the breadcrumb component renders markup, not a second JSON-LD block', () => {
    expect(crumbs).not.toMatch(/application\/ld\+json/);
    expect(crumbs).toMatch(/itemType="https:\/\/schema\.org\/BreadcrumbList"/);
  });

  test('blog posts emit no client-side JSON-LD', () => {
    expect(read('src/pages/BlogPost.tsx')).not.toMatch(/application\/ld\+json/);
    expect(prerender).toMatch(/'@type': 'BlogPosting'/);
  });

  test('the grants hub FAQ has a single source feeding page and markup', () => {
    const hub = read('src/pages/GrantsHub.tsx');
    expect(hub).toMatch(/from '@\/data\/grantsHubFaqs'/);
    expect(hub, 'hub passes faqs to MetaTags, duplicating the prerendered FAQPage')
      .not.toMatch(/faqs=\{FAQS\}/);
    expect(prerender).toMatch(/loadDataModule\('src\/data\/grantsHubFaqs\.ts', 'grantsHubFaqs'\)/);
    expect(grantsHubFaqs.length).toBeGreaterThanOrEqual(4);
    for (const f of grantsHubFaqs) {
      expect(f.question.length).toBeGreaterThan(10);
      expect(f.answer.length).toBeGreaterThan(40);
    }
  });

  test('canonical and robots are emitted only by the prerender', () => {
    // Helmet deletes data-rh tags it does not re-emit: a client canonical left
    // /pricing with none at all.
    const meta = read('src/components/MetaTags.tsx');
    expect(meta).not.toMatch(/rel="canonical"/);
    expect(meta).not.toMatch(/name="robots"/);
    for (const f of ['src/pages/Blog.tsx', 'src/pages/BlogPost.tsx', 'src/pages/TermsOfService.tsx',
      'src/pages/DataRights.tsx', 'src/pages/Community.tsx', 'src/pages/AccessibilityStatement.tsx',
      'src/pages/CanadianCompliance.tsx', 'src/pages/TrackRequest.tsx', 'src/pages/Unsubscribe.tsx']) {
      expect(read(f), `${f} still emits its own canonical`).not.toMatch(/rel="canonical"/);
    }
    expect(prerender).toMatch(/<link rel="canonical" href="\$\{U\}" \/>/);
  });

  test('pages that must stay out of the index keep their own robots tag', () => {
    // These are either not prerendered (tokenised links) or need noindex after
    // a client-side transition.
    for (const f of ['src/pages/Unsubscribe.tsx', 'src/pages/TrackRequest.tsx', 'src/pages/NotFound.tsx', 'src/pages/Auth.tsx']) {
      expect(read(f), `${f} lost its noindex`).toMatch(/name="robots" content="noindex/);
    }
  });
});

describe('the prerendered breadcrumb matches the visible trail', () => {
  const mapOf = (src: string, decl: RegExp) => {
    const body = decl.exec(src)?.[1] ?? '';
    return Object.fromEntries([...body.matchAll(/'([^']+)':\s*'([^']+)'/g)].map((m) => [m[1], m[2]]));
  };

  test('the route-name maps in the component and the prerender agree', () => {
    const component = mapOf(crumbs, /const routeNames: Record<string, string> = \{([\s\S]*?)\n\};/);
    const script = mapOf(prerender, /const ROUTE_NAMES = \{([\s\S]*?)\n\};/);
    expect(Object.keys(component).length).toBeGreaterThan(10);
    expect(script, 'ROUTE_NAMES in prerender.mjs has drifted from routeNames in Breadcrumbs.tsx').toEqual(component);
  });

  test('the namespace-segment rule is mirrored too', () => {
    const one = /NON_ROUTE_SEGMENTS = new Set\(\[([^\]]*)\]\)/.exec(crumbs)?.[1];
    const two = /NON_ROUTE_SEGMENTS = new Set\(\[([^\]]*)\]\)/.exec(prerender)?.[1];
    expect(one).toBeTruthy();
    expect(two).toBe(one);
  });

  test('only routes that render the component get a prerendered breadcrumb', () => {
    const declared = /const BREADCRUMB_ROUTES = new Set\(\[([\s\S]*?)\]\)/.exec(prerender)?.[1] ?? '';
    const routes = [...declared.matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect(routes.length).toBeGreaterThan(5);
    // Each listed route's page component must actually render <Breadcrumbs />.
    const pageFor: Record<string, string> = {
      '/funding/alerts': 'src/pages/FundingAlerts.tsx',
      '/contact': 'src/pages/Contact.tsx',
      '/privacy': 'src/pages/PrivacyPolicy.tsx',
      '/success-stories': 'src/pages/SuccessStories.tsx',
      '/cookies': 'src/pages/CookiePolicy.tsx',
      '/training': 'src/pages/Training.tsx',
      '/faq': 'src/pages/FAQ.tsx',
      '/careers': 'src/pages/Careers.tsx',
    };
    for (const r of routes) {
      const file = pageFor[r];
      expect(file, `no page mapped for prerendered breadcrumb ${r}`).toBeTruthy();
      expect(read(file), `${r} has breadcrumb markup but ${file} renders no <Breadcrumbs />`).toMatch(/<Breadcrumbs/);
    }
  });
});
