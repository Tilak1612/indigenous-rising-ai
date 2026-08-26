-- Repair of two dead funder links found by the 2026-08-26 check.
--
-- Both replacements were opened in a real browser and their page title matched
-- the programme name before being written. Status deliberately STAYS
-- 'needs_review': the LINK is fixed, but nobody has confirmed the programme's
-- amounts and eligibility against the page, and that is what 'verified' means.
-- Marking them verified would make them sendable in email on the strength of a
-- title match, which is exactly the shortcut the gate exists to prevent.

update public.grants
set source_url = 'https://www.bdc.ca/en/i-am/indigenous-entrepreneur',
    application_url = 'https://www.bdc.ca/en/i-am/indigenous-entrepreneur',
    verification_notes = 'Link REPAIRED 2026-08-26. Old URL /i-am/aboriginal-entrepreneur returned 404; BDC moved it to /i-am/indigenous-entrepreneur, which loads with title "Indigenous Entrepreneurs". Link verified working. Terms and amounts still need a human check before this can be marked verified.'
where id = '6e08e119-55f7-46e0-9485-806ed995380b' and verification_status <> 'verified';

update public.grants
set source_url = 'https://futurpreneur.ca/en/indigenous/',
    application_url = 'https://futurpreneur.ca/en/indigenous/',
    verification_notes = 'Link REPAIRED 2026-08-26. Old URL returned 404; current page is /en/indigenous/, title "Indigenous entrepreneur startup program - Futurpreneur" — an exact programme-name match. Link verified working. Terms and amounts still need a human check.'
where id = 'fb15b27a-e623-4eb2-a86f-6f70c0521c51' and verification_status <> 'verified';

-- The remaining two could NOT be repaired without guessing. Recording the
-- searches that failed so the next person does not repeat them.
update public.grants
set verification_notes = 'Automated link check 2026-08-26: 404 ("We can''t find that page | ontario.ca"). SEARCHED FOR A REPLACEMENT AND FAILED — tried /indigenous-economic-development, /indigenous-economic-development-fund-guidelines and /funding-opportunities-indigenous-businesses-and-communities; all 404. Needs a human to find the current Ontario page, or to retire this record if the programme has ended.'
where id = '86fe5dcf-3b4c-4f95-a56b-4a0a00eb16de' and verification_status <> 'verified';

update public.grants
set verification_notes = 'Automated link check 2026-08-26: 404 ("Error 404 - Government of Canada"). SEARCHED FOR A REPLACEMENT AND FAILED — the nearest ISC/CIRNAC candidates resolved to DIFFERENT programmes ("Lands and Economic Development Services Program", "Labrador Innu Land Claims Agreement-in-Principle"), so none was substituted. Pointing users at the wrong programme would be worse than a dead link. Needs a human.'
where id = 'b709f9ea-07e0-4719-b5bb-64ed9a4b553a' and verification_status <> 'verified';
