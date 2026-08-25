-- Loans were being presented as grants.
--
-- The matches page is headed "Personalised grant recommendations" and renders
-- every record in an identical card, but the catalogue is mostly Indigenous
-- Financial Institution LOANS — including "BDC Indigenous Entrepreneur Loan,
-- up to $350,000". A first-time entrepreneur reading "grant" above a $350K
-- figure can reasonably conclude the money is non-repayable. That is the most
-- consequential category error a funding product can make.
--
-- funding_type is classified ONLY from what each record's own description
-- already states — nothing is inferred or invented:
--   * descriptions saying "loan(s)", "financing", "repayment"    -> loan
--   * "loan guarantees"                                          -> loan_guarantee
--   * "non-repayable funding"                                    -> grant
--   * "loans AND non-repayable contributions"                    -> mixed
--   * descriptions that do not state the instrument              -> varies
--
-- `varies` is a first-class, honest answer: the UI renders it as
-- "Type varies — confirm with funder" rather than silently implying a grant.
-- is_repayable is deliberately NULLABLE — null means "we don't know", which is
-- different from false.

ALTER TABLE public.grants
  ADD COLUMN IF NOT EXISTS funding_type text NOT NULL DEFAULT 'varies',
  ADD COLUMN IF NOT EXISTS is_repayable boolean;

ALTER TABLE public.grants
  DROP CONSTRAINT IF EXISTS grants_funding_type_check;
ALTER TABLE public.grants
  ADD CONSTRAINT grants_funding_type_check
  CHECK (funding_type IN ('grant','loan','loan_guarantee','mixed','varies'));

-- Repayable financing — each description states loans/financing/repayment.
UPDATE public.grants SET funding_type = 'loan', is_repayable = true
WHERE name IN (
  'BDC Indigenous Entrepreneur Loan',
  'däna Näye Ventures Business Loan',
  'Indigenous Entrepreneur Startup Program',
  'Louis Riel Capital Corporation Métis Business Loan',
  'Métis Dene Development Fund',
  'NEDC Business Loan',
  'Nunavut Business Credit Corporation Loan',
  'Saskatchewan Indian Equity Foundation Business Loan',
  'SOCCA Business Loan and Mentorship',
  'Ulnooweg Indigenous Business Loan'
);

UPDATE public.grants SET funding_type = 'loan_guarantee', is_repayable = true
WHERE name = 'Alberta Indigenous Opportunities Corporation Loan Guarantees';

-- Explicitly "Non-repayable funding" in its own description.
UPDATE public.grants SET funding_type = 'grant', is_repayable = false
WHERE name = 'CanExport SMEs';

-- Offers both loans and non-repayable contributions.
UPDATE public.grants SET funding_type = 'mixed', is_repayable = NULL
WHERE name = 'NACCA Aboriginal Business Financing Program';

-- Everything else keeps the 'varies' default with is_repayable NULL, because
-- the stored description does not state the instrument. Do not guess these —
-- confirm with the funder and update the record.

COMMENT ON COLUMN public.grants.funding_type IS
  'grant | loan | loan_guarantee | mixed | varies. Classified from the record''s own description; ''varies'' means the instrument is not stated and must be confirmed with the funder.';
COMMENT ON COLUMN public.grants.is_repayable IS
  'true = must be paid back, false = non-repayable, NULL = unknown. NULL is meaningful and must not be rendered as ''no''.';
