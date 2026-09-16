import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ROUTE_TITLES } from '@/data/routeTitles';

/**
 * Resolves public/robots.txt the way RFC 9309 says a crawler must, then checks
 * what each real bot may fetch — rather than pattern-matching the file.
 *
 * Why: a crawler obeys ONLY the group(s) naming it and ignores `*` (RFC 9309
 * §2.2.1). This file has broken that way twice. A "User-agent: Googlebot /
 * Allow: /" group once made Googlebot and Bingbot ignore every Disallow; later
 * the OAI-SearchBot, ChatGPT-User and PerplexityBot groups carried a shorter
 * hand-copied list, letting them into tokenised /unsubscribe and
 * /funding/confirm links and /onboarding.
 */
type Rule = { allow: boolean; path: string };
type Group = { agents: string[]; rules: Rule[] };

function parse(text: string): Group[] {
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;
  for (const raw of text.split('\n')) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line);
    if (!m) throw new Error(`unparseable robots.txt line: "${raw}"`);
    const [, key, value] = m;
    const k = key.toLowerCase();
    if (k === 'user-agent') {
      if (!current || !lastWasAgent) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.trim().toLowerCase());
      lastWasAgent = true;
    } else if (k === 'allow' || k === 'disallow') {
      if (!current) throw new Error(`rule before any User-agent: "${raw}"`);
      if (value.trim() !== '') current.rules.push({ allow: k === 'allow', path: value.trim() });
      lastWasAgent = false;
    } else if (k === 'sitemap') {
      lastWasAgent = false;
    } else {
      throw new Error(`unknown robots.txt directive "${key}"`);
    }
  }
  return groups;
}

const groups = parse(readFileSync('public/robots.txt', 'utf8'));

/** The rules a crawler with this product token obeys, and whether `*` was used. */
function rulesFor(token: string): { rules: Rule[]; viaWildcard: boolean } {
  const named = groups.filter((g) => g.agents.includes(token.toLowerCase()));
  if (named.length) return { rules: named.flatMap((g) => g.rules), viaWildcard: false };
  return { rules: groups.filter((g) => g.agents.includes('*')).flatMap((g) => g.rules), viaWildcard: true };
}

const toRegex = (p: string) =>
  new RegExp('^' + p.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\\\$$|\$$/, '$'));

/** Longest matching rule wins; on a tie, Allow wins (RFC 9309 §2.2.2). */
function allowed(rules: Rule[], path: string): boolean {
  let best: Rule | null = null;
  for (const r of rules) {
    if (!toRegex(r.path).test(path)) continue;
    if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
  }
  return best ? best.allow : true;
}

const PUBLIC = [
  ...Object.keys(ROUTE_TITLES),
  '/blog/indigenous-business-grants-canada-guide',
  '/sitemap.xml',
  '/llms.txt',
];
const PRIVATE = [
  '/dashboard', '/dashboard/settings', '/admin', '/admin/users', '/api/anything',
  '/unsubscribe?token=abc', '/funding/confirm?token=abc', '/funding/unsubscribe?token=abc', '/onboarding',
];

const ANSWER_ENGINES = [
  'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'DuckAssistBot',
];
const TRAINING = ['GPTBot', 'Google-Extended', 'CCBot', 'anthropic-ai', 'ClaudeBot'];
const SEARCH_ENGINES = ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot'];

describe('robots.txt: what each crawler may actually fetch', () => {
  const wildcard = rulesFor('*').rules;

  test('everyone: public pages open, private and tokenised pages closed', () => {
    for (const p of PUBLIC) expect(allowed(wildcard, p), `* blocked from public ${p}`).toBe(true);
    for (const p of PRIVATE) expect(allowed(wildcard, p), `* allowed into private ${p}`).toBe(false);
  });

  test('sign-in pages stay fetchable so their noindex can be read', () => {
    for (const p of ['/auth', '/signup']) expect(allowed(wildcard, p)).toBe(true);
  });

  test('search engines have no group of their own, so they follow `*`', () => {
    // A named group would REPLACE `*` for that bot — the Googlebot bug.
    for (const bot of SEARCH_ENGINES) expect(rulesFor(bot).viaWildcard, `${bot} has its own group`).toBe(true);
  });

  for (const bot of ANSWER_ENGINES) {
    // Security first, as its own failure: a leak into tokenised links must not
    // be masked by an unrelated public-page difference reported before it.
    test(`${bot}: cannot fetch private or tokenised pages`, () => {
      const { rules } = rulesFor(bot);
      for (const p of PRIVATE) expect(allowed(rules, p), `${bot} may fetch private ${p}`).toBe(false);
    });

    test(`${bot}: named, and as open as \`*\` on public pages`, () => {
      const { rules, viaWildcard } = rulesFor(bot);
      expect(viaWildcard, `${bot} is not named — the policy should state it`).toBe(false);
      for (const p of PUBLIC) expect(allowed(rules, p), `${bot} and * disagree on ${p}`).toBe(allowed(wildcard, p));
    });
  }

  for (const bot of TRAINING) {
    test(`${bot}: training crawler blocked from everything`, () => {
      const { rules, viaWildcard } = rulesFor(bot);
      expect(viaWildcard).toBe(false);
      for (const p of [...PUBLIC, ...PRIVATE]) expect(allowed(rules, p), `${bot} may fetch ${p}`).toBe(false);
    });
  }

  test('the file points crawlers at the sitemap', () => {
    expect(readFileSync('public/robots.txt', 'utf8')).toMatch(/^Sitemap: https:\/\/www\.indigenousrising\.ai\/sitemap\.xml$/m);
  });
});

describe('the resolver itself', () => {
  // If the resolver were wrong, every test above could pass vacuously.
  test('longest match wins and Allow wins ties', () => {
    const rules: Rule[] = [{ allow: false, path: '/a' }, { allow: true, path: '/a/b' }, { allow: true, path: '/c' }, { allow: false, path: '/c' }];
    expect(allowed(rules, '/a/x')).toBe(false);
    expect(allowed(rules, '/a/b/x')).toBe(true);
    expect(allowed(rules, '/c')).toBe(true);
    expect(allowed(rules, '/z')).toBe(true);
  });

  test('a named group replaces `*` rather than adding to it', () => {
    const g = parse('User-agent: *\nDisallow: /secret\n\nUser-agent: Bot\nAllow: /\n');
    const bot = g.filter((x) => x.agents.includes('bot')).flatMap((x) => x.rules);
    expect(allowed(bot, '/secret')).toBe(true);
  });
});
