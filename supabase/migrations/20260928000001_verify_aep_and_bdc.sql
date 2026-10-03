-- Record the terms check for the two programmes verified in a browser on
-- 2026-09-28, and give the AEP row the amounts it was missing.
--
-- Why this matters: the Aboriginal Entrepreneurship Program is the main federal
-- route to Indigenous business capital, and its row carried amount_min and
-- amount_max as NULL. formatAmount() renders that as "Amount varies", so the
-- most important programme in the directory showed no figure at all.
--
-- From https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236, read
-- 2026-09-28 (the page's own Date modified is 2024-04-10):
--
--   "Individual Indigenous entrepreneurs may receive up to $99,999 in funding
--    assistance and eligible Indigenous community businesses may receive up to
--    $250,000."
--   "Eligibility varies between IFIs and MCCs."
--   "There is no deadline to apply."
--   "To apply for funding, please contact your local IFI or MCC directly."
--
-- The two ceilings are a problem for a single amount field. amount_max is set
-- to the programme maximum (250000), which alone would read as "Up to $250,000"
-- to an individual entrepreneur who can actually receive $99,999. The public
-- funding card does NOT render eligibility_notes, but it DOES render the
-- description, so the split is stated there where it will be seen directly
-- under the amount.
--
-- verification_status stays as it is on both rows. 'verified' is what makes a
-- row sendable in email, and that sign-off belongs to a person. last_verified
-- is a separate, factual claim -- "details last verified <date>" -- and it is
-- now true for these two.

update public.grants
set amount_min = NULL,
    amount_max = 250000,
    amount_currency = 'CAD',
    description = 'Federal capital for Indigenous entrepreneurs, delivered by Indigenous Financial Institutions and Métis Capital Corporations. Individual Indigenous entrepreneurs may receive up to $99,999; eligible Indigenous community businesses up to $250,000. There is no deadline — applications are made to your local IFI or MCC directly.',
    eligibility_notes = 'Eligible recipients are Indigenous individuals, including businesses owned and controlled by Indigenous Peoples, and Indigenous organizations and associations except those with charitable or religious purposes. Indigenous Services Canada states that eligibility varies between IFIs and MCCs — confirm with the institution serving your region.',
    source_url = 'https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236',
    last_verified = DATE '2026-09-28',
    verification_notes = 'TERMS CHECKED 2026-09-28 against the ISC programme page in a browser. Added the amounts, which were both NULL so the card read "Amount varies" for the main federal programme. ISC states up to $99,999 for individual entrepreneurs and up to $250,000 for eligible community businesses; the split is carried in the description because the public card does not render eligibility_notes. ISC page Date modified: 2024-04-10. Status stays as-is: a human signs off before this goes out in email.'
where id = '7b366d5f-d9af-4862-95cc-a820e5e035bf'
  and verification_status <> 'verified';

-- BDC: the existing $350,000 figure was confirmed correct, so this records the
-- check rather than changing the number.
update public.grants
set last_verified = DATE '2026-09-28',
    verification_notes = 'TERMS CHECKED 2026-09-28 against https://www.bdc.ca/en/i-am/indigenous-entrepreneur in a browser. The existing $350,000 ceiling is correct as published: "BDC offers the Indigenous Entrepreneur Loan with financing of up to $350,000 to grow or scale your business", with flexible repayment terms, preferred rates and no processing or annual administration fees. No figure changed. Status stays as-is: a human signs off before this goes out in email.'
where id = '6e08e119-55f7-46e0-9485-806ed995380b'
  and verification_status <> 'verified';
