-- Strategic Partnerships Initiative: repair the dead source link.
--
-- The old page (/eng/1331657507074/1533645155560) has returned 404 since the
-- 2026-08-26 link check, and the first scheduled check-funding-links run on
-- 2026-11-03 confirmed it. ISC's current page for the programme, titled
-- "Strategic Partnerships Initiative" and dated 2026-10-28, is
-- /eng/1330016561558/1594122175203. Re-read on 2026-11-03.
--
-- The current page says recipients cannot apply directly, so the record now
-- routes people to the SPI Secretariat instead of implying an application.
-- verification_status stays needs_review: a person still signs the record off.
update public.grants
set
  source_url = 'https://www.sac-isc.gc.ca/eng/1330016561558/1594122175203',
  application_url = 'https://www.sac-isc.gc.ca/eng/1330016561558/1594122175203',
  apply_url = 'https://www.sac-isc.gc.ca/eng/1330016561558/1594122175203',
  apply_link_type = 'contact',
  application_method = 'contact',
  description = 'Federal initiative, led by Indigenous Services Canada with 23 federal partners, that funds multi-year Indigenous economic development initiatives proposed by federal departments. Recipients cannot apply directly; federal partners identify opportunities with Indigenous communities and partners, and an interdepartmental investment committee approves them.',
  eligibility_notes = 'ISC lists eligible participants as Indigenous businesses, organizations, partnerships and joint ventures; Indigenous communities and local governments; academic institutions; and provinces and territories. Recipients cannot apply directly for SPI funding. Contact the SPI Secretariat at IPS-SPI@sac-isc.gc.ca.',
  applicant_types = array['community','organization','community_business','business','institution'],
  source_published_date = '2026-10-28',
  last_verified = '2026-11-03',
  source_evidence = jsonb_build_array(
    jsonb_build_object('field','application_method','quote','Eligible recipients cannot apply directly for funding through SPI.','fetched_at','2026-11-03'),
    jsonb_build_object('field','eligibility','quote','Indigenous businesses, organizations, partnerships and joint ventures','fetched_at','2026-11-03'),
    jsonb_build_object('field','contact','quote','For more information, please email the SPI Secretariat at IPS-SPI@sac-isc.gc.ca .','fetched_at','2026-11-03'),
    jsonb_build_object('field','source_published_date','quote','Date modified: 2026-10-28','fetched_at','2026-11-03')
  ),
  verification_notes = 'LINK REPAIRED 2026-11-03: old page 404 since 2026-08-26; current ISC page /eng/1330016561558/1594122175203 (dated 2026-10-28) re-read and quoted. Record rewritten to say recipients cannot apply directly. Awaiting human sign-off. ' || coalesce(verification_notes, '')
where slug = 'strategic-partnerships-initiative'
  and source_url = 'https://www.sac-isc.gc.ca/eng/1331657507074/1533645155560';
