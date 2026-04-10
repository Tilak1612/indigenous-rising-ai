-- ============================================================
-- Funding Alerts — Starter Grants Dataset (17 high-confidence)
-- ============================================================
--
-- All 17 rows ship with is_published = FALSE and last_verified = NULL.
-- The team MUST verify each row before flipping is_published = TRUE:
--   1. Open the funder's website (application_url)
--   2. Confirm the program is still active
--   3. Verify the amount range, eligibility, and intake schedule
--   4. Update any details that have changed
--   5. Set last_verified = CURRENT_DATE
--   6. Set is_published = TRUE
--
-- Until is_published = TRUE, NO row in this set is visible to users.
-- The frontend (PublicFunding.tsx) and the digest function both filter
-- by is_published = TRUE.
--
-- This dataset is a SCAFFOLD FOR VERIFICATION, not a source of truth.
-- AI training data has a cutoff and program details drift fast.
-- ============================================================

-- Federal programs (5)

INSERT INTO public.grants (
  name, funder, description,
  amount_min, amount_max, amount_currency,
  deadline, is_recurring, recurrence_notes,
  provinces, industries, business_stages,
  eligibility_notes, application_url,
  is_published, last_verified
) VALUES
(
  'Aboriginal Entrepreneurship Program',
  'Indigenous Services Canada',
  'Federal program supporting Indigenous entrepreneurs through capital access and business development services delivered by a national network of Indigenous Financial Institutions.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Year-round intake through regional Indigenous Financial Institutions',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY[]::TEXT[],
  ARRAY['ideation','startup','early-stage','growth','established'],
  'Open to First Nations, Inuit, and Métis individuals and businesses. Eligibility varies by partner Indigenous Financial Institution.',
  'https://www.sac-isc.gc.ca/eng/1100100033414/1100100033415',
  FALSE, NULL
),
(
  'Indigenous Entrepreneur Startup Program',
  'Futurpreneur Canada',
  'Combined startup loan and two years of one-on-one mentorship for Indigenous entrepreneurs aged 18-39 launching or growing a business in its first year of operation.',
  20000, 60000, 'CAD',
  NULL, TRUE, 'Year-round applications',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage'],
  'Indigenous applicants ages 18-39. Business must be in its first year of operation. Loan structure typically combines a Futurpreneur loan with a BDC matching loan.',
  'https://www.futurpreneur.ca/en/indigenous-entrepreneur-startup-program/',
  FALSE, NULL
),
(
  'BDC Indigenous Entrepreneur Loan',
  'Business Development Bank of Canada',
  'Financing for Indigenous entrepreneurs to start, expand, or acquire a business. Includes flexible repayment terms and access to advisory services.',
  NULL, 350000, 'CAD',
  NULL, TRUE, 'Rolling intake',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'Open to First Nations, Inuit, and Métis entrepreneurs and Indigenous-owned businesses. Eligibility based on standard BDC lending criteria.',
  'https://www.bdc.ca/en/i-am/aboriginal-entrepreneur',
  FALSE, NULL
),
(
  'Strategic Partnerships Initiative',
  'Indigenous Services Canada',
  'Federal program supporting multi-partner economic development initiatives that involve Indigenous communities and the private sector. Focused on key economic sectors and collaborative projects.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Project-based intake; contact regional ISC office',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY['Agriculture & Forestry','Energy & Mining','Hospitality & Tourism'],
  ARRAY['growth','established'],
  'Indigenous communities, organizations, and businesses participating in multi-partner economic development projects.',
  'https://www.sac-isc.gc.ca/eng/1331657507074/1533645155560',
  FALSE, NULL
),
(
  'CanExport SMEs',
  'Global Affairs Canada',
  'Non-repayable funding to help Canadian small and medium businesses (including Indigenous-owned SMEs) develop new export markets. Covers up to 50 percent of eligible activities.',
  10000, 50000, 'CAD',
  NULL, TRUE, 'Continuous intake',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY[]::TEXT[],
  ARRAY['early-stage','growth','established'],
  'Canadian SMEs with up to 500 full-time employees and annual revenue between $100,000 and $100 million. Indigenous-owned businesses are explicitly encouraged to apply.',
  'https://www.tradecommissioner.gc.ca/funding-financement/canexport/sme-pme/index.aspx',
  FALSE, NULL
);

