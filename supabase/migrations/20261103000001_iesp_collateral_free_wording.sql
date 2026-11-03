-- Futurpreneur IESP: match the funder's current wording.
--
-- Re-read https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/
-- on 2026-11-03. The page now says "collateral-free loan financing of up to
-- $75,000" and no longer says "equity-free". The record's own quoted evidence
-- (read 2026-10-26) already says collateral-free, so only the summary line was
-- out of step with its source. Amount, ages, window and mentorship unchanged.
--
-- Leaves verification_status alone: a reviewer still owns the needs_review flag.
update public.grants
set description = 'Collateral-free startup loan of up to $75,000 plus up to two years of 1:1 mentorship, for Indigenous entrepreneurs aged 18-39 who are launching a business or have been operating full time for 24 months or less. Delivered by Futurpreneur''s Indigenous team.'
where slug = 'indigenous-entrepreneur-startup-program'
  and description like 'Equity-free startup loan%';
