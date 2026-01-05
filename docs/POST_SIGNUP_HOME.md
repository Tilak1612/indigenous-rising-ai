## Post-signup Home — Dashboard & Paid Features (Summary)

This document captures the post-signup home (dashboard) experience, paid feature set, navigation, and implementation notes.

1) Dashboard (Command Center)
- Journey card: stage (Starting / Growing / Scaling), top 3 actions, progress to next milestone.
- Snapshot tiles: funding matches, applications in progress, impact score, active trainings, upcoming events.
- Cultural layer: territory acknowledgment, greeting in chosen language, rotating Elder quote.

2) Paid feature set (UX highlights)
- Business Planning Assistant: guided stepper (vision, community impact, revenue, operations, seven generations, governance); sector templates; AI co-pilot to rewrite/align content with OCAP/TRC; one-click exports (bank-ready PDF, grant appendix, community summary).
- Funding Navigator: 500+ opportunity database with filters (province, industry, stage, amount, type); smart funding profile; fit score + explanation; application workspace with checklist, docs, reminders, and draft responses.
- Community Impact Tracker: prebuilt metrics (jobs, youth, language, wellness, environment), custom metrics, monthly impact logs (forms + stories/photos), auto-generated impact reports aligned to TRC and funder expectations.
- Training & Certification Hub: `My Learning` area with progress bars, enrollment, visible 20% discount for Ogichidaakwe on course cards, certification tracker for IBCP/CCAI.
- Partnership & Community Network: directory of partners, "Request intro" with respectful intro template, optional community spaces (Q&A, showcase posts).
- Data Sovereignty & Compliance Center: Data Rights explanation, role-based invites, export/delete controls, compliance checklist (PIPEDA, CASL, AODA, OCAP, TRC-aligned).

3) Product line & CTAs
- Plans: Maadaadiziwin (lightweight), Ogichidaakwe (full SaaS), Gimishoomis (enterprise).
- Route hero CTAs (`Learn more / Apply / See impact`) into these in-app modules instead of marketing pages.

4) Navigation & IA (after login)
- Top-level nav for subscribed users: Dashboard, Plan, Funding, Impact, Learning, Network, Data & Settings.
- Each section is single-purpose with a dominant primary CTA (e.g., `Create my funding profile`, `Log this month’s impact`, `Enroll in next cohort`).

5) Implementation notes
- Use quiz results to personalize dashboard defaults.
- Persist language selection and localize headings/buttons.
- Instrument events for analytics (plan sections completed, funding apps started, trainings enrolled).

6) Next steps for engineering
- Wire top-level nav for authenticated users.
- Add dashboard skeleton: `src/pages/Dashboard.tsx` + `src/components/JourneyCard.tsx` + snapshot tiles and cultural layer.
- Scaffold Plan, Funding, Impact, Learning, Network, Settings pages and placeholders for AI, exports, and reporting.

Reference: product brief supplied by product owner.
