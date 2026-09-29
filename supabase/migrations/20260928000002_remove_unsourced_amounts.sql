-- Remove funding amounts that no funder publishes, and repair two source links.
--
-- Four published cards carried amount_max = 250000. Checked against each
-- funder's own site on 2026-09-28: NONE of them publishes that figure, or any
-- figure. $250,000 is the Aboriginal Entrepreneurship Program's ceiling for
-- community businesses, and it appears to have been copied across Indigenous
-- Financial Institution rows as an assumption.
--
-- An invented amount on a funding card is the failure mode the project
-- guardrails name first: funding information is decision support, and amounts
-- must come from the funder. formatAmount() renders NULL as "Amount varies",
-- which is true, so removing the figure makes the card honest rather than
-- blank.
--
-- What was checked, and what each site actually says:
--
--   NEDC       nedc.info/financing-programs/ loads. Describes commercial
--              financing for Indigenous entrepreneurs and First Nation
--              community-owned businesses on Vancouver Island since 1984,
--              feasibility and business-plan funding, and a dedicated Business
--              Development Officer per client. No amount published.
--   SOCCA      socca.qc.ca loads. No amount published.
--   Ulnooweg   ulnooweg.ca has NO lending pages at all -- only about, team,
--              contact and an award show. The property that actually carries
--              Business Funding, the Indigenous Women Entrepreneurship (IWE)
--              and Indigenous Youth Entrepreneurs (IYE) programmes is
--              ulnoowegdevelopmentgroup.ca, so the link is repointed there.
--              No amount published on either.
--   dana Naye  danenaye.com does not resolve on https, https+www, or http.
--              The Apply button on this card currently goes nowhere. No
--              replacement is guessed -- pointing users at the wrong funder
--              would be worse than a dead link -- so it is flagged for a human
--              to find the current site or retire the record.
--
-- Nothing is unpublished here. Removing a real funding record is the owner's
-- call, not a data-cleanup decision.

update public.grants
set amount_min = NULL, amount_max = NULL,
    last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28. Removed amount_max 250000: NEDC publishes no loan amount. nedc.info/financing-programs/ describes commercial financing for Indigenous entrepreneurs and First Nation community-owned businesses on Vancouver Island since 1984, plus feasibility and business-plan funding and a dedicated Business Development Officer. The 250000 was unsourced.'
where id = '09075c32-b414-4fc3-b12f-9c851b1bcb4a' and verification_status <> 'verified';

update public.grants
set amount_min = NULL, amount_max = NULL,
    last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28. Removed amount_max 250000: socca.qc.ca publishes no loan amount. The 250000 was unsourced.'
where id = 'd2e66304-0445-4416-8dff-5d247b0ec3e2' and verification_status <> 'verified';

update public.grants
set amount_min = NULL, amount_max = NULL,
    source_url = 'https://ulnoowegdevelopmentgroup.ca/',
    application_url = 'https://ulnoowegdevelopmentgroup.ca/',
    last_verified = DATE '2026-09-28',
    verification_notes = 'CHECKED 2026-09-28. Removed amount_max 250000 (unsourced) and repointed the link. ulnooweg.ca carries no lending pages -- only about, team, contact and an award show. ulnoowegdevelopmentgroup.ca is the property with Business Funding and the Indigenous Women Entrepreneurship and Indigenous Youth Entrepreneurs programmes. Neither site publishes a loan amount.'
where id = 'ad0165e7-2ba5-4876-88ce-ac93a4502134' and verification_status <> 'verified';

update public.grants
set amount_min = NULL, amount_max = NULL,
    verification_status = 'needs_review',
    verification_notes = 'CHECKED 2026-09-28: LINK DEAD. danenaye.com does not resolve on https, https+www or http, so the Apply button on this card goes nowhere. Removed amount_max 250000, which was unsourced in any case. No replacement URL guessed -- pointing users at the wrong funder is worse than a dead link. NEEDS A HUMAN to find the current site or retire this record. last_verified deliberately left NULL: nothing could be verified.'
where id = 'c4579105-4bde-4dc4-ae6c-fbd7bdf9127f' and verification_status <> 'verified';
