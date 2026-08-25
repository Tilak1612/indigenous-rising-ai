-- Structured eligibility criteria, so the match can be explained rather than
-- asserted.
--
-- province, industry and business stage are ALREADY structured on this table
-- (provinces[], industries[], business_stages[]) — the matcher can evaluate
-- those deterministically today. What was missing is the two criteria that
-- gate most Indigenous-specific programs: which distinct peoples a program
-- serves, and any minimum Indigenous ownership.
--
-- POPULATED CONSERVATIVELY. Each value below is taken from that record's own
-- eligibility_notes, and ONLY where the note is unambiguous — i.e. every
-- clause names the same specific group, or states a numeric threshold
-- verbatim. Where a note is inclusive ("First Nations individuals AND
-- Indigenous-owned businesses"), aspirational ("Inuit-owned businesses are a
-- core focus" — a focus, not a restriction), or defers to a regional partner
-- ("varies by AFI"), the column is left NULL.
--
-- NULL means "not assessed" and MUST render as such. It must never be treated
-- as "no restriction" or as "you qualify" — telling someone they meet a
-- criterion we never checked is the exact failure this work exists to remove.

ALTER TABLE public.grants
  ADD COLUMN IF NOT EXISTS identity_criteria text[],
  ADD COLUMN IF NOT EXISTS ownership_min_pct integer;

ALTER TABLE public.grants DROP CONSTRAINT IF EXISTS grants_ownership_min_pct_check;
ALTER TABLE public.grants ADD CONSTRAINT grants_ownership_min_pct_check
  CHECK (ownership_min_pct IS NULL
         OR (ownership_min_pct >= 0 AND ownership_min_pct <= 100));

-- "First Nations individuals and First Nations-owned businesses" — both
-- clauses name First Nations specifically.
UPDATE public.grants SET identity_criteria = ARRAY['first_nations']
WHERE name IN (
  'Saskatchewan Indian Equity Foundation Business Loan',
  'SOCCA Business Loan and Mentorship'
);

-- "Citizens of the Manitoba Metis Federation" — unambiguous.
UPDATE public.grants SET identity_criteria = ARRAY['metis']
WHERE name = 'Louis Riel Capital Corporation Métis Business Loan';

-- "First Nations, Inuit, and Métis" — explicitly all three, named distinctly.
UPDATE public.grants SET identity_criteria = ARRAY['first_nations','inuit','metis']
WHERE name IN (
  'Aboriginal Entrepreneurship Program',
  'BDC Indigenous Entrepreneur Loan'
);

-- "Indigenous-owned tourism businesses (51%+ Indigenous ownership)" — the
-- threshold is stated verbatim in the record.
UPDATE public.grants SET ownership_min_pct = 51
WHERE name = 'Indigenous Tourism Development Fund';

COMMENT ON COLUMN public.grants.identity_criteria IS
  'Which distinct peoples the program serves, from the record''s own eligibility_notes and only where unambiguous. NULL = not assessed; never render NULL as "no restriction" or as a pass.';
COMMENT ON COLUMN public.grants.ownership_min_pct IS
  'Minimum Indigenous ownership percentage stated verbatim by the program. NULL = not stated / not assessed.';
