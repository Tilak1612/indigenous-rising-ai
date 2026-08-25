-- Identity and ownership: the inputs eligibility actually turns on.
--
-- The funding matcher was assessing Indigenous-specific programs using only
-- territory, industry and business stage. Eligibility for most of these
-- programs turns on First Nations / Métis / Inuit identity, community or Nation
-- affiliation, and percentage of Indigenous ownership — none of which the
-- product collected. That is why the "Likely eligible" badge had to be
-- downgraded to "Strong profile match" (see PR #115). These columns are what
-- let it become a defensible statement again.
--
-- profiles.community_name and profiles.nation already existed but were never
-- surfaced in the UI; this migration adds the three that were missing and
-- documents the rules for all of them.
--
-- NON-NEGOTIABLE RULES FOR THIS BLOCK — enforced in code and stated in the UI:
--
--   1. Everything here is OPTIONAL. 'prefer_not_to_say' is always available and
--      is never penalised: a profile without it still matches, it simply
--      reports criteria as "not assessed".
--   2. Identity is SELF-DECLARED. The platform records what the person states.
--      It never verifies, never validates, never infers it from anything else,
--      and never presents it to a third party as verified.
--   3. Community and Nation are FREE TEXT, deliberately not a fixed dropdown.
--      A dropdown forces people to pick someone else's label or spelling for
--      their own Nation. Communities name themselves.
--   4. Recording a community NEVER implies that community endorses, is
--      affiliated with, or has any relationship to the business or to this
--      platform.
--   5. Nothing in this block is ever shown on a public profile or in the
--      partner directory, and the community/Nation name is never sent to a
--      third-party AI model. The matcher may use derived flags only.
--   6. First Nations, Métis and Inuit are distinct. This is never collapsed
--      into a single "Indigenous" boolean.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS indigenous_identity text,
  ADD COLUMN IF NOT EXISTS indigenous_ownership_pct integer,
  ADD COLUMN IF NOT EXISTS entity_type text;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_indigenous_identity_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_indigenous_identity_check
  CHECK (indigenous_identity IS NULL OR indigenous_identity IN (
    'first_nations','metis','inuit','multiple','prefer_not_to_say'
  ));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_ownership_pct_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_ownership_pct_check
  CHECK (indigenous_ownership_pct IS NULL
         OR (indigenous_ownership_pct >= 0 AND indigenous_ownership_pct <= 100));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_entity_type_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_entity_type_check
  CHECK (entity_type IS NULL OR entity_type IN (
    'sole_proprietorship','partnership','corporation','co_operative',
    'nation_owned','development_corporation','non_profit'
  ));

COMMENT ON COLUMN public.profiles.indigenous_identity IS
  'SELF-DECLARED, optional. first_nations | metis | inuit | multiple | prefer_not_to_say. Never verified by the platform, never shown publicly, never sent to a third-party model. First Nations/Metis/Inuit are kept distinct — never collapsed to one flag.';
COMMENT ON COLUMN public.profiles.indigenous_ownership_pct IS
  'Self-declared percentage of Indigenous ownership (0-100). Used to evaluate ownership-threshold criteria (commonly 51%). Never shown publicly.';
COMMENT ON COLUMN public.profiles.entity_type IS
  'Legal structure of the business. Some programs are restricted by entity type (e.g. nation_owned or development_corporation).';
COMMENT ON COLUMN public.profiles.community_name IS
  'Free text, self-stated community. NOT a dropdown — communities name themselves. Recording it never implies endorsement or affiliation. Never shown publicly, never sent to a third-party model.';
COMMENT ON COLUMN public.profiles.nation IS
  'Free text, self-stated Nation. Same rules as community_name.';
