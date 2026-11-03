/**
 * Worked plan examples on /templates/indigenous-business-plan-examples.
 *
 * Three FICTIONAL businesses written in the same six sections as
 * PLAN_TEMPLATE, so a reader can see how the same structure changes with the
 * kind of business. Riverbend is the services example already used across the
 * templates; the tourism and retail examples are new. Every number is made up
 * to show the arithmetic. None is a benchmark, a typical business, or drawn
 * from a client: there are no client stories on this site.
 *
 * Guarded by src/data/__tests__/planExamples.test.ts: section ids must match
 * PLAN_TEMPLATE, and each example's funding mix must add up to its total.
 */
import { EXAMPLE_BUSINESS, PLAN_EXAMPLE } from '@/data/resourceTemplates';

export interface FundingLine { source: string; amount: number; status: 'in hand' | 'applied for' | 'to apply for' }

export interface PlanExample {
  id: string;
  name: string;
  type: string;
  summary: string;
  startupTotal: number;
  funding: FundingLine[];
  /** What this kind of business forces the plan to deal with. */
  differs: { revenue: string; biggestCost: string; mainRisk: string; impactChoice: string };
  sections: Record<string, string>;
}

export const EXAMPLES_NOTE =
  'All three businesses are fictional. Their names, numbers and conversations are made up to show how the plan structure works, and are not benchmarks or advice on what a business like yours will cost or earn.';

export const PLAN_EXAMPLES: PlanExample[] = [
  {
    id: 'services',
    name: EXAMPLE_BUSINESS,
    type: 'Services',
    summary: 'Bookkeeping and payroll for small businesses within an hour of the community.',
    startupTotal: 18470,
    funding: [
      { source: 'Owner savings', amount: 6000, status: 'in hand' },
      { source: 'Business loan', amount: 12470, status: 'applied for' },
    ],
    differs: {
      revenue: 'Steady monthly fees that build as clients sign on.',
      biggestCost: 'The owner’s time, then office rent and software.',
      mainRisk: 'Clients sign on more slowly than forecast.',
      impactChoice: 'One local part-time hire, trained toward a payroll certification.',
    },
    sections: PLAN_EXAMPLE,
  },
  {
    id: 'tourism',
    name: 'Northshore Paddle Trips',
    type: 'Tourism',
    summary: 'Guided half-day and full-day paddling trips on the lake, open from late May to mid-September.',
    startupTotal: 41800,
    funding: [
      { source: 'Owner savings', amount: 4500, status: 'in hand' },
      { source: 'Used canoes already owned, at appraised value', amount: 3300, status: 'in hand' },
      { source: 'Non-repayable contribution', amount: 14000, status: 'applied for' },
      { source: 'Business loan', amount: 20000, status: 'to apply for' },
    ],
    differs: {
      revenue: 'Almost all of it in four months, then none for eight.',
      biggestCost: 'Boats, safety equipment, a trailer and liability insurance.',
      mainRisk: 'Weather and a short season. A wet July is a lost year’s margin.',
      impactChoice: 'Seasonal guide jobs for young people, and any cultural content led and paid for by community knowledge keepers.',
    },
    sections: {
      vision: 'Northshore Paddle Trips takes visitors out on the lake with a trained local guide, so they see the shoreline safely and the money they spend stays in the community. In three years it aims to run two guides a day through the season. It will not run trips on water the community has asked visitors to stay off.',
      market: 'Visitors already stay at the two lodges and the campground but have no guided way onto the water. Both lodge managers said in March that guests ask for it weekly and that they would list the trips. The nearest guided paddling is two hours away. Evidence so far: those two conversations and 31 names on a sign-up list from the summer market.',
      products: 'A half-day trip at $95 a person and a full-day trip with lunch from a local caterer at $180, for groups of up to six. Each trip costs about $38 a person to run in guide wages, lunch, fuel and wear. Stories or teachings about the land are shared only where knowledge keepers have agreed, in the form they choose, and they are paid for their time.',
      operations: 'Boats and gear are stored in a rented shed by the public launch. The owner holds a paddling instructor certification and wilderness first aid, and two seasonal guides train for both in May. Insurance, the launch-use permit and the safety plan must all be in place before the first booking is taken. Main risks: weather cancellations, an injury on the water, and a guide leaving mid-season, each with a written response.',
      financial: 'Start-up cost is $41,800 for canoes, life jackets, a trailer, a radio, certifications and the first year’s insurance. It is funded by $4,500 of owner savings, canoes already owned and appraised at $3,300, a $14,000 contribution applied for, and a $20,000 loan still to apply for. Revenue arrives from June to September only, so the cash flow forecast holds a reserve from the season to make loan payments from October to May. In a wet year the plan covers loan payments but not the owner’s pay.',
      community: 'Planned, not yet true: two seasonal guide jobs for young people from the community, each with certification paid for by the business; lunches bought from a local caterer; and payment to knowledge keepers for any cultural content they choose to share. Measured each season by guide hours, local purchases and the knowledge keepers’ own view of how it went.',
    },
  },
  {
    id: 'retail',
    name: 'Cedar Lane General Store',
    type: 'Retail',
    summary: 'Groceries, hardware and household goods in a community whose nearest store is an hour’s drive away.',
    startupTotal: 96500,
    funding: [
      { source: 'Owner savings', amount: 12000, status: 'in hand' },
      { source: 'Non-repayable contribution', amount: 30000, status: 'applied for' },
      { source: 'Business loan', amount: 54500, status: 'applied for' },
    ],
    differs: {
      revenue: 'Daily sales with thin margins, steadier than tourism but slower to grow.',
      biggestCost: 'Opening stock, shelving and coolers, and freight on every order.',
      mainRisk: 'Spoilage and freight costs eating the margin.',
      impactChoice: 'Prices and stock chosen with residents, and two local jobs from opening day.',
    },
    sections: {
      vision: 'Cedar Lane General Store sells the groceries, hardware and household goods people now drive an hour to buy. Its aim is that a missing ingredient or a broken hinge is a five-minute errand. It will not sell items the community has asked retailers not to sell.',
      market: 'About 140 households live within a short drive, and the nearest store is an hour away. The owner ran a survey at the community hall in February; 62 households answered, and most said they make the long trip at least weekly. The three items asked for most were milk, bread and propane. The risk is that people keep doing a big monthly shop in town and only buy small items locally.',
      products: 'Fresh and dry groceries, basic hardware, propane exchange and household goods. The target is an average markup of 28% over cost including freight, with essentials priced lower and convenience items higher. Stock will change each quarter based on what sells and what customers ask for at the counter.',
      operations: 'The store leases an empty commercial building on the main road and opens six days a week. The owner and two local staff run it, with a weekly freight delivery from a wholesaler in the city. Before opening it needs a food premises permit, insurance and the propane storage approval. Main risks: spoilage, a missed freight delivery and theft, each with a written response.',
      financial: 'Start-up cost is $96,500: $38,000 of opening stock, $31,500 for shelving, coolers and a point-of-sale system, $15,000 of renovation and $12,000 of working capital. It is funded by $12,000 of owner savings, a $30,000 contribution applied for and a $54,500 loan applied for. Margins are thin, so the plan shows break-even only if spoilage stays under 3% of grocery sales; the downside case shows what happens at 6%.',
      community: 'Planned, not yet true: two local jobs from opening day, a stock list shaped by the household survey, and a counter suggestion book reviewed monthly. Measured each quarter by local staff hours, the number of households buying at least weekly, and the items added because customers asked.',
    },
  },
];

export const exampleTotal = (e: PlanExample) => e.funding.reduce((s, f) => s + f.amount, 0);