-- National Indigenous organizations (2)

INSERT INTO public.grants (
  name, funder, description,
  amount_min, amount_max, amount_currency,
  deadline, is_recurring, recurrence_notes,
  provinces, industries, business_stages,
  eligibility_notes, application_url,
  is_published, last_verified
) VALUES
(
  'Indigenous Tourism Development Fund',
  'Indigenous Tourism Association of Canada (ITAC)',
  'Funding programs for Indigenous tourism businesses and entrepreneurs to develop, market, and grow their tourism offerings across Canada.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Multiple intakes per year',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY['Hospitality & Tourism','Arts & Crafts'],
  ARRAY['startup','early-stage','growth','established'],
  'Indigenous-owned tourism businesses (51%+ Indigenous ownership). Membership in ITAC or affiliated regional Indigenous tourism organization typically required.',
  'https://indigenoustourism.ca/',
  FALSE, NULL
),
(
  'NACCA Aboriginal Business Financing Program',
  'National Aboriginal Capital Corporations Association',
  'Network of 50+ Indigenous Financial Institutions (AFIs) across Canada offering business loans, non-repayable contributions, and developmental lending to First Nations, Métis, and Inuit entrepreneurs.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Year-round through regional AFIs',
  ARRAY['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'],
  ARRAY[]::TEXT[],
  ARRAY['ideation','startup','early-stage','growth','established'],
  'Indigenous entrepreneurs and businesses. Specific eligibility, loan ceilings, and contribution caps vary by regional AFI.',
  'https://nacca.ca/',
  FALSE, NULL
);

-- Provincial / Territorial — Western Canada (4)

