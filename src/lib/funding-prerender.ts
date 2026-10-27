import type { FundingProgram } from '@/lib/funding-catalog';

/**
 * Build-time data seed. scripts/prerender.mjs fetches the published catalogue
 * once and exposes it on globalThis before rendering each route, so the
 * server-rendered HTML carries real programme content (crawlers that do not
 * run JavaScript see it, and the CI word-count gate passes). In the browser
 * the global is absent and the pages fetch live data instead.
 */
declare global {
  var __IR_FUNDING__: { programs: FundingProgram[] } | undefined;
}

export function seededPrograms(): FundingProgram[] | null {
  const seed = typeof globalThis !== 'undefined' ? globalThis.__IR_FUNDING__ : undefined;
  return seed && Array.isArray(seed.programs) && seed.programs.length ? seed.programs : null;
}
