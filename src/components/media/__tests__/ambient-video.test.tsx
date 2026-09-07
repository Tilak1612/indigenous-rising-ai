import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import AmbientVideo from '../AmbientVideo';

/**
 * Background motion must cost nothing when it is unwanted.
 *
 * Every gate fails CLOSED to the poster, and the <video> is not rendered at
 * all when a gate fails — so nothing is requested, rather than merely
 * deferred by preload="none". Verified in a real browser at 1440px
 * (playing, muted, fetched), at 1440px with reduced motion (0 elements,
 * never fetched) and at 375px (0 elements, never fetched).
 */
const PROPS = {
  webm: '/video/hero-ambient.webm',
  mp4: '/video/hero-ambient.mp4',
  poster: '/video/hero-ambient-poster.jpg',
  posterAvif: '/video/hero-ambient-poster.avif',
  posterWebp: '/video/hero-ambient-poster.webp',
};

let reduced = false;
let width = 1440;
let observerCb: ((e: { isIntersecting: boolean }[]) => void) | null = null;

beforeEach(() => {
  reduced = false; width = 1440; observerCb = null;
  Object.defineProperty(window, 'innerWidth', { configurable: true, get: () => width });
  window.matchMedia = ((q: string) => ({
    matches: q.includes('prefers-reduced-motion') ? reduced : false,
    media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  // deterministic IntersectionObserver
  class IO {
    constructor(cb: (e: { isIntersecting: boolean }[]) => void) { observerCb = cb; }
    observe() { /* triggered manually */ }
    disconnect() {}
    unobserve() {}
  }
  vi.stubGlobal('IntersectionObserver', IO as unknown as typeof IntersectionObserver);
  window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
  window.HTMLMediaElement.prototype.pause = vi.fn();
});
afterEach(() => vi.unstubAllGlobals());

/**
 * Fires the observer INSIDE act() so React flushes before we assert.
 * Without that flush the "no video" assertions passed even with the gate
 * removed — the state change had not rendered yet, so removing the
 * reduced-motion and breakpoint checks did not fail anything.
 */
const enterView = async () => {
  await waitFor(() => expect(observerCb).not.toBeNull());
  await act(async () => { observerCb!([{ isIntersecting: true }]); });
};

/** For the gated cases: the observer must never even be registered. */
const settle = async () => { await act(async () => { await Promise.resolve(); }); };

describe('ambient background motion', () => {
  test('reduced motion renders the poster and never a video element', async () => {
    reduced = true;
    const { container } = render(<AmbientVideo {...PROPS} />);
    await settle();
    // The gate runs before observe(), so a working gate never registers one.
    expect(observerCb, 'an observer was registered despite reduced motion').toBeNull();
    if (observerCb) await act(async () => { observerCb!([{ isIntersecting: true }]); });
    expect(container.querySelector('video'), 'a video was rendered despite reduced motion').toBeNull();
    expect(container.querySelector('img')).toBeTruthy();
  });

  test('below the breakpoint renders the poster and never a video element', async () => {
    width = 375;
    const { container } = render(<AmbientVideo {...PROPS} />);
    await settle();
    expect(observerCb, 'an observer was registered on a phone-width viewport').toBeNull();
    if (observerCb) await act(async () => { observerCb!([{ isIntersecting: true }]); });
    expect(container.querySelector('video'), 'a phone was served the video').toBeNull();
    expect(container.querySelector('img')).toBeTruthy();
  });

  test('on a wide viewport it plays once scrolled into view', async () => {
    const { container } = render(<AmbientVideo {...PROPS} />);
    expect(container.querySelector('video'), 'video existed before it was in view').toBeNull();
    await enterView();
    await waitFor(() => expect(container.querySelector('video')).toBeTruthy());
    // The first intersection sets state before the element exists, so playback
    // has to be driven by an effect after mount — doing it inline left the
    // video mounted and paused forever.
    await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled());
  });

  test('the video is silent, looping and inline', async () => {
    const { container } = render(<AmbientVideo {...PROPS} />);
    await enterView();
    const v = await waitFor(() => {
      const el = container.querySelector('video');
      expect(el).toBeTruthy();
      return el!;
    });
    expect(v).toHaveAttribute('loop');
    expect(v).toHaveAttribute('playsinline');
    expect(v).toHaveAttribute('preload', 'none');
    expect((v as HTMLVideoElement).muted || v.hasAttribute('muted')).toBe(true);
    expect(v).toHaveAttribute('poster', PROPS.poster);
  });

  test('it is decorative and never focusable', async () => {
    const { container } = render(<AmbientVideo {...PROPS} />);
    await enterView();
    const host = container.firstElementChild!;
    expect(host).toHaveAttribute('aria-hidden', 'true');
    await waitFor(() => {
      const v = container.querySelector('video');
      expect(v).toBeTruthy();
      expect(v).toHaveAttribute('tabindex', '-1');
    });
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('it pauses when it leaves the viewport', async () => {
    render(<AmbientVideo {...PROPS} />);
    await enterView();
    await waitFor(() => expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled());
    observerCb!([{ isIntersecting: false }]);
    await waitFor(() => expect(window.HTMLMediaElement.prototype.pause).toHaveBeenCalled());
  });
});
