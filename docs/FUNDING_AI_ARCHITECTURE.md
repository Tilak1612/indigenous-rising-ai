# Funding AI architecture

Two model calls exist, both gpt-4o-mini via OpenAI from Supabase Edge
Functions (US processor, disclosed in `/privacy`).

## Matching (`match-funding-opportunities`)

Rules decide eligibility (see FUNDING_ELIGIBILITY_ENGINE.md). For records the
rules allow, the model receives territory, industry, stage, business
description, funding purpose and target amount, plus the programme's own
record, and returns `{eligibility, fit_score, explanation}` in JSON mode with
200 tokens. Identity, ownership, community name and Nation are never sent.
Results are cached 24 h per (user, grant, profile hash).

## Assistant (`ai-assistant`)

The system prompt is extended at request time with up to eight published,
non-closed programmes for the user's territory (national ones when the
territory is unknown), each with: type, repayability, the amount exactly as
the funder publishes it (or "amount not published"), deadline or intake
status, applicant types, a trimmed eligibility note, the funder's source URL,
the `/funding/<slug>` page and the date the page was last read (or "NOT yet
verified"). Only the territory is read from the profile.

Rules in the prompt: quote figures only as written; say when an amount is not
published or a record is not verified; always give the source URL and the
details link; never say the user is eligible or will be funded; refuse to
confirm programmes not in the block. Page content from funders never enters
the prompt (quotes in `source_evidence` are shown to users, not to the model),
so a funder page cannot inject instructions.

## Not built

Application drafting with the model, funding narrative generation and
document gap analysis remain roadmap items; the readiness workspace seeds its
checklist from `documents_required` without a model.
