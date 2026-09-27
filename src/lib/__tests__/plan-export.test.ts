import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  htmlToPlainText,
  filledSections,
  planToHtmlDocument,
  planToPlainText,
  exportFilename,
} from '../plan-export';

/**
 * The Export menu used to be a lie:
 *
 *   toast.success(`Exporting as ${format.toUpperCase()}...`);
 *   // Implement actual export logic here
 *
 * It reported success and produced nothing, while /plan advertised "PDF
 * Export". These assert the builders produce real content, and that the
 * component actually calls them instead of toasting.
 */
const STEPS = [
  { id: 'vision', title: 'Vision & Mission' },
  { id: 'market', title: 'Market Analysis' },
  { id: 'financial', title: 'Financial Projections' },
];

const ON = new Date('2026-09-27T12:00:00Z');

describe('htmlToPlainText', () => {
  test('block boundaries become line breaks instead of running together', () => {
    expect(htmlToPlainText('<p>One</p><p>Two</p>')).toBe('One\nTwo');
    expect(htmlToPlainText('A<br>B')).toBe('A\nB');
  });

  test('list items keep their bullet', () => {
    expect(htmlToPlainText('<ul><li>First</li><li>Second</li></ul>')).toBe('- First\n- Second');
  });

  test('entities the editor emits are decoded', () => {
    expect(htmlToPlainText('<p>Tea&nbsp;&amp; Bannock &quot;Co&quot;</p>')).toBe('Tea & Bannock "Co"');
  });

  test('empty input stays empty rather than throwing', () => {
    expect(htmlToPlainText('')).toBe('');
    expect(htmlToPlainText('<p></p>')).toBe('');
  });
});

describe('filledSections', () => {
  test('a section with only markup and no words does not count as written', () => {
    const out = filledSections(STEPS, { vision: '<p></p>', market: '<p>Real text</p>' });
    expect(out.map((s) => s.title)).toEqual(['Market Analysis']);
  });

  test('sections keep the order of STEPS, not of the answers object', () => {
    const out = filledSections(STEPS, { financial: '<p>c</p>', vision: '<p>a</p>' });
    expect(out.map((s) => s.title)).toEqual(['Vision & Mission', 'Financial Projections']);
  });
});

describe('planToHtmlDocument', () => {
  const html = planToHtmlDocument('My Business Plan', STEPS, { vision: '<p>Serve our community.</p>' }, ON);

  test('is a complete standalone document', () => {
    expect(html).toMatch(/^<!DOCTYPE html>/);
    expect(html).toContain('</html>');
    expect(html).toContain('<title>My Business Plan</title>');
  });

  test('carries the written content and its heading', () => {
    expect(html).toContain('<h2>Vision &amp; Mission</h2>');
    expect(html).toContain('Serve our community.');
  });

  test('omits sections the user has not written', () => {
    expect(html).not.toContain('Market Analysis');
  });

  test('says where it came from and when', () => {
    expect(html).toContain('Exported from Indigenous Rising AI on');
    expect(html).toContain('2026');
  });

  test('an empty plan says so rather than producing a blank page', () => {
    expect(planToHtmlDocument('Empty', STEPS, {}, ON)).toContain('does not have any completed sections');
  });

  test('the title is escaped, so a stray angle bracket cannot break the document', () => {
    expect(planToHtmlDocument('A <b>bold</b> plan', STEPS, { vision: '<p>x</p>' }, ON))
      .toContain('<title>A &lt;b&gt;bold&lt;/b&gt; plan</title>');
  });
});

describe('planToPlainText', () => {
  const txt = planToPlainText('My Business Plan', STEPS, {
    vision: '<p>Serve our community.</p>',
    financial: '<ul><li>Year one revenue</li></ul>',
  }, ON);

  test('contains no markup — funder portals strip it', () => {
    expect(txt).not.toMatch(/<[a-z/][^>]*>/i);
  });

  test('keeps section headings and content', () => {
    expect(txt).toContain('Vision & Mission');
    expect(txt).toContain('Serve our community.');
    expect(txt).toContain('- Year one revenue');
  });

  test('ends with exactly one trailing newline', () => {
    expect(txt.endsWith('\n')).toBe(true);
    expect(txt.endsWith('\n\n')).toBe(false);
  });
});

describe('exportFilename', () => {
  test('is filesystem safe and dated', () => {
    expect(exportFilename('My Business Plan', 'doc', ON)).toBe('my-business-plan-2026-09-27.doc');
  });

  test('a title of only punctuation still yields a usable name', () => {
    expect(exportFilename('***', 'txt', ON)).toBe('business-plan-2026-09-27.txt');
  });
});

describe('the planner actually exports', () => {
  const planner = readFileSync('src/pages/dashboard/BusinessPlanner.tsx', 'utf8');

  test('handleExport builds a document instead of only toasting', () => {
    expect(planner).toMatch(/planToHtmlDocument\(/);
    expect(planner).toMatch(/planToPlainText\(/);
    // The exact shape of the old stub. If it ever returns, this fails.
    expect(planner).not.toMatch(/Implement actual export logic here/);
    expect(planner).not.toMatch(/toast\.success\(`Exporting as \$\{format/);
  });

  test('an empty plan is refused rather than downloading a blank file', () => {
    expect(planner).toMatch(/Write at least one section before exporting/);
  });

  test('a blocked pop-up is reported instead of silently doing nothing', () => {
    expect(planner).toMatch(/blocked the print window/);
  });
});

describe('/plan describes only what the planner does', () => {
  const page = readFileSync('src/pages/PublicPlan.tsx', 'utf8');

  // BusinessPlanner makes no AI call at all — the "AI Suggestions" button was
  // removed for having no handler — and has no template or benchmark code.
  test('claims no AI copilot the planner does not have', () => {
    expect(page).not.toMatch(/AI Copilot/i);
    expect(page).not.toMatch(/with AI Guidance/i);
  });

  test('claims no sector templates or industry benchmarks', () => {
    expect(page).not.toMatch(/Sector-Specific Templates/i);
    expect(page).not.toMatch(/industry benchmarks/i);
  });

  test('promises no funding or approval outcome', () => {
    expect(page).not.toMatch(/bank-ready/i);
    expect(page).not.toMatch(/winning business plan/i);
  });

  test('says a plan is preparation, not an application', () => {
    expect(page).toMatch(/preparation, not an application/i);
  });
});

describe('the planner really has no AI call', () => {
  // The guard above only makes sense while this stays true. If AI is wired in
  // later, this fails and tells you the marketing copy may be updated.
  test('BusinessPlanner makes no model or assistant request', () => {
    const planner = readFileSync('src/pages/dashboard/BusinessPlanner.tsx', 'utf8');
    expect(planner).not.toMatch(/functions\.invoke|ai-assistant|openai|anthropic/i);
  });
});
