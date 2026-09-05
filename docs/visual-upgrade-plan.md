# Visual upgrade — audit and Higgsfield asset plan

Deliverable for approval. **Nothing below is implemented yet.**

---

## 1. Audit

### What already exists (reuse, do not rebuild)

| Capability | State | Decision |
|---|---|---|
| Scroll reveal | `[data-reveal]` + IntersectionObserver, 25 uses, graceful fallback when IO is absent | **Reuse.** Do not add framer-motion — it would duplicate working code and add ~50KB |
| Reduced motion | Global rule in `index.css:243` collapses animation/transition durations | Reuse, but see defect R1 |
| Hover states | `.irv2-hov-*` classes in `landing-v2.css` | Extend the same pattern |
| Prerendering | 74 static routes, SSR via `renderToPipeableStream` | Any media must not break it |
| OG per route | `img:` field in `prerender.mjs`, guarded by tests | Reuse for new social cards |
| Image encoding | **ffmpeg 8.1.2 with libsvtav1 + libvpx-vp9** | AVIF, WebM and posters all possible with no new dependency |

**Correction to what I told you earlier:** I said AVIF needed a new dependency. That was wrong — I checked for `cwebp`, `avifenc` and `sharp` but not ffmpeg, which was installed the whole time. Measured on the existing backdrop: **AVIF 16K vs WebP 20K vs JPEG 100K.** New assets will ship AVIF as the first source.

### Defects found

| # | Finding | Impact |
|---|---|---|
| **R1** | `[data-reveal]` sets `opacity: 0` with no `prefers-reduced-motion` exemption. Content is invisible until JS adds `.irv2-revealed` | 25 sections depend on JS to be seen. Reduced-motion users still start from hidden. Fix: lift opacity for that media query |
| **R2** | Zero `<video>` in the app; 4 `loading="lazy"` total | No motion vocabulary yet |
| **R3** | Homepage hero is text-only with no product visual | The single highest-leverage conversion surface on the site |
| **R4** | No device mockups anywhere | The product is never shown |

### Two blockers you need to decide on

**B1 — "Verified testimonials" cannot be populated.** The table has **0 rows** and no consent records exist. The component is built and correctly renders nothing. I will not fabricate one. This priority item stays hidden until you have a real, consented quote.

**B2 — Real dashboard screenshots need a populated account.** Production has 4 accounts, 0 funding workspaces, 1 business plan. A screenshot today shows mostly empty states, which is weak marketing but honest. Options:

- **(a)** Screenshot the genuine empty states and lean on them as "start here" *(honest, less impressive)*
- **(b)** Create a clearly-marked demo account with plausible sample data, screenshot that, and caption the mockup as illustrative *(what most SaaS companies do; permitted by your rule only if labelled)*
- **(c)** Defer the dashboard preview

**I recommend (b) with a visible "Sample data" caption.** These are genuine screenshots of a genuine account — no pixels invented — with the nature of the data disclosed. Confirm before I seed anything.

### On "three dimensional graphics"

Higgsfield's `soul_location` is environment photography, not a 3D product renderer, and my three attempts at a literal workshop hero all failed QA. The Stripe/Linear/Framer look you are pointing at is **not** AI-generated 3D — it is real UI in perspective device frames with depth from shadow, gradient and layering. So: depth comes from **CSS 3D transforms over real screenshots**, and Higgsfield supplies **material and atmosphere**, which is what it actually did well (`og-surface` passed first time).

---

## 2. Higgsfield asset plan

Shared negative prompt, prepended to every generation:

```
text, letters, words, signage, watermark, logo, brand name, user interface,
screen content, dashboard, chart, graph, certificate, award, badge, seal,
people, faces, hands, distorted anatomy, plastic skin, HDR, oversaturated,
teal and orange grade, lens flare, stock-photo composition, clutter,
war bonnet, generic tribal pattern, pan-Indigenous costume
```

