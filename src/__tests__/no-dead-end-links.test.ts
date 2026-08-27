import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Every internal <Link to="..."> must resolve to a route registered in
 * App.tsx. Three did not: /dashboard/activity, /dashboard/learning and
 * /dashboard/notifications. They fell through to the catch-all and
 * rendered NotFound, so the affordance advertised a page that was never
 * built — and the activity one only appeared once the user HAD activity,
 * meaning the people most likely to click it had something to look at.
 */
const app = readFileSync('src/App.tsx', 'utf8');
const ROUTES = [...app.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((e) => {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) return e === '__tests__' ? [] : walk(full);
    return /\.tsx$/.test(e) ? [full] : [];
  });

/** Matches identically, or via a dynamic segment such as /blog/:slug. */
const isRegistered = (target: string) => {
  if (ROUTES.includes(target)) return true;
  const parts = target.split('/');
  return ROUTES.some((route) => {
    const rp = route.split('/');
    if (rp.length !== parts.length) return false;
    return rp.every((seg, i) => seg.startsWith(':') || seg === parts[i]);
  });
};

describe('no link points at a route that does not exist', () => {
  test('every internal Link target is registered in App.tsx', () => {
    const dead: string[] = [];
    for (const file of walk('src')) {
      const src = readFileSync(file, 'utf8');
      for (const m of src.matchAll(/<Link\b[^>]*\sto="(\/[^"{}]*)"/g)) {
        const target = m[1].split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
        if (isRegistered(target)) continue;
        const line = src.slice(0, m.index).split('\n').length;
        dead.push(`${file}:${line} -> ${target}`);
      }
    }
    expect(dead).toEqual([]);
  });

  test('the route table was actually parsed', () => {
    // Without this a parsing change yielding [] would silently flip the
    // meaning of the check above.
    expect(ROUTES.length).toBeGreaterThan(20);
    expect(ROUTES).toContain('/dashboard');
  });
});
