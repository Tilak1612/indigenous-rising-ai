import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// A write that fails while the UI reports success is the defect that made
// the Funding save button appear to work for its entire life. These cover
// the other two places the same shape existed.

const USER = { id: 'u1', email: 'qa@example.test', user_metadata: {} };
let voteError: unknown = null;
let commentError: unknown = null;

const chain = (kind: 'vote' | 'comment') => ({
  delete: () => ({ eq: () => ({ eq: async () => ({ error: voteError }) }) }),
  insert: async () => ({ error: kind === 'vote' ? voteError : commentError }),
  select: () => ({
    eq: () => ({
      order: async () => ({ data: [], error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
      eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }),
    }),
  }),
});

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: USER, loading: false }) }));
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: (t: string) => chain(t === 'community_votes' ? 'vote' : 'comment'),
    auth: { getUser: async () => ({ data: { user: USER } }) },
  },
  SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'anon',
}));

import CommunityPost from '../CommunityPost';

const POST = {
  id: 'p1', title: 'A community post', body: 'Body text here.',
  display_name: 'Someone', created_at: '2026-08-01T00:00:00Z',
  upvotes: 3, category: 'general', status: 'approved',
};

beforeEach(() => {
  voteError = null;
  commentError = null;
  // The post itself loads over direct fetch, not supabase-js.
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('community_posts')) {
      return new Response(JSON.stringify(POST), {
        status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify([]), {
      status: 200, headers: { 'Content-Type': 'application/json' } });
  }));
});

const renderPost = () =>
  render(
    <MemoryRouter initialEntries={['/community/p1']}>
      <Routes><Route path="/community/:postId" element={<CommunityPost />} /></Routes>
    </MemoryRouter>,
  );

describe('a rejected vote does not stay on screen', () => {
  test('the count reverts and the user is told', async () => {
    voteError = { message: 'row-level security' };
    const user = userEvent.setup();
    renderPost();
    const upvote = await screen.findByRole('button', { name: /upvote this post/i });
    const before = upvote.textContent;
    await user.click(upvote);
    // Leaving the incremented count would tell the user their vote counted
    // when the row was rejected; it disappears on the next load.
    await waitFor(() => expect(screen.getByText(/could not save your vote/i)).toBeInTheDocument());
    await waitFor(() => expect(upvote.textContent).toBe(before));
  });
});

describe('a rejected comment does not destroy what was typed', () => {
  test('the text is kept and the failure is surfaced', async () => {
    commentError = { message: 'row-level security' };
    const user = userEvent.setup();
    renderPost();
    const box = await screen.findByPlaceholderText(/share your thoughts/i);
    await user.type(box, 'A thought worth keeping');
    const post = screen.getByRole('button', { name: /^post comment$/i });
    await user.click(post);
    await waitFor(() => expect(screen.getByText(/could not post your comment/i)).toBeInTheDocument());
    // The original bug cleared the box unconditionally.
    expect(box).toHaveValue('A thought worth keeping');
  });
});

describe('resource favourites actually persist', () => {
  test('the toast follows a real write, and the set survives a reload', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync('src/pages/dashboard/Resources.tsx', 'utf8');
    // Favourites lived in component state only: "Added to favorites" was
    // reported and the favourite was gone on the next render. There is no
    // favourites table, so this persists to the device.
    expect(src, 'favourites must be read back on mount').toMatch(
      /useState<Set<string>>\(\(\) => \{[\s\S]*localStorage\.getItem/);
    expect(src, 'favourites must be written on toggle').toMatch(
      /localStorage\.setItem\(FAVORITES_KEY/);
    // The success toast must sit after the write, not before it.
    const toggle = src.slice(src.indexOf('const toggleFavorite'));
    const write = toggle.indexOf('localStorage.setItem');
    const toast = toggle.indexOf('toast.success');
    expect(write, 'toggleFavorite never writes').toBeGreaterThan(-1);
    expect(toast, 'toggleFavorite never reports success').toBeGreaterThan(-1);
    expect(toast, 'success is reported before the write happens').toBeGreaterThan(write);
  });
});
