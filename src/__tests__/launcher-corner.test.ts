import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const widget = readFileSync('src/components/marketing/SiteAssistant.tsx', 'utf8');
const blog = readFileSync('src/pages/BlogPost.tsx', 'utf8');

// Phones: the launcher owns the bottom-right corner (the a11y gear is hidden
// below md since #189, so the raised position just looked un-anchored).
// md and up: raised above the gear, as before.
describe('floating-control choreography on phones', () => {
  test('the launcher and its panel sit in the corner on phones, raised from md', () => {
    const spots = widget.match(/fixed bottom-4 md:bottom-20 right-4/g) ?? [];
    expect(spots, 'both the launcher and the panel need the responsive anchor').toHaveLength(2);
    expect(widget).not.toMatch(/fixed bottom-20 right-4/);
  });

  test('the blog back-to-top stacks above the launcher on phones', () => {
    // At the old bottom-8 right-8 it overlapped a corner-anchored launcher
    // once 500px of scroll revealed it.
    expect(blog).toMatch(/fixed bottom-20 right-4 md:bottom-8 md:right-8/);
  });

  test('the blog back-to-top has an accessible name', () => {
    // Icon-only ChevronUp with no name — missed by the dashboard sweep
    // because blog posts were not in it.
    expect(blog).toMatch(/aria-label="Back to top"/);
  });
});
