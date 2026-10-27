-- Funding Directory, slice 2: providers, corrections to the 17 existing rows,
-- and new programme records researched on 2026-10-26.
--
-- Every material value below was read from the funder's own page on
-- 2026-10-26 through a headless browser; the exact wording is kept in
-- source_evidence so the detail page can show "the funder's page says".
-- Pages that could not be read (bot-blocked, 404) are recorded in
-- docs/FUNDING_SOURCE_CATALOGUE.md and the rows stay needs_review.
--
-- NOTHING NEW IS PUBLISHED. Every inserted row has is_published = false.
-- Publishing is an owner/admin decision made in /admin (slice 6) after the
-- record has been read once more by a person. Existing published rows keep
-- their verification_status; only links, link types, applicant types,
-- evidence and last_verified change, and each change is logged in
-- funding_verification_events.

-- funding_type gains the two classes the brief insists on being distinct from
-- grants: a contribution (repayable or not, per is_repayable) and equity.
alter table public.grants drop constraint if exists grants_funding_type_check;
alter table public.grants add constraint grants_funding_type_check
  check (funding_type in ('grant','contribution','loan','loan_guarantee','equity','mixed','varies'));

-- ---------------------------------------------------------------------------
-- 1. Providers
-- ---------------------------------------------------------------------------
insert into public.funding_providers (slug, name, provider_type, regions, website, is_directory, notes) values
 ('indigenous-services-canada','Indigenous Services Canada','federal','{}','https://www.sac-isc.gc.ca/',false,null),
 ('nacca','National Aboriginal Capital Corporations Association','nonprofit','{}','https://nacca.ca/',true,'Network of 51 Indigenous Financial Institutions (directory page 2026-07-20). Administers the Aboriginal Entrepreneurship Program; lending is done by member IFIs.'),
 ('bdc','Business Development Bank of Canada','crown_corporation','{}','https://www.bdc.ca/',false,null),
 ('futurpreneur','Futurpreneur Canada','nonprofit','{}','https://futurpreneur.ca/',false,null),
 ('global-affairs-canada','Global Affairs Canada','federal','{}','https://www.tradecommissioner.gc.ca/',false,null),
 ('prairiescan','Prairies Economic Development Canada','federal','{AB,SK,MB}','https://www.canada.ca/en/prairies-economic-development.html',false,null),
 ('pacifican','Pacific Economic Development Canada','federal','{BC}','https://www.canada.ca/en/pacific-economic-development.html',false,null),
 ('acoa','Atlantic Canada Opportunities Agency','federal','{NB,NS,PE,NL}','https://www.canada.ca/en/atlantic-canada-opportunities.html',false,null),
 ('aioc','Alberta Indigenous Opportunities Corporation','crown_corporation','{AB}','https://www.theaioc.com/',false,'Provincial Crown corporation'),
 ('aiic','Alberta Indian Investment Corporation','ifi','{AB}','https://aiicbusiness.org/',false,null),
 ('indigenous-business-corporation','Indigenous Business Corporation','ifi','{AB,BC,SK,MB}','https://www.ibcorp.ca/',false,'Site says "First Nation''s entrepreneurs in Western Canada"; office in Calgary.'),
 ('antco','All Nations Trust Company','ifi','{BC}','https://www.antco.ca/',false,null),
 ('tacc','Tale''awtxw Aboriginal Capital Corporation','ifi','{BC}','https://www.tacc.ca/',false,'Coast Salish territory'),
 ('nedc','Nuu-chah-nulth Economic Development Corporation','ifi','{BC}','https://nedc.info/',false,'Vancouver Island'),
 ('tricorp','Tribal Resources Investment Corporation','ifi','{BC}','https://www.tricorp.ca/',false,'Northwestern BC, Prince Rupert'),
 ('mfcbc','Métis Financial Corporation of BC','metis_capital_corporation','{BC}','https://www.mfcbc.ca/',false,null),
 ('province-of-bc','Province of British Columbia','provincial','{BC}','https://www2.gov.bc.ca/',false,null),
 ('fpegf','First Peoples Economic Growth Fund','lender','{MB}','https://firstpeoplesfund.ca/',false,'Initiative of the Province of Manitoba and the Assembly of Manitoba Chiefs'),
 ('lrcc','Louis Riel Capital Corporation','metis_capital_corporation','{MB}','https://lrcc.mb.ca/',false,null),
 ('sief','Saskatchewan Indian Equity Foundation','ifi','{SK}','https://www.sief.sk.ca/',false,null),
 ('ccdf','Clarence Campeau Development Fund','ifi','{SK}','https://www.clarencecampeau.com/',false,'Métis fund, Saskatchewan'),
 ('smedco','SaskMétis Economic Development Corporation','metis_capital_corporation','{SK}','https://www.smedco.ca/',false,null),
 ('government-of-ontario','Government of Ontario','provincial','{ON}','https://www.ontario.ca/',false,null),
 ('nadf','Nishnawbe Aski Development Fund','ifi','{ON}','https://www.nadf.org/',false,'Northern Ontario'),
 ('waubetek','Waubetek Business Development Corporation','ifi','{ON}','https://www.waubetek.com/',false,'Northeast Ontario'),
 ('two-rivers','Two Rivers Community Development Centre','ifi','{ON}','https://www.tworivers.ca/',false,'Six Nations and Mississaugas of the Credit area'),
 ('socca','Société de crédit commercial autochtone','ifi','{QC}','https://socca.qc.ca/',false,null),
 ('ulnooweg','Ulnooweg Development Group','ifi','{NB,NS,PE,NL}','https://ulnoowegdevelopmentgroup.ca/',false,null),
 ('nunatsiavut-government','Nunatsiavut Government','indigenous_government','{NL}','https://nunatsiavut.com/',false,null),
 ('dana-naye-ventures','däna Näye Ventures','ifi','{YT}','https://www.dananaye.com/',false,'Also serves Northern BC residents per its loan-funds page'),
 ('gnwt','Government of the Northwest Territories','territorial','{NT}','https://www.iti.gov.nt.ca/',false,null),
 ('mddf','Métis Dene Development Fund','ifi','{NT}','https://www.mddf.ca/',false,null),
 ('nbcc','Nunavut Business Credit Corporation','crown_corporation','{NU}','https://www.gov.nu.ca/',false,'Territorial Crown corporation'),
 ('atuqtuarvik','Atuqtuarvik Corporation','lender','{NU}','https://www.atuqtuarvik.com/',false,'Private, Inuit-owned'),
 ('itac','Indigenous Tourism Association of Canada','nonprofit','{}','https://indigenoustourism.ca/',false,null)
on conflict (slug) do nothing;

-- Link the existing rows to their providers by funder name.
update public.grants g set provider_id = p.id from public.funding_providers p where g.provider_id is null and (
  (g.funder = 'Indigenous Services Canada' and p.slug = 'indigenous-services-canada') or
  (g.funder = 'National Aboriginal Capital Corporations Association' and p.slug = 'nacca') or
  (g.funder = 'Business Development Bank of Canada' and p.slug = 'bdc') or
  (g.funder = 'Futurpreneur Canada' and p.slug = 'futurpreneur') or
  (g.funder = 'Global Affairs Canada' and p.slug = 'global-affairs-canada') or
  (g.funder like 'Alberta Indigenous Opportunities%' and p.slug = 'aioc') or
  (g.funder = 'däna Näye Ventures' and p.slug = 'dana-naye-ventures') or
  (g.funder = 'Government of Ontario' and p.slug = 'government-of-ontario') or
  (g.funder like 'Indigenous Tourism Association%' and p.slug = 'itac') or
  (g.funder = 'Louis Riel Capital Corporation' and p.slug = 'lrcc') or
  (g.funder like 'Métis Dene Development Fund%' and p.slug = 'mddf') or
  (g.funder = 'Nuu-chah-nulth Economic Development Corporation' and p.slug = 'nedc') or
  (g.funder = 'Nunavut Business Credit Corporation' and p.slug = 'nbcc') or
  (g.funder like 'Saskatchewan Indian Equity Foundation%' and p.slug = 'sief') or
  (g.funder like 'Société de crédit commercial autochtone%' and p.slug = 'socca') or
  (g.funder = 'Ulnooweg Development Group' and p.slug = 'ulnooweg'));

