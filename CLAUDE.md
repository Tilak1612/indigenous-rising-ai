# CLAUDE.md — Project Root Context

> This file is the **single source of truth** for Claude Code when working in this repository.
> It is automatically read by Claude Code on session init (`/init`).

## Project Overview

- **Product**: Indigenous Rising AI — AI-powered business support for Indigenous entrepreneurs
- **One-liner**: "Empowers Indigenous entrepreneurs with AI tools for funding, business planning, and community growth — built on OCAP principles"
- **Stage**: Production
- **Live URL**: https://www.indigenousrising.ai
- **Repo**: https://github.com/BrainfyAI/indigenous-rising-ai
- **Support Email**: help@indigenousrising.ai
- **Trusted Partners**: NACCA, CCIB, AFN, ISC, MNC, ITK

## Tech Stack

| Layer | Technology |
| ------------ | ------------------------------------------------------------------- |
| Framework | Vite + React 19 (SPA) |
| Language | TypeScript (strict mode) |
| Routing | React Router 6 |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, RLS, Edge Functions, Postgres — Canada region) |
| Payments | Stripe (Checkout, Webhooks, Portal) — CAD currency |
| Email | Resend (transactional) — from help@indigenousrising.ai |
| AI | OpenAI API (funding matching, business plan assistant) |
| Hosting | Vercel |
| CI/CD | GitHub Actions |
| Monitoring | Google Analytics 4 (anonymized — minimal tracking per OCAP) |
| Localization | i18next — EN/FR minimum, designed for 3-20+ Indigenous languages |
| Mobile | Capacitor (iOS/Android — community members often on mobile) |

## Architecture

src/
├── components/
│   ├── ui/
│   └── shared/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── funding/               # AI funding matching (500+ sources)
│   │   ├── navigator/         # Funding navigator wizard
│   │   └── sources/           # Funding database
│   ├── business-plan/         # AI business planning assistant
│   ├── community/             # Community impact tracker
│   ├── training/              # Training & certification programs
│   ├── partnerships/          # Partnership network (150+ organizations)
│   ├── data-sovereignty/      # OCAP data tools, data export, consent management
│   ├── languages/             # Multi-language content infrastructure
│   └── billing/
├── hooks/
├── lib/
├── pages/
├── types/
└── styles/
supabase/
├── functions/                 # Funding matching, AI business plan, language detection
├── migrations/
└── seed.sql

## Conventions

### Code Style
- **Components**: PascalCase, one per file
- **Hooks**: use prefix, typed return objects
- **Types**: suffix with Type, Props, or Schema
- **Imports**: absolute paths via @/ alias

### Supabase Rules
- **Every table MUST have RLS** — no exceptions
- All data stored in Supabase Canada region — non-negotiable
- Community data has community-scoped RLS (not just user-scoped)
- Data export tools must allow complete data portability (OCAP Possession)

### OCAP Compliance Rules
- **Ownership**: Community/user owns their data — platform is custodian, not owner
- **Control**: Users control who sees their data — granular consent required
- **Access**: Users can access and export all their data at any time
- **Possession**: Data physically stored in Canada — Supabase Canada region
- Never aggregate or sell community data in any form
- Analytics must be anonymized — no individual tracking without explicit consent

### Cultural Sensitivity Rules
- Consult the content/copy agent before adding any cultural references or imagery
- Never use pan-Indigenous generalizations — respect distinct nation identities
- Language names must use community-preferred spellings (not English approximations)
- Funding categories use Indigenous-defined terminology where available

### Stripe Rules
- Free tier (Maadaadiziwin) must remain accessible without credit card
- CAD pricing only
- Webhook handlers verify signatures

### Git Workflow
- Conventional commits
- Claude Code does NOT push

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
OPENAI_API_KEY=
VITE_GA_MEASUREMENT_ID=
# Funding database
FUNDING_DB_API_KEY=
# Language support
DEEPL_API_KEY=
```

## Agent Routing

| Agent | Scope |
| ----------- | -------------------------------------------------------- |
| backend | Supabase, Edge Functions, funding matching, OpenAI integration |
| frontend | React components, multi-language UI, accessibility-first design |
| devops | CI/CD, Vercel, GitHub Actions |
| database | Schema, RLS (community-scoped), OCAP data tools, migrations |
| testing | Unit tests, funding match accuracy tests, E2E |
| content | Culturally sensitive copy, multilingual SEO, EN/FR landing pages |

## Do NOT

- ✘ Push to git
- ✘ Store any data outside Canada (Supabase Canada region only)
- ✘ Skip RLS — especially community-scoped tables
- ✘ Aggregate or analyze community data without explicit consent
- ✘ Use pan-Indigenous imagery or language without community review
- ✘ Remove data export functionality (OCAP Possession principle)
- ✘ Track individuals in analytics without explicit opt-in
- ✘ Use `any` type
- ✘ Create migrations without checking existing schema
- ✘ Change free tier accessibility without Tilak's explicit approval
