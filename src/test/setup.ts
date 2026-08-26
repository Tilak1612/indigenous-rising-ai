

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

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