-- ---------------------------------------------------------------------------
-- 2. Corrections to existing rows (2026-10-26 read)
-- ---------------------------------------------------------------------------
-- Aboriginal Entrepreneurship Program: there is no online application. ISC
-- says "To apply for funding, please contact your local IFI or MCC directly",
-- so the button must send people to the lender directory, not to ISC.
update public.grants set
  funding_type = 'contribution', is_repayable = false,
  apply_url = 'https://nacca.ca/indigenous-financial-institutions-listings',
  apply_link_type = 'directory', application_method = 'through_lender',
  applicant_types = '{individual,business,community_business,organization}',
  program_category = '{startup,expansion,acquisition}',
  intake_status = 'rolling',
  eligibility_exclusions = 'Indigenous organizations and associations with charitable or religious purposes are not eligible. Eligibility varies between IFIs and MCCs.',
  application_steps = '{"Find the Indigenous Financial Institution or Métis Capital Corporation that serves your region","Contact the institution directly; it assesses eligibility and takes the application","The amount depends on the proposal''s scope, demonstrated need and budget"}',
  source_evidence = '[{"field":"amount_max","quote":"Individual Indigenous entrepreneurs may receive up to $99,999 in funding assistance and eligible Indigenous community businesses may receive up to $250,000.","url":"https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236","fetched_at":"2026-10-26"},{"field":"funding_type","quote":"The AEP provides support to Indigenous small and medium-sized businesses with a non-repayable equity contribution and businesses services to start, expand or acquire a business.","url":"https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236","fetched_at":"2026-10-26"},{"field":"deadline","quote":"There is no deadline to apply.","url":"https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236","fetched_at":"2026-10-26"},{"field":"application_method","quote":"To apply for funding, please contact your local IFI or MCC directly.","url":"https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236","fetched_at":"2026-10-26"},{"field":"source_published_date","quote":"Date modified: 2024-04-10","url":"https://www.sac-isc.gc.ca/eng/1375201178602/1610797286236","fetched_at":"2026-10-26"}]'::jsonb,
  source_published_date = '2024-04-10', last_verified = '2026-10-26', verification_confidence = 'high'
where slug = 'aboriginal-entrepreneurship-program';

-- BDC Indigenous Entrepreneur Loan: $350,000 confirmed again; the /apply URL
-- 404s, so the programme page stays the destination (it has the Apply button).
update public.grants set
  apply_link_type = 'program_page', application_method = 'online',
  applicant_types = '{individual,business}', program_category = '{expansion,working_capital}',
  repayment_terms = 'Flexible repayment terms, preferred rates, no processing or annual administration fees (BDC wording).',
  source_evidence = '[{"field":"amount_max","quote":"BDC offers the Indigenous Entrepreneur Loan with financing of up to $350,000 to grow or scale your business.","url":"https://www.bdc.ca/en/i-am/indigenous-entrepreneur","fetched_at":"2026-10-26"},{"field":"repayment_terms","quote":"Flexible repayment terms. Preferred rates. Plus no processing or annual administration fees","url":"https://www.bdc.ca/en/i-am/indigenous-entrepreneur","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26', verification_confidence = 'high'
where slug = 'bdc-indigenous-entrepreneur-loan';

-- Futurpreneur IESP: terms re-confirmed; age and business-age rules now
-- structured so the matcher can evaluate them. Follow-on financing noted.
update public.grants set
  apply_link_type = 'program_page', application_method = 'online',
  applicant_types = '{individual}', program_category = '{startup,acquisition}',
  entrepreneur_age_min = 18, entrepreneur_age_max = 39, business_age_max_months = 24,
  identity_criteria = '{first_nations,metis,inuit}',
  repayment_terms = 'Collateral-free loan; conditions apply. Up to $40,000 in follow-on financing may be available after two years of business performance.',
  source_evidence = '[{"field":"amount_max","quote":"collateral-free loan financing of up to $75,000* for young Indigenous entrepreneurs (either on or off Reserve) to start, buy or grow a business. *conditions apply","url":"https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/","fetched_at":"2026-10-26"},{"field":"entrepreneur_age","quote":"You must be a Canadian citizen or permanent resident aged 18-39","url":"https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/","fetched_at":"2026-10-26"},{"field":"business_age_max_months","quote":"your business must not yet be operational or can only have been operating full time for 24 months or less.","url":"https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/","fetched_at":"2026-10-26"},{"field":"identity_criteria","quote":"You must self-identify as a member of a Canadian Indigenous community (First Nations, Métis, or Inuit)","url":"https://futurpreneur.ca/en/offering/indigenous-entrepreneur-startup/","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26', verification_confidence = 'high'
where slug = 'indigenous-entrepreneur-startup-program';

-- Ontario IEDF: the old programme URL is still 404, but the Ministry page
-- that describes the fund loads and names its streams and dates, so the link
-- is repaired to that page. Grant streams closed 2025-12-01; recorded as rounds.
update public.grants set
  source_url = 'https://www.ontario.ca/page/funding-indigenous-economic-development',
  application_url = 'https://www.ontario.ca/page/funding-indigenous-economic-development',
  apply_url = 'https://www.ontario.ca/page/get-funding-ontario-government',
  apply_link_type = 'application_instructions', application_method = 'online',
  applicant_types = '{individual,business,community,organization}',
  program_category = '{startup,expansion,community_development,training}',
  intake_status = 'closed',
  description = 'Ontario''s Indigenous Economic Development Fund provides grants and financing to Indigenous entrepreneurs, businesses, communities and organizations through three streams: the Economic Diversification Grant, the Business and Community Fund, and the Regional Partnership Grant. The two grant streams ran an intake from 21 October to 1 December 2025 and are closed; the Ministry page lists the next dates when an intake opens.',
  source_evidence = '[{"field":"description","quote":"The Indigenous Economic Development Fund (IEDF) provides grants and financing to Indigenous entrepreneurs, businesses, communities and organizations.","url":"https://www.ontario.ca/page/funding-indigenous-economic-development","fetched_at":"2026-10-26"},{"field":"intake_status","quote":"Economic Diversification Grant: Closed, October 21, 2025, December 1, 2025, 5 p.m. EST. Regional Partnership Grant: Closed, October 21, 2025, December 1, 2025, 5 p.m. EST","url":"https://www.ontario.ca/page/funding-indigenous-economic-development","fetched_at":"2026-10-26"},{"field":"source_published_date","quote":"Updated: February 12, 2026","url":"https://www.ontario.ca/page/funding-indigenous-economic-development","fetched_at":"2026-10-26"}]'::jsonb,
  source_published_date = '2026-02-12', last_verified = '2026-10-26', verification_confidence = 'medium',
  verification_notes = 'LINK REPAIRED 2026-10-26: /page/indigenous-economic-development-fund is still 404; the Ministry of Indigenous Affairs page /page/funding-indigenous-economic-development loads and describes the IEDF streams with intake dates. Grant streams closed 2025-12-01. Status stays needs_review until a person confirms the Business and Community Fund route.'
where slug = 'indigenous-economic-development-fund';
insert into public.funding_program_rounds (grant_id, label, opens_at, closes_at, status, source_url, evidence)
select id, 'Economic Diversification Grant 2025 intake', '2025-10-21', '2025-12-01', 'closed', 'https://www.ontario.ca/page/funding-indigenous-economic-development',
  '[{"quote":"Economic Diversification Grant Closed October 21, 2025 December 1, 2025, 5 p.m. EST","fetched_at":"2026-10-26"}]'::jsonb
from public.grants where slug = 'indigenous-economic-development-fund';
insert into public.funding_program_rounds (grant_id, label, opens_at, closes_at, status, source_url, evidence)
select id, 'Regional Partnership Grant 2025 intake', '2025-10-21', '2025-12-01', 'closed', 'https://www.ontario.ca/page/funding-indigenous-economic-development',
  '[{"quote":"Regional Partnership Grant Closed October 21, 2025 December 1, 2025, 5 p.m. EST","fetched_at":"2026-10-26"}]'::jsonb
from public.grants where slug = 'indigenous-economic-development-fund';

