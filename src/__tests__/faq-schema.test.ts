import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { siteFaqs } from '@/data/siteFaqs';

/**
 * /faq must ship FAQPage structured data in its STATIC HTML.
 *
 * A SearchFit audit on 2026-10-02 found /faq - the richest Q&A page on the site,
 * 14 questions - emitted no FAQPage schema in the prerendered HTML. The schema
 * existed only as a react-helmet injection at runtime, so any crawler that does
 * not execute JavaScript, which is most AI answer engines, never saw it.
 *
 * The data now lives in src/data/siteFaqs.ts and is read by BOTH the accordion
 * and the prerender, so the visible Q&A and the markup cannot drift apart.
 *
 * Moving it created a second hazard worth pinning: two guards (data-residency
 * and OCAP attribution) read the FAQ answer TEXT from the component file. Once
 * the text moved they would have failed - or, worse, passed vacuously on a file
 * that no longer held the wording they protect. They now read the data file, and
 * this asserts the component no longer holds answer text, so a guard pointed at
 * the wrong file is caught rather than silently weakened.
 */
const component = readFileSync('src/components/FAQSection.tsx', 'utf8');
const prerender = readFileSync('scripts/prerender.mjs', 'utf8');

describe('the FAQ data is a usable single source', () => {
  test('there are enough questions to be the real set', () => {
    expect(siteFaqs.length).toBeGreaterThanOrEqual(10);
  });

  test('every entry has a real question and a substantive answer', () => {
    for (const f of siteFaqs) {
      expect(f.question.trim().length, 'empty question').toBeGreaterThan(10);
      expect(f.answer.trim().length, `"${f.question}" has a thin answer`).toBeGreaterThan(40);
    }
  });

  test('no question is duplicated', () => {
    const qs = siteFaqs.map((f) => f.question);
    expect(qs.filter((q, i) => qs.indexOf(q) !== i)).toEqual([]);
  });
});

describe('the component renders the data and no longer injects schema at runtime', () => {
  test('it reads the shared data file', () => {
    expect(component).toMatch(/from '@\/data\/siteFaqs'/);
  });

  test('it holds no answer text of its own — the guards read the data file', () => {
    expect(component).not.toMatch(/Canadian servers/);
    expect(component).not.toMatch(/answer:\s*['"`]/);
  });

  test('it no longer injects FAQPage through Helmet, which would double-emit', () => {
    // A static copy plus a runtime copy gives two FAQPage nodes after hydration.
    expect(component).not.toMatch(/react-helmet-async/);
    expect(component).not.toMatch(/FAQPage/);
    expect(component).not.toMatch(/application\/ld\+json/);
  });

  test('answers stay in the DOM when collapsed, so schema matches visible content', () => {
    expect(component).toMatch(/hidden=\{!open\}/);
  });
});

describe('the prerender emits it', () => {
  test('/faq is fed from the same module the page renders', () => {
    expect(prerender).toMatch(/loadDataModule\('src\/data\/siteFaqs\.ts', 'siteFaqs'\)/);
    expect(prerender).toMatch(/m\.p === '\/faq'/);
  });
});

const built = 'dist/faq/index.html';
describe.runIf(existsSync(built))('the built /faq carries the schema', () => {
  const html = readFileSync(built, 'utf8');
  const nodes = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].flatMap(
    (m) => {
      const d = JSON.parse(m[1]);
      return Array.isArray(d) ? d : [d];
    },
  );
  const faqPages = nodes.filter((n) => n && n['@type'] === 'FAQPage');

  test('there is exactly one FAQPage, not zero and not a runtime duplicate', () => {
    expect(faqPages.length).toBe(1);
  });

  test('it covers every question, in order', () => {
    const names = faqPages[0].mainEntity.map((q: { name: string }) => q.name);
    expect(names).toEqual(siteFaqs.map((f) => f.question));
  });

  test('every question and answer in the schema is visible in the page HTML', () => {
    // "Never add schema that is unsupported by visible page content."
    const text = html
      .replace(/<script[\s\S]*?<\/script>/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ');
    for (const q of faqPages[0].mainEntity) {
      const norm = (s: string) => s.replace(/\s+/g, ' ').slice(0, 70);
      expect(text, `question not visible: ${q.name}`).toContain(norm(q.name));
      expect(text, `answer not visible: ${q.name}`).toContain(norm(q.acceptedAnswer.text));
    }
  });

  test('the OCAP answer in the schema credits FNIGC', () => {
    const ocap = faqPages[0].mainEntity.find((q: { name: string }) => /OCAP/.test(q.name));
    expect(ocap).toBeDefined();
    expect(ocap.acceptedAnswer.text).toMatch(/First Nations Information Governance Centre|FNIGC/);
  });

  test('every JSON-LD block on the page parses and none leaks "undefined"', () => {
    for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)) {
      expect(() => JSON.parse(m[1])).not.toThrow();
      expect(m[1]).not.toContain('undefined');
    }
  });
});
