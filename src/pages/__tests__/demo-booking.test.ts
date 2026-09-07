import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CAL_LINK, CAL_DIRECT_URL, CAL_ORIGIN } from '@/lib/cal-embed';

/**
 * Demo booking via the official Cal.com embed.
 *
 * The embed is third party and fails for reasons outside our control — an
 * ad blocker, a corporate proxy, a Cal outage, or the site's own CSP. Every
 * assertion here exists because one of those went wrong while building it.
 */
const loader = readFileSync('src/lib/cal-embed.ts', 'utf8');
const page = readFileSync('src/pages/BookDemo.tsx', 'utf8');
const cta = readFileSync('src/components/DemoCta.tsx', 'utf8');
const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));

const csp = (): string => {
  for (const h of vercel.headers ?? [])
    for (const x of h.headers ?? [])
      if (String(x.key).toLowerCase() === 'content-security-policy') return x.value;
  return '';
};

describe('the booking link points at the real event', () => {
  test('it uses the team event URL that was given', () => {
    expect(CAL_LINK).toBe('team/brainfy-ai/indigenous-rising-demo');
    expect(CAL_DIRECT_URL).toBe('https://cal.com/team/brainfy-ai/indigenous-rising-demo');
    expect(CAL_ORIGIN).toBe('https://cal.com');
  });
});

describe('CSP allows the embed', () => {
  test('script-src, frame-src and connect-src admit Cal', () => {
    // Without these the embed is blocked outright. Verified against the
    // live headers before the change: none of the three allowed cal.com.
    const v = csp();
    expect(v, 'CSP header missing').not.toBe('');
    const dir = (name: string) =>
      (v.split(';').map((s) => s.trim()).find((s) => s.startsWith(name)) ?? '');
    expect(dir('script-src')).toContain('https://app.cal.com');
    expect(dir('frame-src')).toContain('https://app.cal.com');
    expect(dir('connect-src')).toContain('https://cal.com');
  });

  test('nothing else was loosened', () => {
    // A wildcard here would defeat the whole policy.
    const v = csp();
    expect(v).not.toMatch(/script-src[^;]*\*(?!\.)/);
    expect(v).not.toContain("'unsafe-none'");
    expect(v).toContain("object-src 'none'");
    expect(v).toContain("frame-ancestors 'none'");
  });
});

describe('success means the calendar actually rendered', () => {
  test('it waits for an iframe, not a flag the shim sets itself', () => {
    // Cal's `loaded` flag is set the instant the shim INJECTS the script,
    // not when it runs. Resolving on it meant a blocked embed reported
    // success and rendered an empty box — no calendar, no error, no
    // fallback. Measured with app.cal.com blocked.
    expect(loader).toMatch(/iframe/);
    expect(loader).toMatch(/did not render/);
    expect(loader, 'resolving on Cal.loaded is the bug this replaced')
      .not.toMatch(/resolve\([^)]*\)\s*;?\s*\}\s*if \(Date\.now\(\) - started > timeoutMs\)/);
  });

  test('the shim injects the script itself, as Cal requires', () => {
    // Injecting separately and calling init afterwards loads the script and
    // renders nothing: ns present, mount node empty. Measured.
    const shim = loader.slice(loader.indexOf('if (!w.Cal)'));
    expect(shim).toMatch(/createElement\('script'\)/);
    expect(shim).toMatch(/EMBED_SRC/);
  });
});

describe('the page degrades honestly', () => {
  test('it has loading, error and ready states', () => {
    expect(page).toMatch(/'loading' \| 'ready' \| 'failed'/);
    expect(page).toMatch(/role="status"/);
    expect(page).toMatch(/role="alert"/);
  });

  test('a direct booking link is present before any failure', () => {
    // Someone who cannot load the embed should never have to discover that.
    const beforeFail = page.slice(0, page.indexOf("state === 'failed'"));
    const anywhere = [...page.matchAll(/CAL_DIRECT_URL/g)];
    expect(anywhere.length, 'the direct link appears only in the error branch')
      .toBeGreaterThan(1);
    expect(page).toMatch(/Prefer to book directly/);
    expect(beforeFail.length).toBeGreaterThan(0);
  });

  test('a failure offers retry as well as the direct link', () => {
    expect(page).toMatch(/Try again/);
  });

  test('external links carry noopener', () => {
    const externals = [...page.matchAll(/target="_blank"/g)];
    const rels = [...page.matchAll(/rel="noopener noreferrer"/g)];
    expect(rels.length).toBeGreaterThanOrEqual(externals.length);
  });
});

describe('analytics', () => {
  test('clicks, load, failure and confirmation are all tracked', () => {
    expect(cta).toMatch(/trackEvent\('demo_cta_click'/);
    expect(cta, 'placement is what makes the funnel readable').toMatch(/placement/);
    expect(page).toMatch(/trackEvent\('demo_embed_loaded'/);
    expect(page).toMatch(/trackEvent\('demo_embed_failed'/);
    expect(page).toMatch(/trackEvent\('demo_booking_confirmed'/);
  });

  test('booking messages are only trusted from Cal origins', () => {
    // Any page can postMessage. Without the origin check a booking could be
    // faked into analytics by anything embedded on the page.
    expect(page).toMatch(/cal\\\.com\$\/\.test\(e\.origin\)|e\.origin/);
    expect(page).toMatch(/\^https:\\\/\\\/\(app\\\.\)\?cal\\\.com\$/);
  });
});

describe('demo CTAs are wired everywhere they were asked for', () => {
  const nav = readFileSync('src/components/Navigation.tsx', 'utf8');
  const footer = readFileSync('src/components/Footer.tsx', 'utf8');
  const landing = readFileSync('src/pages/LandingV2.tsx', 'utf8');

  test('navigation, mobile menu, hero, pricing and footer', () => {
    expect(nav, 'no desktop nav CTA').toMatch(/placement="nav"/);
    expect(nav, 'no mobile menu CTA').toMatch(/placement="nav_mobile"/);
    expect(landing, 'no hero CTA').toMatch(/placement="hero"/);
    expect(landing, 'enterprise plan does not route to the demo').toMatch(/to: '\/demo'/);
    expect(footer, 'no footer link').toMatch(/'\/demo'/);
  });

  test('the mobile CTA closes the menu when followed', () => {
    // Otherwise the panel stays open over the destination.
    expect(nav).toMatch(/placement="nav_mobile"[\s\S]{0,140}onNavigate/);
  });
});