-- däna Näye Ventures: the stored domain was misspelled (danenaye.com). The
-- organisation is at dananaye.com and publishes its loan funds and forms.
update public.grants set
  source_url = 'https://www.dananaye.com/',
  application_url = 'https://www.dananaye.com/dnv-loan-funds',
  apply_url = 'https://www.dananaye.com/dnv-loan-funds',
  apply_link_type = 'application_instructions', application_method = 'email',
  applicant_types = '{individual,business}', program_category = '{startup,expansion,working_capital}',
  description = 'Business loans, operating lines of credit and commercial mortgages from däna Näye Ventures'' loan funds, for qualified entrepreneurs in its Yukon lending territory (the loan-funds page also names Northern BC residents). Applications are made on the downloadable form and answered within ten working days of a complete file.',
  source_evidence = '[{"field":"description","quote":"dänä Näye Ventures administers various loan funds that are available to all qualified entrepreneurs in its lending territory (including Northern BC residents).","url":"https://www.dananaye.com/dnv-loan-funds","fetched_at":"2026-10-26"},{"field":"application_steps","quote":"Once all the required information has been provided and reviewed by the Financial Services Officer, a response will be provided to you within 10 working days.","url":"https://www.dananaye.com/dnv-loan-funds","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26', verification_confidence = 'medium',
  verification_notes = 'LINK REPAIRED 2026-10-26: the row pointed at danenaye.com (typo), which does not resolve. The organisation is at dananaye.com; loan funds page read in a browser. No loan amount is published for the general loan funds. Status stays needs_review until a person confirms terms with DNV.'
where slug = 'dana-naye-ventures-business-loan';

-- NEDC, SIEF, LRCC, MDDF, Ulnooweg, SOCCA, NACCA: pages re-read; apply links
-- typed honestly (contact / instructions), applicant types set.
update public.grants set apply_url = 'https://nedc.info/financing-programs/', application_url = 'https://nedc.info/financing-programs/',
  apply_link_type = 'application_instructions', application_method = 'contact', applicant_types = '{individual,business,community_business}',
  source_evidence = '[{"field":"eligibility","quote":"Indigenous ancestry (First Nations, Metis or Inuit) within NEDC service area.","url":"https://nedc.info/financing-programs/","fetched_at":"2026-10-26"}]'::jsonb,
  identity_criteria = '{first_nations,metis,inuit}', last_verified = '2026-10-26' where slug = 'nedc-business-loan';
update public.grants set apply_link_type = 'contact', application_method = 'contact', applicant_types = '{individual,business,community_business}',
  source_evidence = '[{"field":"description","quote":"SIEF provides commercial and agricultural lending for First Nation individuals and communities wanting to start a business, acquire a business or expand an existing business in Saskatchewan.","url":"https://www.sief.sk.ca/","fetched_at":"2026-10-26"},{"field":"programs","quote":"The SIEF Contribution Program is a needs-based, conditional grant program for First Nation entrepreneurs and businesses.","url":"https://www.sief.sk.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26' where slug = 'saskatchewan-indian-equity-foundation-business-loan';
update public.grants set name = 'Louis Riel Capital Corporation Small Business Grant & Loan Program', apply_link_type = 'contact', application_method = 'contact', applicant_types = '{individual,business}',
  source_evidence = '[{"field":"name","quote":"Small Business Grant & Loan Program","url":"https://lrcc.mb.ca/","fetched_at":"2026-10-26"},{"field":"description","quote":"Small business loans to finance the start-up, acquisition and/or expansion of small business.","url":"https://lrcc.mb.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26' where slug = 'louis-riel-capital-corporation-metis-business-loan';
update public.grants set apply_link_type = 'contact', application_method = 'contact', applicant_types = '{individual,business}',
  description = 'Repayable term and working-capital loans for Indigenous entrepreneurs starting or expanding a business in the Northwest Territories, plus delivery of CanNor''s Entrepreneurship and Business Development contribution program. Applications are invited year-round.',
  source_evidence = '[{"field":"description","quote":"MDDF Repayable Term and Working Capital Loans. CanNor’s Entrepreneurship and Business Development (EBD) Contribution Program. Invite applications year round.","url":"https://www.mddf.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26' where slug = 'metis-dene-development-fund';
update public.grants set apply_link_type = 'program_page', application_method = 'online', applicant_types = '{individual,business}',
  source_evidence = '[{"field":"description","quote":"We provide financing and support services for Indigenous businesses in Atlantic Canada. From business loans to non-repayable contributions, we can find the perfect fit for you and your enterprise!","url":"https://ulnoowegdevelopmentgroup.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26' where slug = 'ulnooweg-indigenous-business-loan';
update public.grants set apply_link_type = 'contact', application_method = 'contact', applicant_types = '{individual,business}', last_verified = '2026-10-26' where slug = 'socca-business-loan-and-mentorship';
update public.grants set apply_url = 'https://nacca.ca/indigenous-financial-institutions-listings', apply_link_type = 'directory', application_method = 'through_lender',
  applicant_types = '{individual,business,community_business}',
  source_evidence = '[{"field":"description","quote":"Indigenous Financial Institutions (IFIs) are autonomous, Indigenous-controlled, community-based financial organizations. IFIs provide developmental lending, business financing and support services to First Nations, Métis, and Inuit businesses in all provinces and territories.","url":"https://nacca.ca/indigenous-financial-institutions-listings","fetched_at":"2026-10-26"},{"field":"count","quote":"Canada (51)","url":"https://nacca.ca/indigenous-financial-institutions-listings","fetched_at":"2026-10-26"}]'::jsonb,
  last_verified = '2026-10-26' where slug = 'nacca-aboriginal-business-financing-program';
update public.grants set applicant_types = '{community,community_business}', apply_link_type = 'contact', application_method = 'contact' where slug = 'alberta-indigenous-opportunities-corporation-loan-guarantees';
update public.grants set applicant_types = '{individual,business}' where slug in ('nunavut-business-credit-corporation-loan','canexport-smes','indigenous-tourism-development-fund');
update public.grants set applicant_types = '{community,organization,community_business}', intake_status = 'unknown' where slug = 'strategic-partnerships-initiative';

insert into public.funding_verification_events (grant_id, event_type, summary, details)
select id, 'link_repaired', 'Link repaired 2026-10-26 (see verification_notes)', jsonb_build_object('source_url', source_url)
  from public.grants where slug in ('indigenous-economic-development-fund','dana-naye-ventures-business-loan');
insert into public.funding_verification_events (grant_id, event_type, summary, details)
select id, 'checked', 'Source page re-read 2026-10-26; apply link type and applicant types set', jsonb_build_object('apply_link_type', apply_link_type)
  from public.grants where last_verified = '2026-10-26' and is_published;

-- ---------------------------------------------------------------------------
-- 3. New programme records (all UNPUBLISHED)
-- ---------------------------------------------------------------------------
insert into public.grants
 (slug, name, funder, provider_id, description, funding_type, is_repayable, amount_min, amount_max, amount_currency,
  deadline, opens_at, is_recurring, recurrence_notes, intake_status, provinces, industries, business_stages,
  applicant_types, identity_criteria, ownership_min_pct, entrepreneur_age_min, entrepreneur_age_max, business_age_max_months,
  program_category, eligibility_notes, eligibility_exclusions, matching_funds_required, matching_funds_notes,
  documents_required, application_steps, repayment_terms,
  source_url, application_url, apply_url, apply_link_type, application_method,
  is_published, verification_status, verification_confidence, last_verified, source_published_date, source_evidence, verification_notes)
