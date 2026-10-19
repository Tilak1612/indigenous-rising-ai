-- AIOC: stop displaying the minimum as if it were the maximum, and record the
-- remaining 2026-09-28 source checks.
--
-- The AIOC row had amount_min = 20000000 and amount_max = NULL. formatAmount()
-- only prints a range when BOTH are set; with just a minimum it falls through
-- to its last branch:
--
--     return `Up to ${fmt(g.amount_max ?? g.amount_min ?? 0)}`;
--
-- so the card read "Up to $20,000,000" -- presenting the FLOOR of the programme
-- as its CEILING. For Alberta's major Indigenous investment vehicle that is
-- backwards in the most consequential direction: a Nation reading it would
-- conclude the programme tops out at the point where it actually starts.
--
-- From https://www.theaioc.com/loan-guarantees/ read 2026-09-28:
--   "The investment value of the Indigenous group Investment must fall between
--    $20M to $250 million."
--   "AIOC has up to $3 billion in capacity to support these loan guarantees."
--   Guarantees activate only on default, at which point AIOC repays the lender
--   and assumes ownership of the asset, so community assets are not at risk.
--
-- Setting amount_max makes the card render "$20,000,000 - $250,000,000", which
-- is what the funder states.

update public.grants
set amount_min = 20000000,
    amount_max = 250000000,
    amount_currency = 'CAD',
    eligibility_notes = 'For Indigenous Nations and groups investing in natural resources, agriculture, telecommunications, transportation, tourism, healthcare or technology. AIOC states the investment value must fall between $20 million and $250 million, must demonstrate a benefit back to Alberta, and must show a high probability of meaningful cash flow to Indigenous investors. Guarantees are activated only if a loan defaults.',
    last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28 against theaioc.com/loan-guarantees/. Added amount_max 250000000. Previously amount_min was set with amount_max NULL, so formatAmount() rendered "Up to $20,000,000" - the programme FLOOR shown as its ceiling. AIOC states investments must fall between $20M and $250 million, with up to $3 billion in guarantee capacity.'
where id = 'fe1303d0-4137-410f-8ebb-5dd52830f3f0' and verification_status <> 'verified';

-- Sites that load and describe their lending, but publish no amount. Recording
-- the check so the next person does not repeat it.
update public.grants
set last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28: lrcc.mb.ca loads. LRCC is a Manitoba Metis owned lending institution founded in 1992 through the Manitoba Metis Federation, financing start-up, acquisition and expansion of Metis owned and controlled small businesses in Manitoba, with business planning and counselling support. No loan amount is published, so none is stated here.'
where id = '103d8bc3-f604-4d61-a12f-6531003470ea' and verification_status <> 'verified';

update public.grants
set last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28: nacca.ca loads. NACCA describes a network of more than 50 Indigenous Financial Institutions and reports more than 54,500 business loans disbursed. NACCA administers the Aboriginal Entrepreneurship Program but lending is done by the member institutions, so no single amount applies to this record.'
where id = '1504a4ff-aa05-4f8b-9860-e87ae5cf3fca' and verification_status <> 'verified';

update public.grants
set last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28: sief.sk.ca loads. No loan amount published.'
where id = 'ae0830a9-12b3-49f1-8e90-b0e99e03dd64' and verification_status <> 'verified';

update public.grants
set last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28: mddf.ca loads. No loan amount published.'
where id = '31531354-b21b-4c3a-ab2e-729b598201a7' and verification_status <> 'verified';

-- Links that could not be reached. last_verified stays NULL on all of these:
-- nothing was verified, and the public card should keep saying so.
update public.grants
set verification_status = 'needs_review',
    verification_notes = 'RECHECKED 2026-09-28: still 404. First recorded dead by the 2026-08-26 link check, which searched for a replacement and failed. Needs a human to find the current Ontario page or retire this record.'
where id = '86fe5dcf-3b4c-4f95-a56b-4a0a00eb16de' and verification_status <> 'verified';

update public.grants
set verification_status = 'needs_review',
    verification_notes = 'RECHECKED 2026-09-28: still 404. First recorded dead by the 2026-08-26 link check. The nearest ISC candidates resolved to DIFFERENT programmes, so none was substituted. Needs a human.'
where id = 'b709f9ea-07e0-4719-b5bb-64ed9a4b553a' and verification_status <> 'verified';

update public.grants
set verification_notes = 'CHECKED 2026-09-28: tradecommissioner.gc.ca returned 403 to an automated request. That is bot blocking rather than evidence the page is gone, so this is NOT recorded as a dead link and no figure was changed. The stated $10,000-$50,000 range remains unconfirmed and needs a human to open the page in a normal browser.'
where id = 'd4ca40f3-e6bf-456e-b2ad-cda75237b927' and verification_status <> 'verified';

update public.grants
set verification_notes = 'CHECKED 2026-09-28: gov.nu.ca returned 403 to an automated request, and indigenoustourism.ca timed out. Both are consistent with bot blocking rather than a dead page, so neither is recorded as a broken link. Needs a human to confirm in a normal browser.'
where id in ('9b7645f8-339e-4531-9bb5-4cbb47a6173f','df217a3f-d0f7-4eda-8031-1caff21cf9a4')
  and verification_status <> 'verified';
