-- Correct the Futurpreneur IESP terms against the funder's own page.
--
-- The 2026-08-26 link repair (20260826000003) fixed this row's URL and closed
-- with "Terms and amounts still need a human check." Nobody did that check, and
-- the stale figures stayed published. This is that check.
--
-- Read from https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/
-- in a real browser on 2026-09-26. The page's own wording:
--
--   "A flexible, equity-free loan of up to $75,000* available to Indigenous
--    entrepreneurs (including those on or off reserve) to start or buy a
--    business."  (*conditions apply)
--   "Receive up to two years of 1:1 mentorship from an experienced business
--    leader."
--   "You must self-identify as Indigenous (First Nations, Métis, or Inuit)"
--   "You must be a Canadian citizen or permanent resident aged 18-39"
--   "You are looking to launch a business or have been operating your business
--    for less than two years" — "your business must not yet be operational or
--    can only have been operating full time for 24 months or less."
--
-- What was wrong, and why it mattered:
--
--   amount_min 20000 / amount_max 60000  ->  the old Futurpreneur+BDC stack.
--       The current programme is a single equity-free loan of up to $75,000.
--       Setting amount_min NULL makes formatAmount() render "Up to $75,000",
--       which is what the funder actually says. A "$20,000 – $60,000" range
--       understates the ceiling by $15,000 and invents a floor that does not
--       exist.
--   "first year of operation" / "under 12 months"  ->  less than two years
--       (24 months or less). This one turns eligible applicants away: someone
--       18 months in reads "first year", concludes they have missed it, and
--       does not apply.
--   "combines a Futurpreneur loan with a BDC matching loan"  ->  BDC is not
--       mentioned anywhere on the current page. Its partner list is Indigenous
--       institutions (AIIC, Clarence Campeau, NADF, Ulnooweg, Louis Riel
--       Capital, Waubetek, Metis Financial Corporation of BC, Indian Business
--       Corporation, SIEF, Two Rivers, CESO/SACO).
--
-- verification_status deliberately STAYS 'needs_review'. 'verified' is what
-- makes a row sendable in email (grant_is_sendable / sendable_grants), and that
-- gate exists so a human signs off before a programme's terms go out to
-- subscribers. The facts below are now correct and sourced, but the sign-off is
-- still a person's to give. last_verified is set because it is surfaced to users
-- as "Programme details last verified <date>", and that statement is now true.

update public.grants
set amount_min = NULL,
    amount_max = 75000,
    amount_currency = 'CAD',
    description = 'Equity-free startup loan of up to $75,000 plus up to two years of 1:1 mentorship, for Indigenous entrepreneurs aged 18-39 who are launching a business or have been operating for less than two years. Delivered by Futurpreneur''s Indigenous team.',
    eligibility_notes = 'Self-identify as Indigenous (First Nations, Metis or Inuit). Canadian citizen or permanent resident aged 18-39 at the time of application. Business not yet operating, or operating full time for 24 months or less. Conditions apply to the loan; confirm current terms with Futurpreneur before applying.',
    source_url = 'https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/',
    application_url = 'https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/',
    last_verified = DATE '2026-09-26',
    verification_notes = 'TERMS CHECKED 2026-09-26 against https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/ opened in a browser. Corrected: amount was 20000-60000 (the retired Futurpreneur+BDC stack), now up to $75,000 equity-free; operating window was "first year of operation", the page says "less than two years" / "24 months or less"; the BDC matching-loan structure is no longer described on the page and has been removed. Age 18-39 and the two-year mentorship were already correct. STATUS STAYS needs_review: a human still signs off before this can go out in email.'
where id = 'fb15b27a-e623-4eb2-a86f-6f70c0521c51'
  and verification_status <> 'verified';