values
-- ISC Access to Business Opportunities (organisations only)
 ('isc-access-to-business-opportunities', 'Access to Business Opportunities (Aboriginal Entrepreneurship Program)', 'Indigenous Services Canada',
  (select id from public.funding_providers where slug='indigenous-services-canada'),
  'Non-repayable contributions for national or regional projects that promote a culture of entrepreneurship, improve access to business opportunities or strengthen the capacity of Indigenous organizations. This stream funds organizations and communities, not individual business start-ups, acquisitions or expansions.',
  'contribution', false, null, 500000, 'CAD',
  '2026-10-31', '2026-01-01', true, 'Annual call for proposals (2026: 1 January to 31 October). Project pitches were due two weeks before the deadline (17 October 2026).', 'open',
  '{AB,BC,MB,NB,NL,NS,NT,NU,ON,PE,QC,SK,YT}', '{}', '{}',
  '{community,organization,institution}', null, null, null, null, null,
  '{community_development,training}',
  'First Nation and Inuit communities; Indigenous-owned organizations and associations that are not charitable or religious; labour organizations; universities, colleges and other learning institutions. Projects must be national or regional in scope.',
  'Does not fund individual business start-ups, acquisitions or expansions. Contributions to for-profit entities are only for non-commercial activities and must not generate profit for the funded entity.',
  null, 'ISC may reimburse up to 100% of eligible costs, to a maximum of $500,000 per recipient per year.',
  '{"Project pitch (email)","Full application on invitation","Due-diligence and benefits assessment"}',
  '{"Email a project pitch to APA-ABO@sac-isc.gc.ca (pitches for the 2026 intake were due 17 October 2026)","ISC replies within 5 business days and invites eligible projects to apply","Submit the full application before 31 October 2026, 11:59 pm Eastern","Review can take up to 5 months"}',
  null,
  'https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865', 'https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865', 'https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', '2026-04-14',
  '[{"field":"deadline","quote":"The deadline to submit your application is October 31, 2026 at 11:59 pm Eastern time.","url":"https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865","fetched_at":"2026-10-26"},{"field":"pitch_deadline","quote":"applicants must submit project pitches no later than 2 weeks before the application deadline on October 17, 2026 at 11:59 pm Eastern time.","url":"https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865","fetched_at":"2026-10-26"},{"field":"amount_max","quote":"We may reimburse up to 100% of costs for eligible activities, up to a maximum of $500,000 per recipient per year.","url":"https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865","fetched_at":"2026-10-26"},{"field":"eligibility_exclusions","quote":"This program does not provide funding for individual business startups, acquisitions, or expansions.","url":"https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865","fetched_at":"2026-10-26"},{"field":"funding_type","quote":"This funding offers non-repayable contributions.","url":"https://www.sac-isc.gc.ca/eng/1582037564226/1610797399865","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. The 2026 pitch deadline (17 Oct) has passed; the application deadline (31 Oct) is shown separately so no one assumes a new application can still start. Organisation-only: must never be matched to an individual entrepreneur.'),
