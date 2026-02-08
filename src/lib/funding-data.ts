export interface FundingOpportunity {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  province: string;
  industry: string;
  description: string;
}

export const fundingOpportunities: FundingOpportunity[] = [
  {
    id: '1',
    name: 'Indigenous Business Development Fund',
    amount: '$50,000',
    deadline: '2025-04-15',
    province: 'National',
    industry: 'All Sectors',
    description: 'Support for Indigenous-owned businesses across Canada',
  },
  {
    id: '2',
    name: 'Aboriginal Entrepreneurship Program',
    amount: '$25,000',
    deadline: '2025-03-30',
    province: 'Ontario',
    industry: 'Technology',
    description: 'Tech sector funding for Indigenous entrepreneurs',
  },
  {
    id: '3',
    name: 'First Nations Economic Development',
    amount: '$75,000',
    deadline: '2025-05-20',
    province: 'British Columbia',
    industry: 'Tourism',
    description: 'Tourism and cultural business development',
  },
];

export function getOpportunityById(id: string) {
  return fundingOpportunities.find((f) => f.id === id) || null;
}
