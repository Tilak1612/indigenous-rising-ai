import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { PLAN_TEMPLATE, templateAsText, TEMPLATE_FILENAME } from '../planTemplate';

/**
 * The template's whole claim is that it is the SAME structure the free planner
 * walks you through, not a generic template with an Indigenous label on it.
 * That claim is only true while the two stay in step, so it is asserted rather
 * than trusted.
 */
describe('the template matches the product', () => {
  const planner = readFileSync('src/pages/dashboard/BusinessPlanner.tsx', 'utf8');
  const steps = [...planner.matchAll(/\{\s*id:\s*'([a-z]+)',\s*title:\s*'([^']+)'/g)].map((m) => ({
    id: m[1],
    title: m[2],
  }));

  test('the planner STEPS were found, or this whole suite is vacuous', () => {
    expect(steps.length).toBeGreaterThanOrEqual(6);
  });

  test('every planner section exists in the template, in the same order', () => {
    expect(PLAN_TEMPLATE.map((s) => s.id)).toEqual(steps.map((s) => s.id));
  });

  test('the template invents no section the planner does not have', () => {
    expect(PLAN_TEMPLATE.length).toBe(steps.length);
  });
});

describe('the template is usable', () => {
  test('every section carries a purpose and real prompts', () => {
    for (const s of PLAN_TEMPLATE) {
      expect(s.purpose.length, `${s.id} has no purpose`).toBeGreaterThan(20);
      expect(s.prompts.length, `${s.id} has too few prompts`).toBeGreaterThanOrEqual(4);
      // Each prompt is a real instruction, not a label. Most are questions;
      // a few are a question followed by guidance ("...? Use quotes, not
      // estimates"), and one is an imperative list, so assert substance
      // rather than punctuation.
      for (const p of s.prompts) {
        expect(p.trim().length, `${s.id}: "${p}" is too thin`).toBeGreaterThan(24);
      }
      const questions = s.prompts.filter((p) => p.includes('?')).length;
      expect(questions, `${s.id} reads as labels, not questions`).toBeGreaterThanOrEqual(3);
    }
  });

  test('Community Impact is present — it is the reason this template differs', () => {
    const community = PLAN_TEMPLATE.find((s) => s.id === 'community');
    expect(community).toBeDefined();
    expect(community!.prompts.join(' ')).toMatch(/communit/i);
  });

  test('the text download contains every section and a fill-in space', () => {
    const txt = templateAsText();
    for (const s of PLAN_TEMPLATE) expect(txt).toContain(s.title);
    expect(txt).toContain('YOUR ANSWER:');
    expect(txt).toMatch(/\[ \]/);
  });

  test('the download is plain text with no markup', () => {
    expect(templateAsText()).not.toMatch(/<[a-z/][^>]*>/i);
    expect(TEMPLATE_FILENAME).toMatch(/\.txt$/);
  });
});

describe('the page promises nothing it cannot deliver', () => {
  const page = readFileSync('src/pages/PlanTemplate.tsx', 'utf8');

  test('no funding or approval outcome is promised', () => {
    expect(page).not.toMatch(/bank-ready|winning business plan|guaranteed|get you funded/i);
    expect(page).toMatch(/preparation, not an application/i);
  });

  test('no AI claim — the planner makes no model call', () => {
    expect(page).not.toMatch(/\bAI[- ](copilot|guidance|assistant)\b/i);
  });

  test('the template download needs no account, as the page says', () => {
    // The download is a client-side Blob; if it ever moves behind auth this
    // assertion should be revisited along with the copy.
    expect(page).toMatch(/no account needed/i);
    expect(page).toMatch(/new Blob\(/);
  });
});

describe('the route is registered everywhere it must be', () => {
  const slug = '/indigenous-business-plan-template';

  test.each([
    ['src/App.tsx', 'the route'],
    ['src/data/routeTitles.ts', 'the shared title'],
    ['scripts/prerender.mjs', 'the prerender list'],
  ])('%s carries it (%s)', (file) => {
    expect(readFileSync(file, 'utf8')).toContain(slug);
  });

  test('the title fits a search result once the site suffix is added', () => {
    const titles = readFileSync('src/data/routeTitles.ts', 'utf8');
    const m = new RegExp(`'${slug}':\\s*'([^']+)'`).exec(titles);
    expect(m, 'no title registered').not.toBeNull();
    expect(m![1].length).toBeLessThanOrEqual(60);
  });
});
