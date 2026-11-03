import { describe, test, expect } from 'vitest';
import { PLAN_EXAMPLES, EXAMPLES_NOTE, exampleTotal } from '../planExamples';
import { PLAN_TEMPLATE } from '../planTemplate';

describe('business plan examples', () => {
  test('every example fills exactly the six template sections', () => {
    const ids = PLAN_TEMPLATE.map((s) => s.id).sort();
    for (const e of PLAN_EXAMPLES) {
      expect(Object.keys(e.sections).sort(), e.name).toEqual(ids);
      for (const id of ids) expect(e.sections[id].length, `${e.name} ${id}`).toBeGreaterThan(80);
    }
  });

  test('each funding mix adds up to the start-up cost the plan states', () => {
    for (const e of PLAN_EXAMPLES) {
      expect(exampleTotal(e), e.name).toBe(e.startupTotal);
      const stated = e.startupTotal.toLocaleString('en-CA');
      expect(e.sections.financial, e.name).toContain(`$${stated}`);
      for (const f of e.funding) expect(e.sections.financial, `${e.name}: ${f.source}`).toContain(`$${f.amount.toLocaleString('en-CA')}`);
    }
  });

  test('the examples are labelled fictional and make no client claims', () => {
    expect(EXAMPLES_NOTE).toMatch(/fictional/);
    const all = JSON.stringify(PLAN_EXAMPLES);
    expect(all).not.toMatch(/client stor|success stor|testimonial|we helped/i);
  });

  test('community impact sections separate plans from what is already true', () => {
    for (const e of PLAN_EXAMPLES) expect(e.sections.community, e.name).toMatch(/Planned, not yet true/);
  });
});
