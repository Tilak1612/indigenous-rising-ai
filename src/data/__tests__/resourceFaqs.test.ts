import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { RESOURCE_FAQS } from '../resourceFaqs';
import { ROUTE_TITLES } from '../routeTitles';

const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const shell = readFileSync('src/components/resources/ResourcePage.tsx', 'utf8');

describe('resource page FAQs', () => {
  test('every FAQ route is a real prerendered page', () => {
    for (const route of Object.keys(RESOURCE_FAQS)) {
      expect(ROUTE_TITLES[route], route).toBeTruthy();
      expect(prerender, route).toContain(`{ p: '${route}'`);
    }
  });

  test('questions are real questions and answers are substantive', () => {
    for (const [route, faqs] of Object.entries(RESOURCE_FAQS)) {
      expect(faqs.length, route).toBeGreaterThanOrEqual(3);
      for (const f of faqs) {
        expect(f.question.trim().endsWith('?'), f.question).toBe(true);
        expect(f.answer.trim().length, f.question).toBeGreaterThan(60);
      }
    }
  });

  test('no answer promises funding or eligibility', () => {
    for (const faqs of Object.values(RESOURCE_FAQS)) {
      for (const f of faqs) expect(f.answer).not.toMatch(/guarantee|you will qualify|you qualify|approved for/i);
    }
  });

  test('the prerender and the page read the same module', () => {
    expect(prerender).toMatch(/loadDataModule\('src\/data\/resourceFaqs\.ts', 'RESOURCE_FAQS'\)/);
    expect(shell).toMatch(/from '@\/data\/resourceFaqs'/);
    expect(shell).not.toMatch(/FAQPage|application\/ld\+json/);
  });
});