INSERT INTO public.grants (
  name, funder, description,
  amount_min, amount_max, amount_currency,
  deadline, is_recurring, recurrence_notes,
  provinces, industries, business_stages,
  eligibility_notes, application_url,
  is_published, last_verified
) VALUES
(
  'Alberta Indigenous Opportunities Corporation Loan Guarantees',
  'Alberta Indigenous Opportunities Corporation (AIOC)',
  'Loan guarantees that support Indigenous communities to invest in major natural resource and infrastructure projects in Alberta. Enables access to commercial financing on favourable terms.',
  20000000, NULL, 'CAD',
  NULL, TRUE, 'Project-based intake',
  ARRAY['AB'],
  ARRAY['Energy & Mining','Construction','Transportation'],
  ARRAY['established'],
  'Alberta-based Indigenous communities and Indigenous-owned entities investing in eligible major projects (typically energy, mining, transportation, telecom).',
  'https://www.theaioc.com/',
  FALSE, NULL
),
(
  'NEDC Business Loan',
  'Nuu-chah-nulth Economic Development Corporation',
  'Indigenous Financial Institution serving First Nations entrepreneurs and businesses on Vancouver Island and the central and north coast of British Columbia.',
  NULL, 250000, 'CAD',
  NULL, TRUE, 'Rolling intake',
  ARRAY['BC'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'First Nations individuals and Indigenous-owned businesses operating on Vancouver Island and BC coastal regions served by NEDC.',
  'https://nedc.info/',
  FALSE, NULL
),
(
  'Saskatchewan Indian Equity Foundation Business Loan',
  'Saskatchewan Indian Equity Foundation (SIEF)',
  'Indigenous Financial Institution providing business loans, capital, and developmental lending services to First Nations entrepreneurs across Saskatchewan.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Year-round applications',
  ARRAY['SK'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'First Nations individuals and First Nations-owned businesses operating in Saskatchewan.',
  'https://www.sief.sk.ca/',
  FALSE, NULL
),
(
  'Louis Riel Capital Corporation Métis Business Loan',
  'Louis Riel Capital Corporation',
  'Métis-specific Indigenous Financial Institution providing business loans, equity contributions, and entrepreneurship support to Métis citizens of Manitoba.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Year-round intake',
  ARRAY['MB'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'Citizens of the Manitoba Metis Federation operating or planning a business in Manitoba.',
  'https://lrcc.mb.ca/',
  FALSE, NULL
);

-- Provincial / Territorial — Central Canada (2)

INSERT INTO public.grants (
  name, funder, description,
  amount_min, amount_max, amount_currency,
  deadline, is_recurring, recurrence_notes,
  provinces, industries, business_stages,
  eligibility_notes, application_url,
  is_published, last_verified
) VALUES
(
  'Indigenous Economic Development Fund',
  'Government of Ontario',
  'Provincial fund supporting Indigenous economic development, business growth, and partnerships across Ontario. Includes streams for entrepreneurs, communities, and partnerships.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Annual intake periods; check program for current deadline',
  ARRAY['ON'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'Indigenous businesses, communities, and organizations operating in Ontario. Specific stream eligibility varies.',
  'https://www.ontario.ca/page/indigenous-economic-development-fund',
  FALSE, NULL
),
(
  'SOCCA Business Loan and Mentorship',
  'Société de crédit commercial autochtone (SOCCA)',
  'Indigenous Financial Institution serving First Nations entrepreneurs in Quebec with business loans, mentorship, and developmental lending.',
  NULL, 250000, 'CAD',
  NULL, TRUE, 'Year-round intake',
  ARRAY['QC'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'First Nations individuals and First Nations-owned businesses in Quebec, excluding the territory served by Eeyou Economic Group.',
  'https://socca.qc.ca/',
  FALSE, NULL
);

-- Provincial / Territorial — Atlantic Canada (1)

INSERT INTO public.grants (
  name, funder, description,
  amount_min, amount_max, amount_currency,
  deadline, is_recurring, recurrence_notes,
  provinces, industries, business_stages,
  eligibility_notes, application_url,
  is_published, last_verified
) VALUES
(
  'Ulnooweg Indigenous Business Loan',
  'Ulnooweg Development Group',
  'Indigenous Financial Institution serving First Nations and Indigenous-owned businesses in Atlantic Canada. Offers business loans, advisory services, and youth entrepreneurship programming.',
  NULL, 250000, 'CAD',
  NULL, TRUE, 'Rolling intake',
  ARRAY['NB','NS','PE','NL'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'First Nations individuals and Indigenous-owned businesses in New Brunswick, Nova Scotia, Prince Edward Island, and Newfoundland and Labrador.',
  'https://ulnooweg.ca/',
  FALSE, NULL
);

-- Territories (3)

INSERT INTO public.grants (
  name, funder, description,
  amount_min, amount_max, amount_currency,
  deadline, is_recurring, recurrence_notes,
  provinces, industries, business_stages,
  eligibility_notes, application_url,
  is_published, last_verified
) VALUES
(
  'Métis Dene Development Fund',
  'Métis Dene Development Fund Ltd.',
  'Indigenous Financial Institution providing business loans, equity, and entrepreneurship support to Métis and Dene entrepreneurs in the Northwest Territories.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Year-round intake',
  ARRAY['NT'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'Métis and Dene individuals and Indigenous-owned businesses operating in the Northwest Territories.',
  'https://www.mddf.ca/',
  FALSE, NULL
),
(
  'Nunavut Business Credit Corporation Loan',
  'Nunavut Business Credit Corporation',
  'Territorial financial institution providing commercial loans and contract financing to small and medium businesses operating in Nunavut, including a focus on Inuit-owned enterprises.',
  NULL, NULL, 'CAD',
  NULL, TRUE, 'Rolling intake',
  ARRAY['NU'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'Small and medium businesses operating in Nunavut. Inuit-owned businesses are a core focus.',
  'https://www.gov.nu.ca/eia/programs-services/nunavut-business-credit-corporation',
  FALSE, NULL
),
(
  'däna Näye Ventures Business Loan',
  'däna Näye Ventures',
  'Indigenous Financial Institution serving First Nations entrepreneurs and Indigenous-owned businesses across Yukon. Provides loans, business advisory, and development services.',
  NULL, 250000, 'CAD',
  NULL, TRUE, 'Year-round intake',
  ARRAY['YT'],
  ARRAY[]::TEXT[],
  ARRAY['startup','early-stage','growth','established'],
  'First Nations individuals and Indigenous-owned businesses operating in Yukon Territory.',
  'https://danenaye.com/',
  FALSE, NULL
);
