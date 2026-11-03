/**
 * Indigenous lenders for /indigenous-financial-institutions-directory.
 *
 * Transcribed from public.funding_providers and the grants linked to them, as
 * researched for the funding catalogue on 26 October 2026
 * (supabase/migrations/20261026000002_funding_catalogue_2026_10.sql). The
 * province codes are the regions each institution states it serves; the
 * `area` notes repeat what the institution's own site says and are never
 * inferred from an office address.
 *
 * This is NOT the full list. NACCA's member listing is the authority for the
 * whole network, and the page links to it above this list.
 *
 * `programme` is set only when a PUBLISHED /funding/<slug> page exists, so the
 * page never links to an unpublished record. Guarded by
 * src/data/__tests__/lenders.test.ts.
 */
export type LenderType = 'ifi' | 'metis_capital_corporation' | 'lender' | 'crown_corporation';

export interface Lender {
  slug: string;
  name: string;
  type: LenderType;
  /** Province/territory codes the institution states it serves. */
  regions: string[];
  website: string;
  /** The institution's own description of its service area or focus. */
  area?: string;
  /** Published programme page on this site, if one exists. */
  programme?: { slug: string; name: string };
}

export const LENDERS_CHECKED = '2026-10-26';
export const NACCA_LISTINGS_URL = 'https://nacca.ca/indigenous-financial-institutions-listings';

export const LENDER_TYPE_LABELS: Record<LenderType, string> = {
  ifi: 'Indigenous Financial Institution',
  metis_capital_corporation: 'Métis capital corporation',
  lender: 'Indigenous-led lender',
  crown_corporation: 'Public lender',
};

export const LENDERS: Lender[] = [
  { slug: 'aiic', name: 'Alberta Indian Investment Corporation', type: 'ifi', regions: ['AB'], website: 'https://aiicbusiness.org/' },
  { slug: 'antco', name: 'All Nations Trust Company', type: 'ifi', regions: ['BC'], website: 'https://www.antco.ca/' },
  { slug: 'ccdf', name: 'Clarence Campeau Development Fund', type: 'ifi', regions: ['SK'], website: 'https://www.clarencecampeau.com/', area: 'A Métis development fund in Saskatchewan.' },
  {
    slug: 'dana-naye-ventures', name: 'däna Näye Ventures', type: 'ifi', regions: ['YT'], website: 'https://www.dananaye.com/',
    area: 'Yukon. Its loan-funds page also mentions residents of Northern British Columbia.',
    programme: { slug: 'dana-naye-ventures-business-loan', name: 'däna Näye Ventures Business Loan' },
  },
  { slug: 'indigenous-business-corporation', name: 'Indigenous Business Corporation', type: 'ifi', regions: ['AB', 'BC', 'SK', 'MB'], website: 'https://www.ibcorp.ca/', area: "Its site describes serving First Nation's entrepreneurs in Western Canada." },
  {
    slug: 'mddf', name: 'Métis Dene Development Fund', type: 'ifi', regions: ['NT'], website: 'https://www.mddf.ca/',
    programme: { slug: 'metis-dene-development-fund', name: 'Métis Dene Development Fund' },
  },
  { slug: 'nadf', name: 'Nishnawbe Aski Development Fund', type: 'ifi', regions: ['ON'], website: 'https://www.nadf.org/', area: 'Northern Ontario.' },
  {
    slug: 'nedc', name: 'Nuu-chah-nulth Economic Development Corporation', type: 'ifi', regions: ['BC'], website: 'https://nedc.info/',
    area: 'Vancouver Island.',
    programme: { slug: 'nedc-business-loan', name: 'NEDC Business Loan' },
  },
  {
    slug: 'sief', name: 'Saskatchewan Indian Equity Foundation', type: 'ifi', regions: ['SK'], website: 'https://www.sief.sk.ca/',
    programme: { slug: 'saskatchewan-indian-equity-foundation-business-loan', name: 'Saskatchewan Indian Equity Foundation Business Loan' },
  },
  {
    slug: 'socca', name: 'Société de crédit commercial autochtone', type: 'ifi', regions: ['QC'], website: 'https://socca.qc.ca/',
    programme: { slug: 'socca-business-loan-and-mentorship', name: 'SOCCA Business Loan and Mentorship' },
  },
  { slug: 'tacc', name: "Tale'awtxw Aboriginal Capital Corporation", type: 'ifi', regions: ['BC'], website: 'https://www.tacc.ca/', area: 'Coast Salish territory.' },
  { slug: 'tricorp', name: 'Tribal Resources Investment Corporation', type: 'ifi', regions: ['BC'], website: 'https://www.tricorp.ca/', area: 'Northwestern British Columbia.' },
  { slug: 'two-rivers', name: 'Two Rivers Community Development Centre', type: 'ifi', regions: ['ON'], website: 'https://www.tworivers.ca/', area: 'The Six Nations and Mississaugas of the Credit area.' },
  {
    slug: 'ulnooweg', name: 'Ulnooweg Development Group', type: 'ifi', regions: ['NB', 'NS', 'PE', 'NL'], website: 'https://ulnoowegdevelopmentgroup.ca/',
    programme: { slug: 'ulnooweg-indigenous-business-loan', name: 'Ulnooweg Indigenous Business Loan' },
  },
  { slug: 'waubetek', name: 'Waubetek Business Development Corporation', type: 'ifi', regions: ['ON'], website: 'https://www.waubetek.com/', area: 'Northeastern Ontario.' },
  {
    slug: 'lrcc', name: 'Louis Riel Capital Corporation', type: 'metis_capital_corporation', regions: ['MB'], website: 'https://lrcc.mb.ca/',
    programme: { slug: 'louis-riel-capital-corporation-metis-business-loan', name: 'Louis Riel Capital Corporation Small Business Grant & Loan Program' },
  },
  { slug: 'mfcbc', name: 'Métis Financial Corporation of BC', type: 'metis_capital_corporation', regions: ['BC'], website: 'https://www.mfcbc.ca/' },
  { slug: 'smedco', name: 'SaskMétis Economic Development Corporation', type: 'metis_capital_corporation', regions: ['SK'], website: 'https://www.smedco.ca/' },
  { slug: 'atuqtuarvik', name: 'Atuqtuarvik Corporation', type: 'lender', regions: ['NU'], website: 'https://www.atuqtuarvik.com/', area: 'A private, Inuit-owned lender in Nunavut.' },
  { slug: 'fpegf', name: 'First Peoples Economic Growth Fund', type: 'lender', regions: ['MB'], website: 'https://firstpeoplesfund.ca/', area: 'An initiative of the Province of Manitoba and the Assembly of Manitoba Chiefs.' },
  {
    slug: 'bdc', name: 'Business Development Bank of Canada', type: 'crown_corporation', regions: [], website: 'https://www.bdc.ca/',
    programme: { slug: 'bdc-indigenous-entrepreneur-loan', name: 'BDC Indigenous Entrepreneur Loan' },
  },
  {
    slug: 'nbcc', name: 'Nunavut Business Credit Corporation', type: 'crown_corporation', regions: ['NU'], website: 'https://www.gov.nu.ca/',
    area: 'A territorial Crown corporation.',
    programme: { slug: 'nunavut-business-credit-corporation-loan', name: 'Nunavut Business Credit Corporation Loan' },
  },
];