Direction: warm sand `#F4ECE0`, deep brown `#241910`, cream `#FBF5EC`. Natural directional light, low contrast, film-like, unhurried.

### V1 · Homepage hero backdrop — `#top`

- **Desktop** 1920×1080 (16:9) · **Mobile** 1080×1440 (3:4) — separate composition, not a crop
- **Files** `hero-material-desktop.{avif,webp,jpg}` / `hero-material-mobile.{avif,webp,jpg}` · **Fallback** `.jpg`
- **Alt** `""` (decorative; the headline carries the meaning)
- **Focal point** desktop: material mass right 40%, left 60% clear. Mobile: mass lower third.

```
Abstract warm material surface: overlapping planes of sanded pale birch and
deep walnut timber in a calm geometric arrangement, soft directional light
raking across fine wood grain, gentle falloff into shadow at one edge. Warm
sand, oatmeal and dark brown. Photorealistic macro material photography, even
exposure, muted warm grade, generous uncluttered negative space.
```

*Rationale: this is the exact prompt family that produced the one first-time pass. The literal workshop failed three times; I am not repeating it.*

### V2 · Product workflow band — `#how`

- **Desktop** 1600×900 · **Mobile** reuse with `object-position: 60% center` — no separate composition
- **Files** `workflow-texture.{avif,webp,jpg}` · **Alt** `""` · Sits behind step cards at low opacity

```
Soft abstract gradient of layered warm paper and linen textures, pale sand
shading into oatmeal, extremely subtle grain, no objects, no edges, no focal
point. Photorealistic material photography, flat even light, muted warm grade.
```

### V3 · Final CTA band

- **Desktop** 1920×720 · **Mobile** 1080×1080 — separate composition
- **Files** `cta-dusk-{desktop,mobile}.{avif,webp,jpg}` · **Alt** `""`
- Scrim required; contrast measured against the **brightest pixel**, as with the sovereignty backdrop

```
Wide calm landscape of open prairie grassland under a high overcast sky at
golden hour in western Canada, distant low treeline on the horizon, no
structures, no roads, no people. Photorealistic landscape photography, 35mm,
soft natural light, restrained contrast, warm muted film grade.
```

### V4 · Hero ambient loop *(optional, ship only if V1 is approved)*

- **Desktop** 1920×1080 WebM VP9, 6s, silent, seamless · **Mobile** still only
- **Files** `hero-ambient.webm` + `hero-ambient-poster.avif`
- `muted`, `playsinline`, `preload="none"`, paused off-screen, **still image under `prefers-reduced-motion`**
- Headline and CTA must be fully legible with video blocked

```
Locked-off macro shot of warm timber surfaces, only a slow drift of soft
shadow moving across the grain as light shifts. No camera movement, no cuts,
no objects entering frame. 6 seconds, seamless loop, photorealistic, warm
muted grade.
```

### Device mockups — **not Higgsfield**

Real screenshots at `/dashboard`, `/dashboard/funding/matches`, `/dashboard/funding/readiness/:id`, composited into CSS device frames with perspective, shadow and a gradient rim. No generated UI, no invented numbers, no fake logos.

- `shot-dashboard-1440.png`, `shot-matches-1440.png`, `shot-readiness-390.png`
- Alt text describes the actual screen, e.g. `The funding matches screen, listing programmes with match rationale.`

---

## 3. Sequence once approved

1. R1 reduced-motion fix (small, independent, ships first)
2. Generate V1–V3, inspect each, discard failures
3. Capture real screenshots (pending your B2 decision)
4. Device mockups + depth on hero, workflow, dashboard preview
5. Scroll/hover polish reusing `data-reveal`
6. Test at 320/375/390/430/768/1024/1440/1920; lint, types, tests, a11y, build
7. Ship via the existing PR → squash → Vercel flow, then verify live

## 4. Explicitly out of scope

- Testimonials section (B1 — no consented content exists)
- Any generated person, logo, rating, certification or business result
- framer-motion or any new animation dependency
