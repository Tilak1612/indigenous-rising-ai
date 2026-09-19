# Dashboard measurement harness

Renders the **real** app — real routes, real `ProtectedRoute`, real
`DashboardLayout` — with `useAuth` and `useSubscription` aliased to stubs, so
dashboard pages can be measured in a browser without credentials.

```bash
npm run dev:harness   # http://127.0.0.1:5199
```

It is never part of a build: nothing in `src/` imports it, and the stubs are
reachable only through `--config vite.harness.config.ts`. A test
(`vite-harness-isolation.test.ts`) enforces both.

## Why it exists

Dashboard layout bugs are invisible to the unit tests, because jsdom has no
layout engine. Three real defects were found with it and none were reachable
any other way:

- `SidebarInset` lacked `min-w-0`, so the content pane could not shrink below
  its widest child — 535px on a 375px viewport.
- `Compliance` and `Resources` used bare `<TabsList>` (392px and 439px against
  ~278px available).

## Two traps, both of which produced wrong answers before being fixed

1. **cwd.** postcss, tailwind, and tailwind's *relative* `content` globs all
   resolve from `process.cwd()`. Launched from elsewhere they silently scan
   nothing, Tailwind emits ~189 rules instead of ~1300, and the app renders
   essentially unstyled — while still looking like a working page. Every
   measurement taken that way is worthless. `vite.harness.config.ts` pins cwd.
2. **Trusting a clean result.** The first full sweep reported 24/25 routes
   clean; it was measuring the unstyled page. Any sweep must first assert that
   a known utility (e.g. `.overflow-x-auto`) exists in `document.styleSheets`
   and abort otherwise.

## Viewport parity sweep

```bash
npm run dev:harness                      # terminal 1
node .harness/viewport-sweep.mjs         # terminal 2 — free, growth, enterprise
SWEEP_ROUTES=/dashboard node .harness/viewport-sweep.mjs free   # a quick subset
```

Headless Chrome with real viewport emulation — 1280x800, 768x1024 (touch),
375x812 (touch, mobile). For every tier and dashboard route it records visible
controls, headings, header controls, every tab panel, the header menus and the
sidebar (opened via its trigger on phones), then reports anything on desktop
that is missing on a smaller width, plus overflow, off-screen controls and
touch targets under 24px. Exits 1 on any finding.

The tier comes from `localStorage['harness-tier']` (`free` | `growth` |
`enterprise`), read by `.harness/useSubscription.tsx`.

Settle on stable content, not first content: the first version captured a
transient "No matches found" on /dashboard/funding — which was a real bug on
every width, not a mobile one.
