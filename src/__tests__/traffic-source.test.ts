import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { classifyTrafficSource, landingTrafficSource } from '@/lib/traffic-source';
import { trackEvent, trackAiReferral } from '@/utils/analytics';

const OWN = 'www.indigenousrising.ai';
const c = (referrer: string, search = '') => classifyTrafficSource(referrer, search, OWN);

describe('classifyTrafficSource', () => {
  test.each([
    ['https://chatgpt.com/', '', 'chatgpt', 'ai_assistant'],
    ['https://chat.openai.com/c/abc', '', 'chatgpt', 'ai_assistant'],
    ['https://www.perplexity.ai/search?q=x', '', 'perplexity', 'ai_assistant'],
    ['https://copilot.microsoft.com/', '', 'copilot', 'ai_assistant'],
    ['https://gemini.google.com/app', '', 'gemini', 'ai_assistant'],
    ['https://claude.ai/chat/1', '', 'claude', 'ai_assistant'],
    ['https://www.google.com/', '', 'google', 'organic_search'],
    ['https://www.google.ca/', '', 'google', 'organic_search'],
    ['https://www.bing.com/', '', 'bing', 'organic_search'],
    ['https://duckduckgo.com/', '', 'duckduckgo', 'organic_search'],
    ['https://nacca.ca/resources', '', 'nacca.ca', 'referral'],
    ['', '', '(direct)', 'direct'],
    [`https://${OWN}/pricing`, '', '(direct)', 'direct'],
    ['not a url', '', '(direct)', 'direct'],
  ])('%s %s → %s / %s', (referrer, search, source, medium) => {
    expect(c(referrer, search)).toEqual({ source, medium });
  });

  test('utm_source=chatgpt.com wins even with no referrer (documented by OpenAI)', () => {
    expect(c('', '?utm_source=chatgpt.com')).toEqual({ source: 'chatgpt', medium: 'ai_assistant' });
  });

  test('Gemini is an AI assistant, not Google search', () => {
    expect(c('https://gemini.google.com/').medium).toBe('ai_assistant');
  });

  test('a lookalike host is not trusted', () => {
    expect(c('https://chatgpt.com.evil.example/').medium).toBe('referral');
    expect(c('https://notclaude.ai/').medium).toBe('referral');
  });
});

describe('landing source is remembered without keeping the referrer', () => {
  beforeEach(() => sessionStorage.clear());

  test('stored once per session, as a classification only', () => {
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/search?q=my+private+query', configurable: true });
    const first = landingTrafficSource();
    expect(first).toEqual({ source: 'google', medium: 'organic_search' });
    const stored = Object.keys(sessionStorage).map((k) => sessionStorage.getItem(k)).join(' ');
    expect(stored).not.toMatch(/private|query|search\?q/);

    // later SPA navigation: referrer now looks internal, classification sticks
    Object.defineProperty(document, 'referrer', { value: `https://${OWN}/pricing`, configurable: true });
    expect(landingTrafficSource()).toEqual(first);
  });
});

describe('GA4 events carry the source', () => {
  beforeEach(() => {
    sessionStorage.clear();
    (window as unknown as { gtag: unknown }).gtag = vi.fn();
    Object.defineProperty(document, 'referrer', { value: 'https://www.perplexity.ai/', configurable: true });
  });

  test('conversion events include traffic_source and traffic_medium', () => {
    trackEvent('signup_cta_click', { placement: 'hero' });
    expect(window.gtag).toHaveBeenCalledWith('event', 'signup_cta_click',
      expect.objectContaining({ traffic_source: 'perplexity', traffic_medium: 'ai_assistant', placement: 'hero' }));
  });

  test('ai_referral fires once per session, only for AI assistants', () => {
    trackAiReferral();
    trackAiReferral();
    const calls = vi.mocked(window.gtag).mock.calls.filter((c) => c[1] === 'ai_referral');
    expect(calls).toHaveLength(1);
    expect(calls[0][2]).toMatchObject({ ai_source: 'perplexity' });

    sessionStorage.clear();
    vi.mocked(window.gtag).mockClear();
    Object.defineProperty(document, 'referrer', { value: 'https://www.google.com/', configurable: true });
    trackAiReferral();
    expect(vi.mocked(window.gtag).mock.calls.filter((c) => c[1] === 'ai_referral')).toHaveLength(0);
  });

  test('the app fires it on the landing page', () => {
    expect(readFileSync('src/App.tsx', 'utf8')).toMatch(/useEffect\(\(\) => \{\s*\n\s*\/\/[^\n]*\n\s*trackAiReferral\(\);\s*\n\s*\}, \[\]\);/);
  });
});
