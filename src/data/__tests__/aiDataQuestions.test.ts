import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { OUR_AI_FEATURES, OUR_ANSWERS, AI_QUESTIONS } from '../aiDataQuestions';
import { siteFaqs } from '../siteFaqs';

const policy = readFileSync('src/pages/PrivacyPolicy.tsx', 'utf8').replace(/\s+/g, ' ');
const fn = (name: string) => readFileSync(`supabase/functions/${name}/index.ts`, 'utf8');

describe('AI data questions guide agrees with the code and the policy', () => {
  test('each feature names the provider its edge function actually calls', () => {
    const byFeature = Object.fromEntries(OUR_AI_FEATURES.map((f) => [f.feature, f.provider]));
    expect(byFeature['Funding matching']).toBe('OpenAI');
    expect(fn('match-funding-opportunities')).toMatch(/api\.openai\.com/);
    expect(byFeature['Member assistant']).toBe('OpenAI');
    expect(fn('ai-assistant')).toMatch(/api\.openai\.com/);
    expect(byFeature['Ask Agent']).toBe('Anthropic');
    expect(fn('site-assistant')).toMatch(/api\.anthropic\.com/);
  });

  test('the privacy policy names all three features and both providers', () => {
    for (const s of ['Funding matching (OpenAI)', 'Member assistant (OpenAI)', 'Site assistant (Anthropic)']) expect(policy).toContain(s);
    expect(policy).toMatch(/which may be outside Canada/);
  });

  test('the guide does not claim AI processing in Canada', () => {
    expect(OUR_ANSWERS.processing).toMatch(/may be outside Canada/);
    expect(JSON.stringify(OUR_AI_FEATURES)).not.toMatch(/processed in Canada/i);
  });

  test('the site FAQ mentions both providers', () => {
    const faq = siteFaqs.find((f) => /stored in Canada/.test(f.question))!;
    expect(faq.answer).toMatch(/OpenAI/);
    expect(faq.answer).toMatch(/Anthropic/);
  });

  test('every question carries a reason and a good answer', () => {
    for (const q of AI_QUESTIONS) {
      expect(q.why.length).toBeGreaterThan(40);
      expect(q.goodAnswer.length).toBeGreaterThan(20);
    }
  });
});
