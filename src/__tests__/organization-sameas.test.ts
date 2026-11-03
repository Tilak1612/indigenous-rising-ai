import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const footer = readFileSync('src/components/Footer.tsx', 'utf8');

const orgBlock = (() => {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return blocks.map((b) => JSON.parse(b)).find((o) => o['@id'] === 'https://www.indigenousrising.ai/#organization');
})();

describe('Organization sameAs', () => {
  test('the Organization node lists only verified profiles', () => {
    expect(orgBlock, 'no Organization JSON-LD in index.html').toBeTruthy();
    expect(orgBlock.sameAs).toEqual([
      'https://www.linkedin.com/company/indigenous-rising-ai/',
      'https://www.facebook.com/people/Indigenous-Rising/61586961796822/',
    ]);
  });

  test('every footer social link is also a sameAs profile, and vice versa', () => {
    const hrefs = [...footer.matchAll(/href: '(https:\/\/[^']+)'/g)].map((m) => m[1]);
    expect(hrefs.sort()).toEqual([...orgBlock.sameAs].sort());
  });

  test('the accounts found to belong to other organizations never come back', () => {
    const all = html + footer;
    for (const bad of ['linkedin.com/company/indigenous-ai/', "linkedin.com/company/indigenous-ai'", 'twitter.com/indigenous_ai', 'youtube.com/@indigenousai']) {
      expect(all.replace(/\/\/.*$/gm, ''), bad).not.toContain(bad);
    }
  });
});
