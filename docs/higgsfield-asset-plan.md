# Higgsfield visual asset plan — Indigenous Rising AI

Status: **plan only. Nothing generated.** The Higgsfield MCP is not authorized
in this session; authorize it with `/mcp` in an interactive terminal, then this
plan can be executed asset by asset.

---

## Read this before generating anything

**Do not generate AI images of Indigenous people for this product.**

This is not a style preference. `CLAUDE.md` for this repo states: *"Consult the
content/copy agent before adding any cultural references or imagery"* and
*"Never use pan-Indigenous generalizations — respect distinct nation
identities."* A synthetic person presented in an Indigenous context on an
Indigenous-owned platform is precisely the pan-Indigenous generalization that
rule exists to prevent — a generative model has no concept of the difference
between Cree, Mi'kmaq, Métis and Inuit identity, and will average them into
something that belongs to no nation and misrepresents all of them.

It is also a business risk. The product's entire positioning is data
sovereignty and OCAP® alignment: being caught using a synthetic Indigenous
face would undermine the one thing the brand is selling.

**Therefore this plan is split into two tracks:**

| Track | Content | Source |
|---|---|---|
| **A — safe to generate** | Environments, workspaces, hands-at-work with no identifiable face, landscapes, textures, abstract brand surfaces | Higgsfield |
| **B — commission, do not generate** | Any recognisable person presented as an entrepreneur, customer, or community member | Licensed photography with a signed release, or a photographer engaged with the communities depicted |

Track B assets are listed so the page designs have a slot for them, with a
build-time fallback. Do not fill those slots with Higgsfield output.

---

## Shared art direction (applies to every Track A asset)

Derived from the live palette in `src/pages/LandingV2.tsx`:

- Palette: warm sand `#F4ECE0`, deep brown `#241910`, cream `#FBF5EC`, near-black `#111111`
- Light: natural, directional, low-contrast; overcast-window or golden-hour. No studio strobe, no lens flare.
- Lens: 35mm or 50mm equivalent, shallow-to-moderate depth of field, eye-level.
- Grade: warm, slightly desaturated, film-like. No teal-and-orange, no HDR.
- Setting: **Canadian**. Prairie, boreal, coastal BC, northern communities, small-town main street. Not generic North American suburbia.
- Mood: calm, competent, unhurried. Work being done well, not celebration.

**Universal negative prompt** — prepend to every generation:

```
text, letters, words, signage, watermark, logo, brand name, user interface,
screen content, dashboard, chart, certificate, award, badge, medal, seal,
distorted hands, extra fingers, malformed limbs, mangled tools, plastic skin,
waxy skin, over-smoothed skin, HDR, oversaturated, teal and orange grade,
lens flare, bokeh balls, stock-photo handshake, forced smile, headset,
call centre, generic office tower, glass skyscraper, American flag,
war bonnet, generic tribal pattern, pan-Indigenous costume
```

The last three matter: they block the cultural failure modes a model will
otherwise reach for.

---

## Track A — assets safe to generate

### A1 · Homepage hero (`#top`, `LandingV2.tsx:325`)

- **Purpose:** establish credibility and Canadian context in the first viewport, behind the headline.
- **Desktop:** 1920×1080 (16:9) · **Mobile:** 1080×1350 (4:5) — **separate composition required**
- **Focal point:** desktop, subject in right third, left 55% clear for headline. Mobile, subject in lower third, top 45% clear.
- **Filename:** `hero-workshop-desktop.avif` / `hero-workshop-mobile.avif`
- **Alt:** `A small woodworking workshop in a Canadian prairie town at first light.`

**Prompt:**
```
Interior of a small independent woodworking workshop in a Canadian prairie
town at early morning. Timber offcuts stacked against a wall, a workbench with
hand tools laid out in order, sawdust in a shaft of window light. Warm sand and
deep brown tones. No people visible. Photorealistic, 35mm, natural window
light, shallow depth of field, calm and orderly, muted warm film grade.
```

**Mobile variant:** same workshop, vertical framing, bench in the lower third,
window light and empty wall above for the headline. Do not crop A1 desktop —
the bench falls out of frame at 4:5.

---

### A2 · "Built for the people doing the work" (`LandingV2.tsx:405`)

- **Purpose:** ground the section heading in real trades and small-business work.
- **Desktop:** 1600×1200 (4:3) · **Mobile:** reuse with `object-position: 60% center` — **no separate composition needed**
- **Focal point:** centre-left; right third is low-detail for text overlay.
- **Filename:** `section-hands-ledger.avif`
- **Alt:** `Hands writing figures in a paper ledger on a workshop bench beside a coffee mug.`

