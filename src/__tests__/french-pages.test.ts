import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { ROUTE_TITLES } from '@/data/routeTitles';

const prerender = readFileSync('scripts/prerender.mjs', 'utf8');
const page = readFileSync('src/pages/fr/FrenchGuide.tsx', 'utf8');
const ROUTES = ['/fr/financement-entreprise-autochtone', '/fr/plan-affaires-entreprise-autochtone'];

describe('French pages', () => {
  test('each route is prerendered as fr-CA with a title', () => {
    for (const r of ROUTES) {
      expect(ROUTE_TITLES[r], r).toBeTruthy();
      expect(prerender).toContain(`{ p: '${r}', lang: 'fr-CA'`);
    }
    expect(prerender).toMatch(/inLanguage: m\.lang \|\| 'en-CA'/);
  });

  test('the body is marked French and both pages say the product is in English', () => {
    expect(page).toMatch(/<article lang="fr-CA"/);
    expect(page).toMatch(/Le répertoire et la plateforme sont actuellement offerts en anglais/);
    expect(page).toMatch(/sont actuellement en anglais/);
  });

  const built = ROUTES.map((r) => `dist${r}/index.html`);
  test.runIf(built.every((f) => existsSync(f)))('the static HTML declares French', () => {
    for (const f of built) {
      const html = readFileSync(f, 'utf8');
      expect(html, f).toMatch(/<html lang="fr-CA">/);
      expect(html, f).toMatch(/property="og:locale" content="fr_CA"/);
      expect(html, f).toMatch(/"inLanguage":"fr-CA"/);
    }
  });
});
