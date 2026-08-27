

// jsdom has no matchMedia. useIsMobile() calls it on mount, so anything
// rendering the dashboard shell throws without this. Driven by window.innerWidth
// so a test can set a viewport width and get the matching result.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => {
    const m = /max-width:\s*(\d+)px/.exec(query);
    const matches = m ? window.innerWidth <= Number(m[1]) : false;
    return {
      matches, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
}

// Radix primitives (Select, Dropdown, Popover) call the Pointer Capture API on
// open. jsdom implements none of it, so any test that opens a Select fails with
// "Unable to find role=option" — the listbox never renders. These are browser
// APIs the components legitimately use.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = function setPointerCapture() { /* no-op */ };
  Element.prototype.releasePointerCapture = function releasePointerCapture() { /* no-op */ };
}

// jsdom implements neither of these. They are browser APIs the app legitimately
// uses, so they are stubbed here rather than worked around in product code.
// Element.scrollTo is missing entirely — Assistant scrolls its transcript to the
// latest message on mount, which threw "scrollRef.current?.scrollTo is not a
// function" and took the whole page down in tests while working fine in a
// browser.
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = function scrollTo() { /* no-op in jsdom */ };
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView() { /* no-op in jsdom */ };
}

// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import { configure } from '@testing-library/react';

// waitFor/findBy carry their own 1s budget, independent of vitest's
// testTimeout. Under CPU contention an awaited write settles later than
// that and the assertion reports a failure that is not a defect.
configure({ asyncUtilTimeout: 10_000 });

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
