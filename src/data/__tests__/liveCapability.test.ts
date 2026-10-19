import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  LIVE_FOR_ORGANISATIONS,
  ROADMAP_FOR_ORGANISATIONS,
  DATA_FACTS,
} from '../liveCapability';

/**
 * The role and sovereignty pages must not sell unbuilt software.
 *
 * These are the highest-risk pages on the site. They sit next to Nations-tier
 * features that are NOT built — the OCAP governance console, the government
 * reporting module, white-label, multi-entity, custom AI training — and they
 * target Nations and funders rather than individuals.
 *
 * /plan was already found selling "sector-specific templates" and an "AI
 * Copilot" that do not exist. This is the same trap at higher stakes.
 *
 * So the guard is MECHANICAL rather than editorial: it reads every
 * `available: false` feature string out of plans.ts and asserts none of them is
 * described on these pages as something the platform does. If someone builds
 * the governance console and flips the flag, this stops objecting on its own —
 * the guard tracks the product, not a hand-maintained deny-list.
 */
const plans = readFileSync('src/data/plans.ts', 'utf8');

const unbuilt = [
  ...plans.matchAll(/text: '([^']+)', available: false/g),
  ...plans.matchAll(/text: "([^"]+)", available: false/g),
].map((m) => m[1]);

const PAGES = [
  'src/pages/ForEconomicDevelopmentOfficers.tsx',
  'src/pages/ForFunders.tsx',
  'src/pages/DataSovereignty.tsx',
];

/** Distinctive words from an unbuilt feature, ignoring filler. */
const keyTerms = (feature: string) =>
  feature
    .toLowerCase()
    .replace(/[^a-z0-9® ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !['your', 'with', 'support', 'business', 'businesses'].includes(w));

describe('the guard itself is wired to the product', () => {
  test('plans.ts actually yields unbuilt features, or every check below is vacuous', () => {
    expect(unbuilt.length).toBeGreaterThanOrEqual(8);
    expect(unbuilt).toContain('OCAP® data governance console');
  });
});

describe('no page presents an unbuilt feature as live', () => {
  test.each(PAGES)('%s lists unbuilt features only under roadmap', (file) => {
    const src = readFileSync(file, 'utf8');
    // The live list and the roadmap list are separate exports. A page may name
    // an unbuilt feature only by rendering ROADMAP_FOR_ORGANISATIONS.
    const live = JSON.stringify(
      file.includes('DataSovereignty') ? DATA_FACTS : LIVE_FOR_ORGANISATIONS,
    ).toLowerCase();
    for (const feature of unbuilt) {
      const terms = keyTerms(feature);
      const allPresent = terms.length > 0 && terms.every((t) => live.includes(t));
      expect(allPresent, `live list describes unbuilt feature: ${feature}`).toBe(false);
    }
    expect(src).toContain('ROADMAP_FOR_ORGANISATIONS');
  });

  test('the roadmap list names the features that are actually unbuilt', () => {
    const roadmap = ROADMAP_FOR_ORGANISATIONS.join(' ').toLowerCase();
    for (const marker of ['governance console', 'reporting module', 'white-label']) {
      expect(roadmap, `roadmap omits ${marker}`).toContain(marker);
    }
  });

  test('every roadmap item corresponds to something plans.ts marks unavailable', () => {
    const unbuiltBlob = unbuilt.join(' ').toLowerCase();
    for (const item of ROADMAP_FOR_ORGANISATIONS) {
      const terms = keyTerms(item).filter((t) => t.length > 5);
      const anyMatch = terms.some((t) => unbuiltBlob.includes(t));
      expect(anyMatch, `roadmap item not backed by plans.ts: ${item}`).toBe(true);
    }
  });
});

describe('the pages state their limits, not only their strengths', () => {
  test('each page has a section naming what is not built', () => {
    for (const f of PAGES) expect(readFileSync(f, 'utf8')).toMatch(/Not built yet/);
  });

  test('the EDO page concedes the directory is small', () => {
    expect(readFileSync('src/pages/ForEconomicDevelopmentOfficers.tsx', 'utf8')).toMatch(
      /17 programmes[\s\S]{0,120}small/,
    );
  });

  test('the funder page says it does not administer or adjudicate funding', () => {
    const src = readFileSync('src/pages/ForFunders.tsx', 'utf8');
    expect(src).toMatch(/do not administer funding/i);
    expect(src).toMatch(/grants management system/i);
  });

  test('the sovereignty page refuses the certification claim explicitly', () => {
    const src = readFileSync('src/pages/DataSovereignty.tsx', 'utf8');
    expect(src).toMatch(/not certified/i);
    expect(src).toMatch(/First Nations Information Governance Centre/);
    // Must not CLAIM certification. Disclaiming it is the point of the page,
    // so "rather than OCAP-certified" has to pass — an earlier version of this
    // assertion flagged the word itself and failed on the page's own denial.
    expect(src).not.toMatch(/(?:we are|we're|is|fully)\s+OCAP®?[- ]?certified/i);
    expect(src).not.toMatch(/OCAP®?[- ]?certifi\w*\s+(?:platform|software|by)/i);
  });

  test('the sovereignty page renders data facts, not the funding feature list', () => {
    // An earlier draft rendered LIVE_FOR_ORGANISATIONS here, so the page about
    // data handling would have listed funding matches and deadline alerts.
    const src = readFileSync('src/pages/DataSovereignty.tsx', 'utf8');
    expect(src).toContain('DATA_FACTS');
    expect(src).not.toContain('LIVE_FOR_ORGANISATIONS');
  });
});

describe('data facts are checkable claims', () => {
  test('residency, export and the crawler policy are all stated', () => {
    const blob = JSON.stringify(DATA_FACTS).toLowerCase();
    expect(blob).toContain('ca-central-1');
    expect(blob).toContain('export');
    expect(blob).toContain('gptbot');
  });

  test('the crawler claim matches robots.txt', () => {
    const robots = readFileSync('public/robots.txt', 'utf8');
    for (const bot of ['GPTBot', 'CCBot', 'Google-Extended']) {
      expect(robots, `robots.txt does not block ${bot}`).toMatch(
        new RegExp(`User-agent: ${bot}\\s*\\nDisallow: /`),
      );
    }
  });
});
