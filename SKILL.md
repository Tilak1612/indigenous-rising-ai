# SKILL.md — Claude Code Skills for Indigenous Rising AI

> This file defines domain-specific skills that Claude Code agents can use when working in this repo.

## Base Skills

### 1. Frontend Component Builder
- **Agent**: agents/frontend/ (sub-task)
- **Trigger**: New UI component, page, or layout work
- **Rules**: PascalCase, co-located tests, shadcn/ui primitives, Tailwind only, absolute imports via `@/`

### 2. Supabase Backend Agent
- **Agent**: agents/backend/ (sub-task)
- **Trigger**: Edge Functions, RLS policies, database queries, auth flows
- **Rules**: Every table needs RLS, use `supabase.auth`, sequential migrations, never expose service role key client-side

### 3. Stripe Integration Agent
- **Agent**: agents/backend/ (sub-task)
- **Trigger**: Checkout, webhooks, subscription management, billing portal
- **Rules**: Verify webhook signatures, CAD currency, link checkout to Supabase user via metadata, never store card data

### 4. Testing Agent
- **Agent**: agents/testing/ (sub-task)
- **Trigger**: Unit tests, integration tests, E2E tests
- **Rules**: Co-locate with components, mock Supabase client for unit tests, Playwright for E2E

### 5. SEO & Content Agent
- **Agent**: agents/content/ (sub-task)
- **Trigger**: Meta tags, OG images, landing page copy, blog content
- **Rules**: Bilingual EN/FR, unique meta per page, structured data where applicable

### 6. DevOps Agent
- **Agent**: agents/devops/ (sub-task)
- **Trigger**: CI/CD, Vercel config, GitHub Actions, preview deployments
- **Rules**: Never deploy to production directly, preview deployments for PRs

---

## Product-Specific Skills

### Skill: Funding Matching Agent
- **Agent**: agents/backend/ (sub-task)
- **Trigger**: Funding database, AI matching engine, grant search
- **Context Files**: `src/features/funding/`, `supabase/functions/match-funding/`

**Capabilities**:
- Maintain and query the 500+ Indigenous funding source database
- Build and run the AI funding matching engine (OpenAI + structured search)
- Match entrepreneur profile to eligible funding programs
- Track application deadlines and eligibility criteria changes
- Generate funding opportunity summaries in plain language

**Rules**:
1. Funding data sourced from public program databases — cite source for each entry
2. Matching results include eligibility confidence score and reasoning
3. Never guarantee funding outcomes — use "you may be eligible"
4. Deadline data must include `last_verified_date` — flag if > 30 days old
5. Funding entries are categorized by: federal/provincial/territorial/private/Indigenous org
6. All matching logic runs in Edge Functions — no client-side API calls

**Output**:
- Edge Function: `supabase/functions/match-funding/index.ts`
- Funding database schema: `supabase/migrations/YYYYMMDD_funding_sources.sql`
- Types: `src/types/funding.ts`

### Skill: Cultural Compliance Agent
- **Agent**: agents/content/ (sub-task)
- **Trigger**: Copy review, imagery selection, cultural terminology, language additions
- **Context Files**: `src/features/languages/`, `docs/brand-context-pack.md`

**Capabilities**:
- Review content for cultural sensitivity and OCAP alignment
- Maintain the multi-language content system (EN/FR + Indigenous languages)
- Flag any pan-Indigenous generalizations or inappropriate imagery
- Generate accessible plain-language copy for community audiences
- Coordinate terminology with nation-specific standards where documented

**Rules**:
1. No cultural imagery added without explicit content review flag
2. Language additions require community liaison confirmation (document in PR description)
3. Nation names use the nation's own preferred spelling — not English approximations
4. All new copy reviewed against the OCAP principles checklist before commit
5. Avoid deficit framing — always strength-based language

**Output**:
- Language files: `src/features/languages/locales/`
- Content review flags: `// CULTURAL-REVIEW:` comment in code
- Cultural compliance notes in PR description
