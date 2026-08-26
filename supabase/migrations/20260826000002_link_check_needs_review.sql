-- Automated funder-link check, 2026-08-26. Recorded as a migration so the
-- finding is reproducible and not just a one-off console session.
--
-- Per the design in 20260826000001: an automated pass may set 'needs_review';
-- ONLY a person sets 'verified'. Nothing below is marked verified.
--
-- Checked all 17 published source_urls with curl, then re-checked every
-- non-200 in a real browser, because 403/timeout is often bot protection
-- rather than a dead page — treating those as dead would have been a false
-- positive on three live programmes.
--
--   CONFIRMED DEAD (404 in browser, title quoted in each note)
--     BDC Indigenous Entrepreneur Loan
--     Indigenous Economic Development Fund (Ontario)
--     Indigenous Entrepreneur Startup Program (Futurpreneur)
--     Strategic Partnerships Initiative (ISC)
--   COULD NOT BE CHECKED AUTOMATICALLY — not evidence of a dead page
--     Nunavut Business Credit Corporation  (Cloudflare interstitial)
--     CanExport SMEs                       ("Access Denied" bot block)
--     däna Näye Ventures Business Loan     (connection failed, no title)
--
-- The remaining 10 links resolve HTTP 200 and stay 'unverified': the link
-- works, but nobody has yet confirmed the programme's terms against the page.
--
-- This is data, not schema. It is written idempotently so re-running is safe;
-- it will NOT overwrite a status a human has since set to 'verified'.

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: source_url returns HTTP 404, confirmed in a real browser (page title "404 Error"). Users clicking "Apply on funder''s site" reach a dead page. Needs a human to find the current programme URL.'
where id='6e08e119-55f7-46e0-9485-806ed995380b' and verification_status <> 'verified';

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: 404, confirmed in browser ("We can''t find that page | ontario.ca"). Needs a human to locate the current Ontario programme page.'
where id='86fe5dcf-3b4c-4f95-a56b-4a0a00eb16de' and verification_status <> 'verified';

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: redirects to futurpreneur.ca then 404 ("Page not found - Futurpreneur"). Needs a human to find the current programme URL.'
where id='fb15b27a-e623-4eb2-a86f-6f70c0521c51' and verification_status <> 'verified';

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: 404 ("We couldn''t find that Web page (Error 404) - Government of Canada"). ISC restructures these URLs; needs a human to find the current page.'
where id='b709f9ea-07e0-4719-b5bb-64ed9a4b553a' and verification_status <> 'verified';

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: could not be checked automatically — Cloudflare interstitial ("Just a moment..."). Not evidence the page is gone; needs a manual visit.'
where id='9b7645f8-339e-4531-9bb5-4cbb47a6173f' and verification_status <> 'verified';

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: could not be checked automatically — "Access Denied" bot block. Not evidence the page is gone; needs a manual visit.'
where id='d4ca40f3-e6bf-456e-b2ad-cda75237b927' and verification_status <> 'verified';

update public.grants set verification_status='needs_review',
  verification_notes='Automated link check 2026-08-26: connection failed and the page returned no title. Inconclusive; needs a manual visit.'
where id='c4579105-4bde-4dc4-ae6c-fbd7bdf9127f' and verification_status <> 'verified';