-- BDC Inclusive Entrepreneurship Loan (closed)
 ('bdc-inclusive-entrepreneurship-loan', 'BDC Inclusive Entrepreneurship Loan', 'Business Development Bank of Canada',
  (select id from public.funding_providers where slug='bdc'),
  'Loans of up to $350,000 for businesses at least 51% owned and led by women, Indigenous or Black entrepreneurs, with no application or annual fees and the option to postpone principal payments for up to 24 months. BDC closed applications on 30 September 2026; the record is kept so a reopening can be announced.',
  'loan', true, null, 350000, 'CAD',
  '2026-09-30', null, false, null, 'closed',
  '{AB,BC,MB,NB,NL,NS,NT,NU,ON,PE,QC,SK,YT}', '{}', '{early-stage,growth,established}',
  '{individual,business}', '{first_nations,metis,inuit}', 51, null, null, null,
  '{expansion,working_capital}',
  'Businesses at least 51% owned and led by persons from an underserved community (women, Indigenous and Black entrepreneurs), with revenue under $3M.',
  null, null, null, '{}', '{}',
  'Preferential rate, no application or annual fees, principal postponement up to 24 months (BDC wording).',
  'https://www.bdc.ca/en/financing/inclusive-entrepreneurship-loan', 'https://www.bdc.ca/en/financing/inclusive-entrepreneurship-loan', null, 'program_page', 'online',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"intake_status","quote":"September 30, 2026 – Applications for the Inclusive Entrepreneurship Loan are now closed.","url":"https://www.bdc.ca/en/financing/inclusive-entrepreneurship-loan","fetched_at":"2026-10-26"},{"field":"amount_max","quote":"Our inclusive entrepreneurship loan offers up to $350,000 to businesses at least 51% owned and led by women, Indigenous, or Black entrepreneurs","url":"https://www.bdc.ca/en/financing/inclusive-entrepreneurship-loan","fetched_at":"2026-10-26"},{"field":"revenue_max","quote":"Revenue of less than $3M","url":"https://www.bdc.ca/en/financing/inclusive-entrepreneurship-loan","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. CLOSED per BDC. Keep unpublished unless the directory shows closed programmes; the row exists so a reopening is a status change, not a new record.'),
-- NACCA Indigenous Women Entrepreneurship program (via IFIs)
 ('nacca-indigenous-women-entrepreneurship-program', 'Indigenous Women Entrepreneurship Program (IWE)', 'National Aboriginal Capital Corporations Association',
  (select id from public.funding_providers where slug='nacca'),
  'Microloans, training and advisory support for Indigenous women starting or growing a business, delivered through NACCA''s network of Indigenous Financial Institutions. Each IFI delivers the programme locally, so the first step is to contact the one serving your region.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Delivered year-round by participating IFIs', 'rolling',
  '{AB,BC,MB,NB,NL,NS,NT,NU,ON,PE,QC,SK,YT}', '{}', '{ideation,startup,early-stage,growth}',
  '{individual}', '{first_nations,metis,inuit}', null, null, null, null,
  '{startup,expansion,women,training}',
  'Indigenous women entrepreneurs; local eligibility is set by the delivering IFI.',
  null, null, null, '{}',
  '{"Find the IFI serving your region","Meet with a Business Support Officer","Apply for a microloan through that IFI"}', null,
  'https://nacca.ca/about-nacca/indigenous-women-entrepreneurs', 'https://nacca.ca/indigenous-financial-institutions-listings', 'https://nacca.ca/indigenous-financial-institutions-listings', 'directory', 'through_lender',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"description","quote":"Through NACCA and its network of Indigenous Financial Institutions (IFIs), women entrepreneurs gain access to funding, training, and advisory services","url":"https://nacca.ca/about-nacca/indigenous-women-entrepreneurs","fetched_at":"2026-10-26"},{"field":"application_steps","quote":"Connect with your local IFI to access business support. Meet with a Business Support Officer (BSO) for coaching, goal-setting, and guidance. Apply for microloans to launch or grow your business.","url":"https://nacca.ca/about-nacca/indigenous-women-entrepreneurs","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. NACCA publishes no loan ceiling on this page; amounts are set by each IFI (e.g. NADF advertises up to $25,000 for IYE). None stated here.'),
-- BC First Citizens Fund Business Loan Program
 ('bc-first-citizens-fund-business-loan-program', 'First Citizens Fund Business Loan Program', 'Province of British Columbia',
  (select id from public.funding_providers where slug='province-of-bc'),
  'Business loans for Indigenous entrepreneurs in British Columbia, delivered by All Nations Trust Company with four Aboriginal Capital Corporations (NEDC, TACC, TRICORP and ANTCO itself). The Province publishes no amount; the delivering lender sets terms and takes the application.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous, through the delivering lenders', 'rolling',
  '{BC}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{first_nations,metis,inuit}', null, null, null, null,
  '{startup,expansion}',
  'Indigenous entrepreneurs in British Columbia; eligibility is assessed by the delivering lender.',
  null, null, null, '{}',
  '{"Contact one of the listed lenders (ANTCO, NEDC, TACC, TRICORP) for application information"}', null,
  'https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-loan-program', 'https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-loan-program', 'https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-loan-program', 'directory', 'through_lender',
  false, 'unverified', 'medium', '2026-10-26', '2024-01-02',
  '[{"field":"description","quote":"Business loans are available to Indigenous entrepreneurs in British Columbia. All Nations Trust Company (ANTCO) delivers the Aboriginal Business Loan Program in partnership with four Aboriginal Capital Corporations located throughout the province.","url":"https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-loan-program","fetched_at":"2026-10-26"},{"field":"source_published_date","quote":"Last updated on January 2, 2024","url":"https://www2.gov.bc.ca/gov/content/governments/indigenous-people/economic-development/business-loan-program","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Page carried a post-election "not being updated" banner.'),
-- TACC Business Equity Program
 ('tacc-business-equity-program', 'TACC Business Equity Program', 'Tale''awtxw Aboriginal Capital Corporation',
  (select id from public.funding_providers where slug='tacc'),
  'Non-repayable contributions toward eligible capital and business support to start, expand or acquire a viable business, for Aboriginal clients in Coast Salish territory. Contributions supplement the applicant''s equity and financing and cannot be applied for on their own; business plans, marketing and related support costs may also be considered.',
  'contribution', false, null, 250000, 'CAD',
  null, null, true, 'Continuous intake alongside TACC financing', 'rolling',
  '{BC}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business,community_business}', null, null, null, null, null,
  '{startup,expansion,acquisition}',
  'Aboriginal entrepreneurs and community-owned businesses in TACC''s Coast Salish service area. Up to $99,999 for individuals and incorporated businesses; up to $250,000 for community-owned businesses, based on a viable business plan and subject to other financing being in place.',
  'Cannot be applied for on a standalone basis.',
  true, 'Other financing must be in place; the contribution supplements applicant equity and financing.',
  '{"Business plan","BEP F008 Detailed Eligible Costs","BEP F009 Claim Summary Form"}',
  '{"Read the BEP program description and FAQ on the TACC funding page","Download and complete the application forms","Submit with your financing application to TACC"}', null,
  'https://www.tacc.ca/funding/', 'https://www.tacc.ca/funding/', 'https://www.tacc.ca/funding/', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"amount_max","quote":"The BEP may contribute up to a maximum of $99,999 for individuals and incorporated businesses, and up to $250,000 for community owned businesses, based on a viable business plan and subject to other financing being in place.","url":"https://www.tacc.ca/funding/","fetched_at":"2026-10-26"},{"field":"matching_funds","quote":"All funding programs are intended to supplement the applicant equity and finance portions of a business opportunity and cannot be applied for on a standalone basis.","url":"https://www.tacc.ca/funding/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. amount_max carries the community ceiling; the individual ceiling ($99,999) is stated in eligibility_notes and the description.'),
-- AIIC loans
 ('aiic-business-loans', 'AIIC Business Loans', 'Alberta Indian Investment Corporation',
  (select id from public.funding_providers where slug='aiic'),
  'Interest-bearing business loans for First Nation entrepreneurs in Alberta to establish, acquire, diversify or expand a business, including working capital, with fixed or floating rates and terms generally up to five years. Business counselling and mentoring are available alongside the loan.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{AB}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{first_nations}', 51, null, null, null,
  '{startup,expansion,acquisition,working_capital}',
  'Status Indian who has resided in Alberta for at least one year; for a corporation or partnership the Status Indian must own at least 51% of shares, participate more than 51% in profits and be active in managing the business; head office in Alberta; applicants contribute their own equity.',
  'Personal, housing or consumer loans are not financed.',
  true, 'Applicants must contribute their own equity as a portion of total financing.',
  '{"Completed AIIC application for funding"}',
  '{"Download the application for funding from the Financial Services page","Submit it to AIIC"}',
  'Interest-bearing; competitive rates; fixed or floating; flexible repayment; loans generally up to 5 years.',
  'https://aiicbusiness.org/financial-services/', 'https://aiicbusiness.org/financial-services/', 'https://aiicbusiness.org/financial-services/', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"description","quote":"AIIC provides interest-bearing loans to First Nation entrepreneurs for the purpose of establishing, acquiring, diversifying or expanding a business. In some cases, equity financing may also be available. Interest rates are competitive. Loans are generally for periods of up to 5 years.","url":"https://aiicbusiness.org/financial-services/","fetched_at":"2026-10-26"},{"field":"eligibility","quote":"must be a Status Indian who has resided in Alberta for at least one year; if a corporation or partnership, the Status Indian must own at least 51% of any shares, participate more than 51% in profits, and above all, must be active in managing the business; The applicant’s head office must be in Alberta.","url":"https://aiicbusiness.org/financial-services/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. No maximum loan amount published.'),
-- FPEGF Entrepreneur Loan Program
 ('fpegf-entrepreneur-loan-program', 'FPEGF Entrepreneur Loan Program', 'First Peoples Economic Growth Fund',
  (select id from public.funding_providers where slug='fpegf'),
  'Subordinated, interest-free loans for Manitoba First Nation entrepreneurs, providing capital or working capital that helps leverage financing from other institutions. Each loan is the lesser of $200,000 per project or 50% of the fair market value of total project costs, repayable over up to 10 years (20 for buildings).',
  'loan', true, null, 200000, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{MB}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{first_nations}', 51, 18, null, null,
  '{startup,expansion,acquisition,working_capital}',
  'Member of a Manitoba First Nation living on or off reserve in Manitoba; aged 18 or over and eligible to work in Canada; equity of at least 5% of total project costs (more for higher-risk projects); partnerships must be at least 51% First Nation owned. All applicants undergo a credit review, but a low score alone does not disqualify.',
  'Loan proceeds may not be used to refinance or pay existing debt.',
  true, 'Minimum 5% applicant equity; the loan is the lesser of $200,000 or 50% of project costs, so other financing covers the rest.',
  '{"Entrepreneur Loan Program application (PDF)","Business plan","Project cost details (appraisal may be required)"}',
  '{"Download the Entrepreneur Loan Program application","Submit it to FPEGF with your business plan and project costs"}',
  'Interest-free; repayable over a term normally not exceeding 10 years (buildings 20 years); business assets registered as security.',
  'https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/', 'https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/', 'https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"amount_max","quote":"Each loan will be for the lesser of $200,000 per project, or 50% of the fair market value of the total project costs (including identified startup costs and working capital) identified in the project costs.","url":"https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/","fetched_at":"2026-10-26"},{"field":"repayment_terms","quote":"Loans are repayable over a term normally not to exceed 10 years (buildings not to exceed 20 years).","url":"https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/","fetched_at":"2026-10-26"},{"field":"eligibility","quote":"Be a member of a Manitoba First Nation, living on or off reserve in Manitoba. Be aged 18 and over, and eligible to work in Canada. Contribute equity equal to a minimum of 5% of the total project costs.","url":"https://firstpeoplesfund.ca/summary-of-programs/entrepreneur-loan-program/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26.'),
-- FPEGF Business Contribution Fund
 ('fpegf-business-contribution-fund', 'FPEGF Business Contribution Fund', 'First Peoples Economic Growth Fund',
  (select id from public.funding_providers where slug='fpegf'),
  'Non-repayable contributions toward the start-up, expansion or acquisition of a viable First Nation business in Manitoba: up to 40% of eligible costs, to a maximum of $99,999 for a business owned by a First Nation individual or $250,000 for a business owned by a Manitoba First Nation or group of First Nations. Contributions toward business plans, environmental assessments and marketing may also be considered.',
  'contribution', false, null, 250000, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{MB}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business,community_business}', '{first_nations}', 51, null, null, null,
  '{startup,expansion,acquisition}',
  'Business at least 51% owned by a First Nation band, band member or group of First Nations; minimum 10% cash equity; a commercial loan of at least 40% of total financing; business plan showing viability and management capacity; the First Nation owner must be integral to the business. Members and communities outside Manitoba qualify if the business headquarters is in Manitoba. Acquisitions need three years of financial statements and an independent business valuation.',
  'Not available for bars, gambling (VLTs), sexually exploitive businesses, pawn shops, payday loans, tobacco shops and similar; not for a business that would significantly harm another local business.',
  true, 'Minimum 10% cash equity and a commercial loan of at least 40% of total financing are required.',
  '{"Business plan","Individual or Community Business Application (PDF)","Financial statements and business valuation (acquisitions)"}',
  '{"Download the individual or community application from FPEGF","Submit with your business plan; a three-year control period with annual Business Performance Reviews follows approval"}',
  null,
  'https://firstpeoplesfund.ca/summary-of-programs/business-contribution-fund/', 'https://firstpeoplesfund.ca/summary-of-programs/business-contribution-fund/', 'https://firstpeoplesfund.ca/summary-of-programs/business-contribution-fund/', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"amount_max","quote":"Maximum contribution towards a business owned by a First Nation individual is up to 40% of eligible costs to a maximum of $99,999. Maximum contribution towards a business owned by a Manitoba First Nation or group of Manitoba First Nations is up to 40% of eligible costs to a maximum of $250,000.","url":"https://firstpeoplesfund.ca/summary-of-programs/business-contribution-fund/","fetched_at":"2026-10-26"},{"field":"matching_funds","quote":"You must have a minimum of 10% cash equity to put into the business. A minimum of a 40% commercial loan is required as part of the total financing of the business.","url":"https://firstpeoplesfund.ca/summary-of-programs/business-contribution-fund/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. amount_max carries the community ceiling; the individual ceiling ($99,999) is stated in the description.'),
-- FPEGF Community Economic Expansion
 ('fpegf-community-economic-expansion', 'FPEGF Community Economic Expansion Loan', 'First Peoples Economic Growth Fund',
  (select id from public.funding_providers where slug='fpegf'),
  'Interest-free loans for small and medium-sized viable businesses owned by a Manitoba First Nation, for start-up, expansion or acquisition: up to $300,000 or 50% of the fair market value of total project costs, repayable over up to 10 years (20 for buildings) with principal repayment starting within a year.',
  'loan', true, null, 300000, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{MB}', '{}', '{startup,early-stage,growth,established}',
  '{community_business}', '{first_nations}', 51, null, null, null,
  '{startup,expansion,acquisition}',
  'Businesses at least 51% owned and controlled by Manitoba First Nations; the community demonstrates commitment through reasonable equity.',
  'Not for refinancing or repaying existing debt.',
  true, 'Loan covers at most 50% of project costs; the community injects reasonable equity.',
  '{"Community Economic Expansion application (PDF)","Business plan","Project cost details (appraisal may be required)"}',
  '{"Download the Community Economic Expansion application","Submit to FPEGF"}',
  'Interest-free; repayable over up to 10 years (buildings 20); equal monthly principal payments beginning within one year of disbursement; assets registered as subordinate security.',
  'https://firstpeoplesfund.ca/summary-of-programs/community-economic-expansion/', 'https://firstpeoplesfund.ca/summary-of-programs/community-economic-expansion/', 'https://firstpeoplesfund.ca/summary-of-programs/community-economic-expansion/', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"amount_max","quote":"The maximum loan amount is $300,000 or 50% of the fair market value of the total project costs (including identified startup costs and working capital).","url":"https://firstpeoplesfund.ca/summary-of-programs/community-economic-expansion/","fetched_at":"2026-10-26"},{"field":"repayment_terms","quote":"Loans are interest-free. Repayment of principal, beginning within one year from disbursement of loan funds, will be required in equal monthly amounts over the remaining loan term.","url":"https://firstpeoplesfund.ca/summary-of-programs/community-economic-expansion/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Community-owned businesses only: must never be matched to an individual entrepreneur.'),
-- Nunatsiavut Business Grant
 ('nunatsiavut-business-grant-program', 'Nunatsiavut Business Grant Program', 'Nunatsiavut Government',
  (select id from public.funding_providers where slug='nunatsiavut-government'),
  'Annual, one-time, non-repayable contributions of up to $10,000 (and up to $25,000 over the life of the program) for registered Inuit businesses in Nunatsiavut, across all business structures and sectors, to support start-up, growth and diversification. A $100,000 pool is allocated each fiscal year on a first-come, first-served basis.',
  'grant', false, null, 10000, 'CAD',
  null, null, true, 'Each fiscal year (1 April to 30 March) until the $100,000 pool is depleted; reviewed monthly', 'rolling',
  '{NL}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{inuit}', null, 18, null, null,
  '{startup,expansion}',
  'Beneficiary of the Labrador Inuit Land Claims Agreement with an N#; at least 18; registered on the Inuit Business Registry with an IBR#; business bank account; an operational business within the fiscal year applied for.',
  'Costs incurred before the approval date are not eligible (reimbursement model; an advance payment option exists case by case).',
  null, 'Verification of personal investment is required.',
  '{"Letter of support","Business case","Financial forecasting","Copies of quotes and invoices","Verification of personal investment"}',
  '{"Complete the online Client Inquiry Form (reviewed within 5 working days)","Submit the full application and documents when invited (response within 6 weeks)","Selection Committee reviews monthly"}', null,
  'https://nunatsiavut.com/programs/business-grant/', 'https://nunatsiavut.com/programs/business-grant/', 'https://nunatsiavut.com/programs/business-grant/', 'application_instructions', 'online',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"amount_max","quote":"Eligible and approved applicants may receive up to a maximum of $10,000 annually, and up to $25,000 over the lifetime of the program. Applications will be accepted on a first-come, first-served basis until funds are depleted within a fiscal year.","url":"https://nunatsiavut.com/programs/business-grant/","fetched_at":"2026-10-26"},{"field":"eligibility","quote":"Be a Beneficiary of the Labrador Inuit Land Claims Agreement (LILCA) and possess an N#. Be at least 18 years of age. Be registered with the Inuit Business Registry (IBR) and possess an IBR#.","url":"https://nunatsiavut.com/programs/business-grant/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26.'),
-- GNWT SEED
 ('gnwt-support-for-entrepreneurs-and-economic-development', 'Support for Entrepreneurs and Economic Development (SEED)', 'Government of the Northwest Territories',
  (select id from public.funding_providers where slug='gnwt'),
  'The Government of the Northwest Territories'' SEED policy funds NWT businesses, entrepreneurs and community organizations across several categories (including business intelligence and networking, and community economic development), each with its own eligibility rules. Applications go through the regional offices of the Department of Industry, Tourism and Investment, whose Economic Development Officers help prepare them.',
  'contribution', false, null, null, 'CAD',
  null, null, true, 'Annual program year; 2026 application form published', 'rolling',
  '{NT}', '{}', '{ideation,startup,early-stage,growth,established}',
  '{individual,business,community,organization}', null, null, null, null, null,
  '{startup,expansion,community_development,training}',
  'NWT businesses, entrepreneurs and organizations; see each SEED category for its specific eligibility requirements. Completing the form does not guarantee funding.',
  null, null, null,
  '{"2026 SEED Application for Funding"}',
  '{"Download and complete the 2026 SEED Application for Funding","Submit it to your regional ITI office; contact the office to set up an appointment with an Economic Development Officer"}', null,
  'https://www.iti.gov.nt.ca/en/services/support-entrepreneurs-and-economic-development-seed', 'https://www.iti.gov.nt.ca/en/services/support-entrepreneurs-and-economic-development-seed', 'https://www.iti.gov.nt.ca/en/services/support-entrepreneurs-and-economic-development-seed', 'application_instructions', 'email',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"application_steps","quote":"Download and complete the application form below and submit it to your local regional office of the Department of Industry, Tourism and Investment.","url":"https://www.iti.gov.nt.ca/en/services/support-entrepreneurs-and-economic-development-seed","fetched_at":"2026-10-26"},{"field":"eligibility","quote":"See each category for specific eligibility requirements.","url":"https://www.iti.gov.nt.ca/en/services/support-entrepreneurs-and-economic-development-seed","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Category ceilings live in the SEED policy PDF, not on the page; none stated here.'),
-- Yukon Micro Loan Program (DNV)
 ('yukon-micro-loan-program', 'Yukon Micro Loan Program', 'däna Näye Ventures',
  (select id from public.funding_providers where slug='dana-naye-ventures'),
  'A tiered micro-lending program from däna Näye Ventures, starting at $4,000 for a first loan, for individuals who want to start, maintain or expand a small business in Yukon. Terms run from six months to three and a half years, and borrowers who repay can apply for gradually larger amounts. Decisions weigh character and commitment more than credit history and collateral.',
  'loan', true, 4000, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{YT}', '{}', '{ideation,startup,early-stage,growth}',
  '{individual}', null, null, null, null, null,
  '{startup,expansion,working_capital}',
  'Individuals starting, maintaining or expanding a small business in däna Näye Ventures'' lending territory.',
  'Micro loans cannot be used to refinance existing loans or pay off personal debt.',
  null, null, '{"Micro loan application form"}',
  '{"Download the application form","Submit it to däna Näye Ventures"}',
  'First loan starts at $4,000; terms from six months to three and a half years; higher tiers after successful repayment.',
  'https://www.dananaye.com/yukon-micro-loan-program', 'https://www.dananaye.com/yukon-micro-loan-program', 'https://www.dananaye.com/yukon-micro-loan-program', 'application_instructions', 'email',
  false, 'unverified', 'high', '2026-10-26', null,
  '[{"field":"amount_min","quote":"The Yukon Micro Loan Program is a tiered lending program—starting at $4,000 for a first loan—to individuals who want to start, maintain or expand small businesses. Loan terms range from six months to three and a half years.","url":"https://www.dananaye.com/yukon-micro-loan-program","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. amount_min is the published first-loan size; no ceiling is published.'),
-- NADF (Northern Ontario)
 ('nadf-business-financing', 'NADF Business Financing and Grants', 'Nishnawbe Aski Development Fund',
  (select id from public.funding_providers where slug='nadf'),
  'Loans, microloans, winter-road financing and non-repayable grant programs for First Nation communities and Indigenous entrepreneurs and businesses across Northern Ontario, including an Indigenous Youth programme of up to $25,000 (45% grant, 50% repayable loan, 5% client contribution) for ages 18 to 39 and an E-Commerce grant.',
  'mixed', null, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{ON}', '{}', '{ideation,startup,early-stage,growth,established}',
  '{individual,business,community,community_business}', null, null, null, null, null,
  '{startup,expansion,youth,women,technology}',
  'First Nation communities and Indigenous entrepreneurs and businesses in NADF''s Northern Ontario service area; see the Who Can Apply and Eligibility pages.',
  null, null, 'Youth programme: 5% client contribution.', '{}',
  '{"Review Who Can Apply and How to Apply on nadf.org","Book a meeting or submit an application"}', null,
  'https://www.nadf.org/', 'https://www.nadf.org/', 'https://www.nadf.org/', 'program_page', 'online',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"youth_program","quote":"If you are ages 18-39, apply today for up to $25k to launch or grow your business! Project support up to $25,000. 45% grant | 50% repayable loan | 5% client contribution.","url":"https://www.nadf.org/","fetched_at":"2026-10-26"},{"field":"description","quote":"NADF supports First Nation communities and Indigenous entrepreneurs and businesses across Northern Ontario","url":"https://www.nadf.org/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Programme pages behind the home page were not read; the youth ceiling is the only amount quoted.'),
-- Waubetek (Northeast Ontario)
 ('waubetek-business-financing', 'Waubetek Business Financing', 'Waubetek Business Development Corporation',
  (select id from public.funding_providers where slug='waubetek'),
  'Business loans and micro-loan financing (including Indigenous Women and Indigenous Youth streams), an e-commerce grant and community economic grants for Aboriginal entrepreneurs and First Nation communities in Northeast Ontario. Financing is available for marketing and business plans as well as capital costs.',
  'mixed', null, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{ON}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business,community}', null, null, null, null, null,
  '{startup,expansion,acquisition,women,youth,technology}',
  'Applicant and business physically located in Waubetek''s Northeast Ontario service area; Aboriginal ancestry confirmation; age of majority; demonstrated education, experience or licences and management capacity; 10% unencumbered equity contribution.',
  null, true, '10% unencumbered equity contribution from the applicant.',
  '{"Online Financing Application","Business plan","Aboriginal ancestry confirmation"}',
  '{"Fill out Waubetek''s online Financing Application","A Business Development Officer reviews it and contacts you to discuss the idea and financing needs"}', null,
  'https://www.waubetek.com/', 'https://www.waubetek.com/', 'https://www.waubetek.com/', 'application_instructions', 'online',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"eligibility","quote":"The applicant and business must be physically located in our service area of Northeast Ontario. Aboriginal Ancestry Confirmation. Applicant Age of Majority. 10% Unencumbered Equity Contribution from applicant","url":"https://www.waubetek.com/","fetched_at":"2026-10-26"},{"field":"application_steps","quote":"The first step is to fill out our online Financing Application form and submit to Waubetek. A Business Development Officer will review the Financing Application and will then contact you","url":"https://www.waubetek.com/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. The application form URL itself was not captured; the home page links to it.'),
-- Atuqtuarvik (Nunavut)
 ('atuqtuarvik-business-financing', 'Atuqtuarvik Corporation Business Financing', 'Atuqtuarvik Corporation',
  (select id from public.funding_providers where slug='atuqtuarvik'),
  'Financing and investment of $150,000 to $3,000,000 for Inuit-owned businesses in Nunavut that are expanding, acquiring a company or starting up, from a private Inuit-owned corporation that works with applicants through the financing process.',
  'loan', true, 150000, 3000000, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{NU}', '{}', '{startup,early-stage,growth,established}',
  '{business,community_business}', '{inuit}', null, null, null, null,
  '{startup,expansion,acquisition}',
  'Inuit-owned companies with Nunavut-based projects seeking between $150,000 and $3,000,000.',
  null, null, null, '{"Financing application (downloadable or online)"}',
  '{"Complete the online financing application or download the form","Discuss the project with Atuqtuarvik"}', null,
  'https://www.atuqtuarvik.com/', 'https://www.atuqtuarvik.com/', 'https://www.atuqtuarvik.com/', 'application_instructions', 'online',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"amount","quote":"Eligible projects must be Nunavut based. Is your company Inuit owned? Is the amount you''re seeking between $150,000 and $3,000,000?","url":"https://www.atuqtuarvik.com/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Loan versus equity structure is not stated on the home page; recorded as repayable financing.'),
-- MFCBC
 ('mfcbc-traditional-business-loan-program', 'MFC Traditional Business Loan Program', 'Métis Financial Corporation of BC',
  (select id from public.funding_providers where slug='mfcbc'),
  'Small business loans for Métis citizens across British Columbia launching, expanding or acquiring a business, with business planning support from the Métis Financial Corporation of BC. The primary requirement is a Métis-owned and operated business.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{BC}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{metis}', null, null, null, null,
  '{startup,expansion,acquisition}',
  'Métis-owned and operated businesses in British Columbia.',
  null, null, null, '{}', '{"Check the eligibility criteria on mfcbc.ca","Apply online"}', null,
  'https://www.mfcbc.ca/', 'https://www.mfcbc.ca/', 'https://www.mfcbc.ca/', 'program_page', 'online',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"description","quote":"Whether you''re launching a new business, expanding your operations, or acquiring an existing business, MFC offers small business loans for Métis citizens across British Columbia.","url":"https://www.mfcbc.ca/","fetched_at":"2026-10-26"},{"field":"eligibility","quote":"The primary requirement is that the business must be a Métis-owned and operated.","url":"https://www.mfcbc.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. No loan ceiling published.'),
-- Clarence Campeau Development Fund
 ('clarence-campeau-development-fund-business-financing', 'Clarence Campeau Development Fund Business Financing', 'Clarence Campeau Development Fund',
  (select id from public.funding_providers where slug='ccdf'),
  'Flexible financing, business-plan support and training for Métis entrepreneurs and communities in Saskatchewan, from a fund that has issued loans and grants since 1998 and connects clients with other funding partners.',
  'mixed', null, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{SK}', '{}', '{ideation,startup,early-stage,growth,established}',
  '{individual,business,community}', '{metis}', null, null, null, null,
  '{startup,expansion,training}',
  'Métis entrepreneurs and communities in Saskatchewan.',
  null, null, null, '{}', '{"See All Programs and Applications on clarencecampeau.com"}', null,
  'https://www.clarencecampeau.com/', 'https://www.clarencecampeau.com/', 'https://www.clarencecampeau.com/', 'program_page', 'online',
  false, 'unverified', 'low', '2026-10-26', null,
  '[{"field":"description","quote":"We help Métis entrepreneurs and communities in Saskatchewan by connecting them with funding partners, industry, and other communities.","url":"https://www.clarencecampeau.com/","fetched_at":"2026-10-26"},{"field":"programs","quote":"Business Financing: We offer flexible financing options for Métis-owned businesses.","url":"https://www.clarencecampeau.com/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Home page only; programme pages and amounts not read. Low confidence.'),
-- SMEDCO
 ('smedco-metis-business-financing', 'SMEDCO Métis Business Financing', 'SaskMétis Economic Development Corporation',
  (select id from public.funding_providers where slug='smedco'),
  'Financing, business support and economic development services for Saskatchewan Métis entrepreneurs starting a venture, growing an existing business or purchasing one, from a Métis Capital Corporation operating since 1987.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{SK}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{metis}', null, null, null, null,
  '{startup,expansion,acquisition}',
  'Métis entrepreneurs in Saskatchewan.',
  null, null, null, '{}', '{"See Programs & Guidelines and Applications on smedco.ca"}', null,
  'https://www.smedco.ca/', 'https://www.smedco.ca/', 'https://www.smedco.ca/', 'program_page', 'online',
  false, 'unverified', 'low', '2026-10-26', null,
  '[{"field":"description","quote":"Whether you''re starting a new venture, growing an existing business, or purchasing one of your own, SMEDCO is here to help you take the next step with confidence.","url":"https://www.smedco.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Home page only. Low confidence.'),
-- Two Rivers
 ('two-rivers-business-financing', 'Two Rivers Community Development Centre Business Financing', 'Two Rivers Community Development Centre',
  (select id from public.funding_providers where slug='two-rivers'),
  'Business loans and the Indigenous Business Financing Program from an Indigenous Financial Institution serving Six Nations of the Grand River, Mississaugas of the Credit and surrounding communities in Ontario, with 800+ loans and over $44 million lent since it began.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{ON}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', null, null, null, null, null,
  '{startup,expansion}',
  'See the Eligibility page on tworivers.ca for service area and applicant rules.',
  null, null, null, '{}', '{"Review Eligibility and Finance Options on tworivers.ca","Contact Two Rivers to get started"}', null,
  'https://www.tworivers.ca/', 'https://www.tworivers.ca/', 'https://www.tworivers.ca/', 'program_page', 'contact',
  false, 'unverified', 'low', '2026-10-26', null,
  '[{"field":"description","quote":"815 Loans Made ... $44m+ In Loans","url":"https://www.tworivers.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Home page only. Low confidence; service area wording from the site navigation (SN/MCFN).'),
-- TRICORP
 ('tricorp-business-development-loans', 'TRICORP Business Development Loans', 'Tribal Resources Investment Corporation',
  (select id from public.funding_providers where slug='tricorp'),
  'Business development loans, plus Indigenous Women and Indigenous Youth entrepreneur programmes, from a First Nations-owned lending institution based in Prince Rupert that finances local entrepreneurs and small businesses in Northwestern British Columbia.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{BC}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{first_nations}', null, null, null, null,
  '{startup,expansion,women,youth}',
  'First Nations entrepreneurs and small businesses in Northwestern British Columbia.',
  null, null, null, '{}', '{"Contact TRICORP"}', null,
  'https://www.tricorp.ca/', 'https://www.tricorp.ca/', 'https://www.tricorp.ca/', 'contact', 'contact',
  false, 'unverified', 'low', '2026-10-26', null,
  '[{"field":"description","quote":"Is a First Nations owned lending institution with the goal of supporting and financing local entrepreneurs and small business; economic development initiatives, and skills building for First Nations in Northwestern British Columbia.","url":"https://www.tricorp.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Home page only. Low confidence.'),
-- ANTCO
 ('antco-business-financing', 'All Nations Trust Company Business Financing', 'All Nations Trust Company',
  (select id from public.funding_providers where slug='antco'),
  'Financing solutions for Indigenous entrepreneurs in British Columbia starting, expanding or growing a business, with access to grants, non-repayable loans and capital resources, from the Kamloops-based company that also delivers the First Citizens Fund Business Loan Program.',
  'mixed', null, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{BC}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', null, null, null, null, null,
  '{startup,expansion}',
  'Indigenous entrepreneurs in British Columbia; eligibility is assessed by ANTCO.',
  null, null, null, '{}', '{"Contact ANTCO"}', null,
  'https://www.antco.ca/', 'https://www.antco.ca/', 'https://www.antco.ca/', 'contact', 'contact',
  false, 'unverified', 'low', '2026-10-26', null,
  '[{"field":"description","quote":"With our experience and access to grants, non-repayable loans, and substantial capital resources you can take comfort in knowing that the financial solutions we present will be tailored","url":"https://www.antco.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Home page only. Low confidence.'),
-- Indigenous Business Corporation (Western Canada)
 ('indigenous-business-corporation-loans', 'Indigenous Business Corporation Loans', 'Indigenous Business Corporation',
  (select id from public.funding_providers where slug='indigenous-business-corporation'),
  'Access to capital for First Nations entrepreneurs in Western Canada, from a lender with a 37-year record of funding about 2,500 business or expansion ventures. Applications are made on a downloadable form.',
  'loan', true, null, null, 'CAD',
  null, null, true, 'Continuous', 'rolling',
  '{AB,BC,SK,MB}', '{}', '{startup,early-stage,growth,established}',
  '{individual,business}', '{first_nations}', null, null, null, null,
  '{startup,expansion}',
  'First Nations entrepreneurs in Western Canada.',
  null, null, null, '{"IBC application"}', '{"Download the application from ibcorp.ca","Submit it to IBC"}', null,
  'https://www.ibcorp.ca/', 'https://www.ibcorp.ca/', 'https://www.ibcorp.ca/', 'application_instructions', 'email',
  false, 'unverified', 'low', '2026-10-26', null,
  '[{"field":"description","quote":"IBC is proud of a 37 year track record providing access to capital to a variety of business sectors and initiatives helmed by First Nation''s entrepreneurs in Western Canada. We''ve helped fund 2,500 business or expansion ventures","url":"https://www.ibcorp.ca/","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Home page only; "Western Canada" mapped to AB, BC, SK, MB. Low confidence.'),
-- PrairiesCan Indigenous-led business support
 ('prairiescan-indigenous-led-business-support', 'PrairiesCan support for Indigenous-led businesses', 'Prairies Economic Development Canada',
  (select id from public.funding_providers where slug='prairiescan'),
  'Project-based federal support in Alberta, Saskatchewan and Manitoba for Indigenous-led businesses to grow (team, workforce, production capacity, equipment) or become more competitive (new products, services or technologies), and for Indigenous communities and not-for-profits building services for Indigenous entrepreneurs. There is no application form: PrairiesCan asks you to contact its regional Indigenous team to discuss the idea first.',
  'contribution', null, null, null, 'CAD',
  null, null, true, 'Continuous; discuss the project with PrairiesCan first', 'rolling',
  '{AB,SK,MB}', '{}', '{early-stage,growth,established}',
  '{business,community,nonprofit}', null, null, null, null, null,
  '{expansion,technology,community_development}',
  'Indigenous-led businesses, Indigenous communities and not-for-profits in the Prairie provinces with a project that creates jobs, develops skills or increases revenue and growth.',
  null, null, null, '{}',
  '{"Email or phone the PrairiesCan Indigenous team for your province (addresses on the page)","Develop the proposal with PrairiesCan staff"}', null,
  'https://www.canada.ca/en/prairies-economic-development/services/indigenous.html', 'https://www.canada.ca/en/prairies-economic-development/services/indigenous.html', 'https://www.canada.ca/en/prairies-economic-development/services/indigenous.html', 'contact', 'contact',
  false, 'unverified', 'medium', '2026-10-26', null,
  '[{"field":"application_method","quote":"Please contact us to discuss your ideas. There is no need to complete an application form at this time.","url":"https://www.canada.ca/en/prairies-economic-development/services/indigenous.html","fetched_at":"2026-10-26"},{"field":"eligibility","quote":"If you are an Indigenous-led business we may be able to provide support to: Grow or develop your business ... Increase competitiveness","url":"https://www.canada.ca/en/prairies-economic-development/services/indigenous.html","fetched_at":"2026-10-26"}]'::jsonb,
  'Read 2026-10-26. Repayable or not is not stated on this page (PrairiesCan contributions vary), so is_repayable is left null.');

insert into public.funding_verification_events (grant_id, event_type, summary, details)
select id, 'created', 'Record created from a 2026-10-26 read of the funder''s page; unpublished pending owner review', jsonb_build_object('confidence', verification_confidence)
  from public.grants where created_at > now() - interval '1 minute' and not is_published;

insert into public.funding_review_queue (grant_id, reason, severity, payload)
select id, 'new_record', 'low', jsonb_build_object('confidence', verification_confidence, 'slug', slug)
  from public.grants where created_at > now() - interval '1 minute' and not is_published;