**Prompt:**
```
Close crop of adult hands writing figures in a paper ledger book on a scuffed
wooden workbench, a chipped enamel mug beside it, tape measure and pencil in
frame. Hands only, no face, no arms above the elbow. Natural side light from a
window. Photorealistic, 50mm, shallow depth of field, warm muted grade,
authentic wear on the hands and the bench.
```

---

### A3 · "Your data. Your Nation's data." (`#sovereignty`, `LandingV2.tsx:474`)

- **Purpose:** give the dark sovereignty section a grounding image that reads as *place*, not *technology*.
- **Desktop:** 1920×1080 (16:9) · **Mobile:** 1080×1350 (4:5) — **separate composition required**
- **Focal point:** horizon on the lower third; upper two thirds clear for the reversed-out heading.
- **Filename:** `sovereignty-land-desktop.avif` / `sovereignty-land-mobile.avif`
- **Alt:** `Boreal forest and a still lake at dusk in northern Canada.`

**Prompt:**
```
Wide landscape of boreal forest meeting a still lake at dusk in northern
Canada. Low cloud, deep brown and cream tones, no structures, no people, no
boats. Photorealistic, 35mm, natural dusk light, calm water, restrained
contrast, warm muted film grade.
```

Section background is `#241910`; grade the asset to sit against it without a
hard edge. Overlay a `#241910` scrim at 55% so the reversed text keeps
4.5:1 contrast — verify after implementing, do not assume.

---

### A4 · Open Graph fallback — `/pricing` and future pages

- **Purpose:** `/pricing` currently falls back to `og-home.jpg`; give commercial pages their own card.
- **Dimensions:** 1200×630 · **Mobile:** n/a
- **Focal point:** imagery right 40%, left 60% reserved for the wordmark and page title, composited in code — **never generate the text**.
- **Filename:** `og-pricing.jpg`
- **Alt:** n/a (OG images take the page title)

**Prompt:**
```
Abstract warm surface: overlapping planes of sanded birch and deep walnut in
warm sand and dark brown, soft directional light, subtle wood grain texture.
No objects, no people, no text. Photorealistic macro, even exposure, muted
warm grade.
```

Once generated, wire it in `scripts/prerender.mjs` as `img: '/og-pricing.jpg'`
on the `/pricing` entry — the mechanism already exists and is guarded by
`src/__tests__/og-images.test.ts`.

---

### A5 · Hero motion (optional, defer until A1 is approved)

- **Desktop:** 1920×1080 (16:9), 6–8s, silent, seamless loop
- **Mobile:** do not ship. Serve the A1 still under `prefers-reduced-motion` and on mobile.
- **Filename:** `hero-workshop.mp4` + `hero-workshop-poster.avif`

**Prompt:**
```
Locked-off shot of the same workshop interior. Only dust drifting in the shaft
of window light. No camera movement, no people, no cuts. 6 seconds, seamless
loop, photorealistic, warm muted grade.
```

Requirements: `poster` set, `muted`, `playsinline`, no autoplay with sound,
paused off-screen, and the headline and CTA must remain fully legible with the
video blocked.

---

## Track B — commission, do not generate

| Slot | Section | Why not generative |
|---|---|---|
| B1 · Founder portrait | About / Trust Center | A synthetic founder is a fabricated identity |
| B2 · Entrepreneur portraits | Testimonials (`Testimonials.tsx`) | The component only renders consented, approved people. A generated face here would be a fabricated customer — the exact thing the consent workflow exists to prevent |
| B3 · Community/field photography | Use-case pages | Requires the depicted nation's consent; cannot be synthesised |

Until Track B exists, those slots render nothing. `Testimonials.tsx` already
behaves this way by design.

---

## Implementation checklist (per asset, after generation)

1. Inspect before use: hands, tools, clothing, anatomy, any accidental text, geographic plausibility.
2. Convert to AVIF + WebP, keep a JPEG fallback.
3. `<picture>` with `srcset` at 640 / 1024 / 1600 / 1920.
4. Explicit `width`/`height` to reserve space (no layout shift).
5. Preload **only** the A1 desktop hero; lazy-load everything else.
6. Descriptive alt text as specified above; decorative backgrounds get `alt=""` and `aria-hidden`.
7. Verify each production URL returns HTTP 200.
8. Re-check text contrast over every image at 320 / 375 / 390 / 430 / 768 / 1024 / 1440 / 1920.
