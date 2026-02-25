import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ShinyButton } from '@/components/ui/shiny-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

type Role = {
  title: string;
  team: string;
  mission: string;
  responsibilities: string[];
  qualifications: string[];
  hiringNowReason?: string;
};

const rolesByCategory: Array<{ category: string; roles: Role[] }> = [
  {
    category: 'Product & Engineering',
    roles: [
      {
        title: 'Product Manager — Indigenous Business Tools',
        team: 'Product & Engineering',
        mission:
          "You will own the roadmap for core platform features — the Business Planning Assistant, Funding Navigator, and Community Impact Tracker — ensuring every product decision reflects Indigenous values, OCAP™ principles, and genuine community need. You will be the bridge between engineering, community partners, and Elders who help guide the platform's direction. This role is central to ensuring that what we build actually serves the communities it was made for.",
        responsibilities: [
          'Define and maintain the product roadmap across the Business Planning Assistant, Funding Navigator (500+ grants), Impact Tracker, and Training & Certification modules',
          'Lead discovery sessions with Indigenous entrepreneurs, community organizations, and Elders to identify and prioritize features',
          'Write clear, culturally-informed user stories and acceptance criteria for engineering sprints',
          'Partner with the Community Engagement Lead to run ongoing feedback loops with First Nations, Métis, and Inuit users',
          'Ensure all product decisions are reviewed against OCAP™ principles and Indigenous data sovereignty guidelines',
          'Track product usage metrics and translate them into community impact indicators (not just SaaS KPIs)',
          'Work with the Compliance & Data Stewardship Lead to document data flows and governance decisions',
        ],
        qualifications: [
          '2–5 years of product management experience, ideally in SaaS or mission-driven technology',
          'Direct experience working with or within First Nations, Métis, or Inuit communities — or demonstrated commitment to learning and relationship-building',
          'Familiarity with OCAP™ principles, Indigenous data sovereignty, or community-based research methodologies',
          'Strong written communication and ability to translate complex technical concepts into plain language for community partners',
          'Comfortable in a remote, async-first startup environment and able to wear multiple hats',
        ],
      },
      {
        title: 'Full-Stack Engineer — Platform & Integrations',
        team: 'Product & Engineering',
        mission:
          'You will build and maintain the core infrastructure of Indigenous Rising AI — the APIs, integrations, and user-facing features that Indigenous entrepreneurs rely on daily. Your work directly enables access to funding, community impact measurement, and culturally grounded business planning tools. You will help ensure the platform is fast, accessible, and built to the highest standards of data privacy and Indigenous data sovereignty.',
        responsibilities: [
          'Build and maintain full-stack features across the Funding Navigator, Business Planning Assistant, Impact Tracker, and Training modules',
          'Develop and maintain API integrations with funding databases, government portals, and partner data sources',
          'Implement PIPEDA-compliant data handling and storage, ensuring all user data remains in Canada',
          'Contribute to AODA accessibility compliance across all platform interfaces',
          'Collaborate with the ML Engineer on responsible AI feature integration',
          'Participate in code reviews and help establish engineering standards aligned with OCAP™ data governance',
          'Support backend infrastructure on Lovable Cloud and maintain system reliability',
        ],
        qualifications: [
          '3+ years of full-stack development experience (React/Next.js, Node.js, or similar stack)',
          'Experience with cloud infrastructure, API design, and database management',
          'Understanding of Canadian data privacy law (PIPEDA) and security best practices',
          'Interest in or experience with Indigenous communities, cultural safety in technology, or responsible AI',
          'Ability to work independently in a remote-first, early-stage environment',
        ],
        hiringNowReason:
          "The Funding Navigator, Impact Tracker, and Training & Certification modules are in active development and need a skilled full-stack engineer to ship features, maintain platform stability, and build the integrations that connect Indigenous entrepreneurs to real funding opportunities. Without this role filled, our development velocity stalls — and so does the community's access to tools they are waiting for.",
      },
      {
        title: 'Machine Learning Engineer — Responsible & OCAP-Aligned AI',
        team: 'Product & Engineering',
        mission:
          'You will design and deploy the AI systems at the heart of Indigenous Rising AI — the Business Planning Assistant, funding recommendation engine, and community impact models — in ways that are transparent, explainable, and grounded in Indigenous data sovereignty. This is not extractive AI. You will work directly with community partners and governance frameworks to ensure our models serve communities rather than exploiting community data.',
        responsibilities: [
          'Build, fine-tune, and maintain the AI models powering the Business Planning Assistant and Funding Navigator recommendation engine',
          'Develop model documentation and explainability layers so communities can understand how recommendations are generated',
          'Apply OCAP™ principles to all data collection, model training, and output pipelines — including community consent protocols',
          'Collaborate with the Compliance & Data Stewardship Lead to audit AI models for bias, cultural safety, and harm reduction',
          'Monitor model performance with community-defined success metrics, not just accuracy scores',
          'Stay current on Indigenous AI ethics frameworks and emerging best practices in responsible AI for marginalized communities',
          'Participate in community feedback sessions to gather input on AI performance and cultural appropriateness',
        ],
        qualifications: [
          '3+ years of ML engineering experience, including model deployment in production environments',
          'Familiarity with responsible AI frameworks, algorithmic fairness, and explainable AI methodologies',
          'Experience with or strong interest in Indigenous data sovereignty, OCAP™, or community-based data governance',
          'Ability to communicate technical concepts clearly to non-technical community stakeholders',
          'Python proficiency; experience with NLP/LLM pipelines a strong asset',
        ],
        hiringNowReason:
          'The Business Planning Assistant and Funding Navigator recommendation engine are the core AI differentiators of the platform. We need a responsible AI engineer who can build these systems in ways that are explainable, community-governed, and OCAP™-compliant from day one — before user scale makes course-correction difficult. Getting this right early is essential to community trust.',
      },
    ],
  },
  {
    category: 'Customer & Growth',
    roles: [
      {
        title: 'Customer Success Lead — Indigenous Entrepreneurs',
        team: 'Customer & Growth',
        mission:
          'You are the primary relationship holder between Indigenous Rising AI and the entrepreneurs we serve. You ensure that First Nations, Métis, and Inuit business owners can confidently use every tool on the platform — from finding their first grant through the Funding Navigator to measuring community impact over seven generations. You make onboarding feel like a welcome, not a transaction.',
        responsibilities: [
          'Lead onboarding for new Indigenous entrepreneur users, ensuring cultural safety and platform confidence from day one',
          'Provide ongoing support through training sessions, one-on-one check-ins, and community office hours',
          'Develop culturally appropriate onboarding materials, tutorials, and help documentation',
          'Collect and synthesize user feedback for the Product Manager and Community Engagement Lead',
          'Track user adoption, engagement, and satisfaction metrics — and translate them into community impact stories',
          'Escalate data governance or cultural safety concerns to the Compliance & Data Stewardship Lead',
          'Serve as a knowledgeable resource on available grant programs, business planning support, and platform features',
        ],
        qualifications: [
          'Experience in customer success, community services, or program delivery — ideally in a context serving Indigenous communities',
          'Genuine understanding of the barriers facing Indigenous entrepreneurs and deep respect for community protocols',
          'Strong verbal and written communication in English; French or an Indigenous language is a significant asset',
          'Comfortable using SaaS platforms and able to guide others through digital tools with patience and clarity',
          'Willingness to work flexible hours to accommodate the schedules of entrepreneurs across multiple time zones',
        ],
        hiringNowReason:
          'As our Founding Partners waitlist converts into active users, the onboarding experience will define whether Indigenous entrepreneurs trust and adopt the platform long-term. We need someone who can deliver a culturally safe, high-quality onboarding experience and build the feedback loops that inform our next product priorities. First impressions in community settings carry lasting weight.',
      },
      {
        title: 'Implementation Specialist — Funding & Training Programs',
        team: 'Customer & Growth',
        mission:
          'You will help Indigenous entrepreneurs and community organizations successfully navigate the Funding Navigator and Training & Certification modules — turning complex grant landscapes and skills-development programs into accessible, actionable pathways. Your work directly reduces the barriers that keep Indigenous entrepreneurs from accessing capital they are entitled to.',
        responsibilities: [
          'Guide users through the Funding Navigator, helping match entrepreneurs with relevant grants, loans, and government programs',
          'Support delivery of platform training and certification programs, including scheduling, facilitation, and follow-up',
          'Build out a library of funding guides, application tips, and training resources tailored to First Nations, Métis, and Inuit entrepreneurs',
          'Coordinate with partner funding organizations and government bodies to keep funding data current and accessible',
          'Track user progress through training pathways and report completion and outcomes data',
          'Work with Customer Success Lead to identify users who need additional support or escalation',
          'Contribute to continuous improvement of the onboarding and training experience',
        ],
        qualifications: [
          'Background in program coordination, employment services, economic development, or a related field',
          'Familiarity with Indigenous business funding landscape in Canada (NACCA, NWAC, CCAB, provincial programs, etc.)',
          'Experience working within or alongside First Nations, Métis, or Inuit communities or organizations',
          'Strong organizational skills and ability to manage multiple users and programs simultaneously',
          'Comfort with remote work tools; experience with SaaS platforms a plus',
        ],
      },
      {
        title: 'Growth Marketer — Community & Education',
        team: 'Customer & Growth',
        mission:
          'You will build awareness of Indigenous Rising AI in ways that are community-led, culturally grounded, and trust-first. You will not run extractive ad campaigns or use manipulative growth tactics. Instead, you will grow the platform through educational content, authentic partnerships, and a deep respect for how trust is built in Indigenous communities — slowly, relationally, and with integrity.',
        responsibilities: [
          'Develop and execute content marketing strategies including the SEO blog program (20+ topics targeting Canadian Indigenous entrepreneurship keywords)',
          'Create and manage social media content across LinkedIn and Twitter/X with a culturally sensitive, strengths-based voice',
          'Build and manage the email newsletter and Founding Partners waitlist campaign (target: 500 Founding Partners)',
          'Collaborate with the Community Engagement Lead to ensure all marketing reflects authentic Indigenous voices and avoids stereotyping or misrepresentation',
          'Track and report on SEO performance, email open rates, and waitlist growth',
          'Source and publish community success stories with explicit consent and community review',
          'Develop partnerships with Indigenous media, podcasts, and education platforms for organic reach',
        ],
        qualifications: [
          '2–4 years of content marketing, community marketing, or growth experience',
          'Deep understanding of cultural safety in communications — especially regarding Indigenous peoples and communities',
          'Strong writing skills with the ability to adapt tone from educational blog posts to short social copy',
          'Experience with SEO, email marketing platforms, and social media scheduling tools',
          'Willingness to learn from Indigenous community members and actively integrate feedback into content strategy',
        ],
      },
    ],
  },
  {
    category: 'Community & Partnerships',
    roles: [
      {
        title: 'Indigenous Community Engagement Lead',
        team: 'Community & Partnerships',
        mission:
          'You are the living relationship between Indigenous Rising AI and the communities we are built to serve. You ensure our platform is genuinely co-created — not just consulted on — by First Nations, Métis, and Inuit community members, Elders, and organizations. This role is the conscience of the company, the voice that ensures we remain accountable to the communities whose trust we hold.',
        responsibilities: [
          'Build and steward authentic relationships with Indigenous community organizations, Elders, and entrepreneurs across Canada',
          'Design and facilitate co-creation sessions, feedback circles, and community review processes for product development',
          'Develop and maintain a Community Advisory structure that gives Indigenous voices ongoing, meaningful input into platform governance',
          'Represent community perspectives in internal product, policy, and communications decisions',
          'Lead the Cultural Safety Review process for new features, content, and partner onboarding',
          'Maintain a community engagement calendar that respects Indigenous protocols around timing, relationship-building, and reciprocity',
          'Document community engagement processes in alignment with OCAP™ principles',
        ],
        qualifications: [
          'First Nations, Métis, or Inuit identity strongly preferred — we encourage Indigenous peoples to apply',
          'Deep experience in community engagement, Indigenous program delivery, or cultural liaison work',
          'Strong knowledge of OCAP™ principles, Indigenous governance models, and community-based research ethics',
          'Ability to navigate relationships with Elders, community leaders, and grassroots entrepreneurs with equal respect',
          'Comfortable working remotely with periodic travel to community partners across Canada',
        ],
        hiringNowReason:
          'Co-creation is not a feature — it is the foundation of everything we build. As the platform moves toward public launch, we must deepen our relationships with First Nations, Métis, and Inuit communities in ways that go beyond traditional consultation. This role ensures those relationships exist before we need them, not after.',
      },
      {
        title: 'Partnerships Manager — Indigenous Organizations & Funding Bodies',
        team: 'Community & Partnerships',
        mission:
          "You will build the formal partnership ecosystem that amplifies Indigenous Rising AI's reach and impact — connecting the platform with Indigenous development corporations, funding bodies, economic development organizations, and corporate partners seeking authentic Indigenous procurement relationships. You ensure every partnership is built on respect, mutual benefit, and clearly defined community benefit.",
        responsibilities: [
          'Identify, cultivate, and close partnerships with Indigenous financial institutions, development corporations, and government economic development programs',
          'Manage the Corporate Partnership Matcher pipeline, vetting corporate partners for authenticity and alignment with Indigenous values',
          'Develop partnership agreements that include OCAP™-aligned data sharing terms and community benefit clauses',
          'Coordinate with the Community Engagement Lead to ensure all partnerships are reviewed by community representatives before finalization',
          'Represent Indigenous Rising AI at Indigenous business conferences, trade events, and economic development forums',
          'Track partnership outcomes and report impact metrics to community governance structures',
          'Maintain a living knowledge base of funding opportunities for integration into the Funding Navigator',
        ],
        qualifications: [
          'Experience in partnerships, business development, or economic development — ideally within Indigenous-focused organizations or programs',
          'Familiarity with the Indigenous funding and economic development landscape in Canada (NACCA, AFOA, BDC Indigenous programs, provincial CDCs, CCAB, etc.)',
          'Experience working with First Nations, Métis, or Inuit organizations in a professional capacity',
          'Strong relationship-building skills and understanding of Indigenous protocols around partnership and reciprocity',
          'Comfortable with contract negotiation and partnership agreement management',
        ],
      },
    ],
  },
  {
    category: 'Operations & Governance',
    roles: [
      {
        title: 'Operations Coordinator — Programs & Training',
        team: 'Operations & Governance',
        mission:
          'You will keep the operational engine of Indigenous Rising AI running smoothly — coordinating training programs, managing vendor relationships, supporting team workflows, and ensuring we have the operational infrastructure to scale responsibly. In an early-stage company, you will be the person who makes sure nothing falls through the cracks.',
        responsibilities: [
          'Coordinate logistics for training programs, community sessions, webinars, and certification events',
          'Manage internal project tracking, meeting coordination, and cross-team communications',
          'Support the onboarding of new team members and community partners',
          'Maintain operational documentation, SOPs, and internal knowledge bases',
          'Assist with grant reporting, compliance tracking, and program evaluation requirements',
          'Manage vendor and tool contracts (subscription management, procurement, etc.)',
          'Support the Executive team with scheduling, communications, and event coordination',
        ],
        qualifications: [
          '2–4 years of operations, program coordination, or administrative experience in a startup or nonprofit environment',
          'Strong organizational skills and comfort with remote work tools (project management software, video conferencing, shared documentation)',
          'Experience supporting programs that serve Indigenous communities, or strong interest in doing so',
          'Detail-oriented with the ability to manage multiple priorities under ambiguity',
          'Comfortable learning quickly in a fast-moving early-stage environment',
        ],
      },
      {
        title: 'Compliance & Data Stewardship Lead (OCAP™, PIPEDA)',
        team: 'Operations & Governance',
        mission:
          "You are the guardian of the trust Indigenous Rising AI's users place in us with their data. You ensure every data practice — from collection and storage to sharing and deletion — meets the highest standards of OCAP™ principles, PIPEDA compliance, and Indigenous data sovereignty. In a world where Indigenous data has historically been extracted and misused, your role is to make sure this platform is different.",
        responsibilities: [
          "Own and maintain the platform's data governance framework, grounded in OCAP™ principles and Canadian privacy law (PIPEDA)",
          'Conduct regular data audits and impact assessments for platform features, partner integrations, and AI models',
          'Develop and maintain community-facing data sovereignty documentation, consent frameworks, and plain-language privacy policies',
          'Work with the ML Engineer to review AI training data pipelines for OCAP™ compliance and community consent',
          'Train all team members on data stewardship practices and cultural safety obligations',
          'Serve as the primary point of contact for community questions or concerns about data use',
          'Stay current on evolving Indigenous data governance frameworks and emerging Canadian privacy legislation',
        ],
        qualifications: [
          'Experience in privacy law, data governance, compliance, or a related field — with PIPEDA knowledge strongly preferred',
          'Familiarity with OCAP™ principles and Indigenous data sovereignty frameworks (FNIGC, FNPS, etc.)',
          'Experience working with Indigenous organizations or on programs that required Indigenous community consent and data governance',
          'Ability to translate complex compliance requirements into clear, accessible policies for community members',
          'Strong ethical grounding and comfort raising concerns about data practices at any level of the organization',
        ],
        hiringNowReason:
          'Every new user, every partner integration, and every AI feature we ship carries data governance implications. Indigenous communities have legitimate reasons to be cautious about how their data is handled. Having a dedicated steward of OCAP™ compliance in place at launch — rather than retrofitting governance after the fact — is both an ethical obligation and a trust signal to the communities we serve.',
      },
    ],
  },
];

const allRoles = rolesByCategory.flatMap((group) => group.roles);

const roleOptions = [...allRoles.map((role) => role.title), 'General / Future Opportunities'];

const workEligibilityOptions = [
  'Yes — Canadian citizen or permanent resident',
  'Yes — valid work permit',
  'No',
  'Prefer not to answer',
];

const preferredWorkLocationOptions = [
  'Fully Remote',
  'Hybrid — occasional travel to community or team events',
  'Open to either',
];

const indigenousIdentityOptions = [
  'First Nations',
  'Métis',
  'Inuit',
  'Non-Indigenous',
  'Prefer not to answer',
];

const careersSchema = z.object({
  full_name: z.string().min(2, 'Full Name is required'),
  email_address: z.string().email('Valid email is required'),
  phone_number: z.string().optional(),
  city_province: z.string().min(2, 'City and Province / Territory is required'),
  work_eligibility: z.string().min(1, 'Please select work eligibility'),
  role_applying_for: z.string().min(1, 'Please select a role'),
  preferred_start_date: z.string().optional(),
  preferred_work_location: z.string().min(1, 'Please select a preferred work location'),
  linkedin_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
  portfolio_github_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
  writing_samples_url: z.union([z.string().url('Enter a valid URL'), z.literal('')]).optional(),
  other_links: z.string().optional(),
  indigenous_sovereignty_meaning: z.string().min(20, 'Please provide a thoughtful response (300 words or fewer)'),
  community_experience: z.string().min(20, 'Please provide a thoughtful response (300 words or fewer)'),
  ocap_aligned_ai_interest: z.string().min(20, 'Please provide a thoughtful response (300 words or fewer)'),
  indigenous_identity: z.string().optional(),
  privacy_consent: z.boolean().refine((value) => value, {
    message: 'Consent is required to submit your application',
  }),
});

type CareersFormData = z.infer<typeof careersSchema>;

const engineeringAndProductRoles = [
  'Product Manager — Indigenous Business Tools',
  'Full-Stack Engineer — Platform & Integrations',
  'Machine Learning Engineer — Responsible & OCAP-Aligned AI',
];

const communityAndPartnershipRoles = [
  'Indigenous Community Engagement Lead',
  'Partnerships Manager — Indigenous Organizations & Funding Bodies',
  'Customer Success Lead — Indigenous Entrepreneurs',
  'Implementation Specialist — Funding & Training Programs',
  'Growth Marketer — Community & Education',
];

const HiringNowCard = ({ role }: { role: Role }) => (
  <Card className="border-destructive/30">
    <CardHeader>
      <CardTitle className="text-xl">🔴 HIRING NOW — {role.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm font-medium mb-2">Why this role is critical right now:</p>
      <p className="text-muted-foreground">{role.hiringNowReason}</p>
    </CardContent>
  </Card>
);

const Careers = () => {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CareersFormData>({
    resolver: zodResolver(careersSchema),
    defaultValues: {
      full_name: '',
      email_address: '',
      phone_number: '',
      city_province: '',
      work_eligibility: '',
      role_applying_for: '',
      preferred_start_date: '',
      preferred_work_location: '',
      linkedin_url: '',
      portfolio_github_url: '',
      writing_samples_url: '',
      other_links: '',
      indigenous_sovereignty_meaning: '',
      community_experience: '',
      ocap_aligned_ai_interest: '',
      indigenous_identity: '',
      privacy_consent: false,
    },
  });

  const selectedRole = watch('role_applying_for');
  const isEngineeringOrProduct = engineeringAndProductRoles.includes(selectedRole);
  const isCommunityOrPartnership = communityAndPartnershipRoles.includes(selectedRole);

  const hiringNowRoles = useMemo(() => allRoles.filter((role) => role.hiringNowReason), []);

  const onSubmit = async () => {
    toast({
      title: 'Application received',
      description: 'Thank you for applying. Our hiring team will follow up by email.',
    });
    reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Careers | Indigenous Rising AI"
        description="Explore careers at Indigenous Rising AI and apply to build OCAP™-aligned, community-driven technology with First Nations, Métis, and Inuit communities across Turtle Island."
        keywords="Indigenous careers, OCAP, Indigenous data sovereignty, community-driven AI, Indigenous Rising AI jobs"
      />
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />

          <section className="mt-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Bimaadiziwin — Living a Good Life Through Good Work</h1>
            <p className="text-lg text-muted-foreground">
              We believe economic sovereignty for Indigenous entrepreneurs starts with the right people in the right roles. At Indigenous Rising AI, every team member is part of a movement — one rooted in OCAP™ principles, Elder-guided innovation, and the long-term prosperity of First Nations, Métis, and Inuit communities across Turtle Island.
            </p>
            <p className="text-lg text-muted-foreground">
              We're building technology that serves communities, not the other way around. If that resonates with you, we want to hear from you.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 text-foreground italic">
              We are committed to prioritizing applications from First Nations, Métis, and Inuit candidates. We strongly encourage Indigenous peoples to apply.
            </blockquote>
          </section>

          <section className="mt-12 max-w-5xl mx-auto space-y-10">
            <div>
              <h2 className="text-3xl font-bold">Open Roles</h2>
            </div>

            {rolesByCategory.map((category) => (
              <div key={category.category} className="space-y-6">
                <h3 className="text-2xl font-semibold">Category: {category.category}</h3>
                <div className="space-y-6">
                  {category.roles.map((role) => (
                    <Card key={role.title}>
                      <CardHeader>
                        <CardTitle className="text-2xl">{role.title}</CardTitle>
                        <CardDescription>Team: {role.team}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div>
                          <p className="font-semibold mb-2">Mission:</p>
                          <p className="text-muted-foreground">{role.mission}</p>
                        </div>

                        <div>
                          <p className="font-semibold mb-2">Responsibilities:</p>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            {role.responsibilities.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-semibold mb-2">Qualifications:</p>
                          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            {role.qualifications.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="mt-16 max-w-5xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Hiring Now</h2>
            <p className="text-muted-foreground">
              These are the five roles we are actively filling as we move from early platform launch to community-scale growth.
            </p>
            <div className="space-y-4">
              {hiringNowRoles.map((role) => (
                <HiringNowCard key={role.title} role={role} />
              ))}
            </div>
          </section>

          <section className="mt-16 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Apply Now</CardTitle>
                <CardDescription>
                  Use this form for all roles. Role-specific guidance adapts automatically based on the role you select.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Basic Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                      <Input id="full_name" type="text" aria-required="true" aria-invalid={!!errors.full_name} {...register('full_name')} placeholder="Please enter your name as you would like it to appear in our communications with you." />
                      {errors.full_name && <p className="text-sm text-destructive" role="alert">{errors.full_name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email_address">Email Address <span className="text-destructive">*</span></Label>
                      <Input id="email_address" type="email" aria-required="true" aria-invalid={!!errors.email_address} {...register('email_address')} placeholder="We will use this address for all application correspondence." />
                      {errors.email_address && <p className="text-sm text-destructive" role="alert">{errors.email_address.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input id="phone_number" type="tel" {...register('phone_number')} placeholder="Optional. Include country code if outside Canada." />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city_province">City and Province / Territory <span className="text-destructive">*</span></Label>
                      <Input id="city_province" type="text" aria-required="true" aria-invalid={!!errors.city_province} {...register('city_province')} placeholder="e.g., Winnipeg, Manitoba or Yellowknife, Northwest Territories" />
                      {errors.city_province && <p className="text-sm text-destructive" role="alert">{errors.city_province.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label id="work-eligibility-label">Are you legally eligible to work in Canada? <span className="text-destructive">*</span></Label>
                      <Controller
                        control={control}
                        name="work_eligibility"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger aria-labelledby="work-eligibility-label" aria-required="true" aria-invalid={!!errors.work_eligibility}>
                              <SelectValue placeholder="Select work eligibility" />
                            </SelectTrigger>
                            <SelectContent>
                              {workEligibilityOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">We welcome applications from candidates across Canada and internationally where work permits apply.</p>
                      {errors.work_eligibility && <p className="text-sm text-destructive" role="alert">{errors.work_eligibility.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Role & Location Details</h3>

                    <div className="space-y-2">
                      <Label id="role-applying-label">Role You Are Applying For <span className="text-destructive">*</span></Label>
                      <Controller
                        control={control}
                        name="role_applying_for"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger aria-labelledby="role-applying-label" aria-required="true" aria-invalid={!!errors.role_applying_for}>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.role_applying_for && <p className="text-sm text-destructive" role="alert">{errors.role_applying_for.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_start_date">Preferred Start Date</Label>
                      <Input id="preferred_start_date" type="date" {...register('preferred_start_date')} />
                      <p className="text-xs text-muted-foreground">Approximate is fine. We are flexible for the right candidates.</p>
                    </div>

                    <div className="space-y-2">
                      <Label id="work-location-label">Preferred Work Location <span className="text-destructive">*</span></Label>
                      <Controller
                        control={control}
                        name="preferred_work_location"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger aria-labelledby="work-location-label" aria-required="true" aria-invalid={!!errors.preferred_work_location}>
                              <SelectValue placeholder="Select preferred work location" />
                            </SelectTrigger>
                            <SelectContent>
                              {preferredWorkLocationOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">All roles are currently remote-first. Some community-facing roles may involve periodic travel.</p>
                      {errors.preferred_work_location && <p className="text-sm text-destructive" role="alert">{errors.preferred_work_location.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Links</h3>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin_url">LinkedIn Profile URL</Label>
                      <Input id="linkedin_url" type="url" {...register('linkedin_url')} />
                      {errors.linkedin_url && <p className="text-sm text-destructive" role="alert">{errors.linkedin_url.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="portfolio_github_url">Portfolio, GitHub, or Professional Website</Label>
                      <Input id="portfolio_github_url" type="url" {...register('portfolio_github_url')} />
                      <p className="text-xs text-muted-foreground">
                        {isEngineeringOrProduct
                          ? 'For engineering and product roles, a GitHub profile is strongly encouraged.'
                          : 'For community and partnership roles, feel free to share a personal or organizational website.'}
                      </p>
                      {errors.portfolio_github_url && <p className="text-sm text-destructive" role="alert">{errors.portfolio_github_url.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="writing_samples_url">Writing Samples or Case Studies</Label>
                      <Input id="writing_samples_url" type="url" {...register('writing_samples_url')} />
                      <p className="text-xs text-muted-foreground">
                        {isCommunityOrPartnership
                          ? 'Relevant for growth, content, partnerships, and community engagement roles. Link to blog posts, reports, grant proposals, or similar work.'
                          : 'Optional for all roles. Share any relevant writing or case studies.'}
                      </p>
                      {errors.writing_samples_url && <p className="text-sm text-destructive" role="alert">{errors.writing_samples_url.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="other_links">Other Relevant Links</Label>
                      <Textarea id="other_links" {...register('other_links')} placeholder="Any additional links you would like us to review — project work, community initiatives, publications, etc. One URL per line." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Uploads</h3>

                    <div className="space-y-2">
                      <Label htmlFor="resume_cv">CV / Resume <span className="text-destructive">*</span></Label>
                      <Input id="resume_cv" type="file" accept=".pdf,.doc,.docx" required aria-required="true" aria-describedby="resume-hint" />
                      <p id="resume-hint" className="text-xs text-muted-foreground">Please upload your most current CV or resume in PDF or Word format (max 5MB).</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_letter_story">Cover Letter or 1-Page Story <span className="text-muted-foreground">(optional)</span></Label>
                      <Input id="cover_letter_story" type="file" accept=".pdf,.doc,.docx" aria-describedby="cover-letter-hint" />
                      <p id="cover-letter-hint" className="text-xs text-muted-foreground">You are welcome to upload a traditional cover letter, or something less conventional — a 1-page story about why this work matters to you, a letter of support from a community member, or whatever feels most authentic.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Short Answer Questions</h3>

                    <div className="space-y-2">
                      <Label htmlFor="indigenous_sovereignty_meaning">What does Indigenous economic sovereignty mean to you, and how does it show up in your work? <span className="text-destructive">*</span></Label>
                      <Textarea id="indigenous_sovereignty_meaning" aria-required="true" aria-invalid={!!errors.indigenous_sovereignty_meaning} aria-describedby="sovereignty-hint" {...register('indigenous_sovereignty_meaning')} className="min-h-[140px]" />
                      <p id="sovereignty-hint" className="text-xs text-muted-foreground">There is no single right answer. We are looking for genuine reflection, not a textbook definition. (300 words or fewer)</p>
                      {errors.indigenous_sovereignty_meaning && <p className="text-sm text-destructive" role="alert">{errors.indigenous_sovereignty_meaning.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="community_experience">Tell us about a time you worked with or alongside an Indigenous community. If you haven&apos;t yet, how would you approach building that relationship respectfully? <span className="text-destructive">*</span></Label>
                      <Textarea id="community_experience" aria-required="true" aria-invalid={!!errors.community_experience} aria-describedby="community-hint" {...register('community_experience')} className="min-h-[140px]" />
                      <p id="community-hint" className="text-xs text-muted-foreground">We value honesty over polish here. If your experience is limited, tell us how you would learn. (300 words or fewer)</p>
                      {errors.community_experience && <p className="text-sm text-destructive" role="alert">{errors.community_experience.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ocap_aligned_ai_interest">Why are you interested in working on OCAP™-aligned, community-driven AI tools? <span className="text-destructive">*</span></Label>
                      <Textarea id="ocap_aligned_ai_interest" aria-required="true" aria-invalid={!!errors.ocap_aligned_ai_interest} aria-describedby="ocap-hint" {...register('ocap_aligned_ai_interest')} className="min-h-[140px]" />
                      <p id="ocap-hint" className="text-xs text-muted-foreground">Tell us what draws you to this specific kind of work — technically, ethically, or personally. (300 words or fewer)</p>
                      {errors.ocap_aligned_ai_interest && <p className="text-sm text-destructive" role="alert">{errors.ocap_aligned_ai_interest.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Voluntary Self-Identification</h3>

                    <div className="space-y-2">
                      <Label id="indigenous-identity-label">Voluntary Self-Identification — Indigenous Identity <span className="text-muted-foreground">(optional)</span></Label>
                      <Controller
                        control={control}
                        name="indigenous_identity"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger aria-labelledby="indigenous-identity-label">
                              <SelectValue placeholder="Select an option (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {indigenousIdentityOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">Indigenous Rising AI is committed to prioritizing applications from First Nations, Métis, and Inuit candidates. This field is entirely voluntary and is used only to support our equity commitments — it is not a hiring requirement and will not disadvantage any applicant. Your response is treated with complete confidentiality.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold">Consent</h3>
                    <div className="flex items-start gap-3 rounded-md border p-4">
                      <Controller
                        control={control}
                        name="privacy_consent"
                        render={({ field }) => (
                          <Checkbox id="privacy_consent" checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} className="mt-1" aria-required="true" />
                        )}
                      />
                      <Label htmlFor="privacy_consent" className="leading-relaxed cursor-pointer">
                        I understand that the information I submit in this application will be stored and processed in Canada in accordance with Indigenous Rising AI&apos;s Privacy Policy and PIPEDA requirements. I consent to my application data being reviewed by the hiring team for the purpose of evaluating my candidacy. <span className="text-destructive">*</span>
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">Your data will never be shared with third parties outside the hiring process without your consent.</p>
                    {errors.privacy_consent && <p className="text-sm text-destructive" role="alert">{errors.privacy_consent.message}</p>}
                  </div>

                  <ShinyButton type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </ShinyButton>
                </form>
              </CardContent>
            </Card>
          </section>

          <section className="mt-16 mb-8 max-w-4xl mx-auto space-y-5">
            <h2 className="text-3xl font-bold">Miigwech — Thank You for Considering This Work</h2>
            <p className="text-muted-foreground">
              Whether you are Indigenous or a committed ally, whether you are an experienced technologist or a community builder who has never worked at a startup — if this mission resonates with you, we want to hear from you.
            </p>
            <p className="text-muted-foreground">
              We are building technology that serves the next seven generations. That means we take our time with relationships, we listen before we act, and we hold ourselves accountable to the communities we serve.
            </p>
            <p className="text-muted-foreground">
              If you have questions before applying, reach out to us at{' '}
              <a className="text-primary underline" href="mailto:careers@indigenousrising.ai">
                careers@indigenousrising.ai
              </a>
              . We will do our best to respond thoughtfully.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Indigenous Rising AI is committed to equitable hiring practices. We prioritize applications from First Nations, Métis, and Inuit candidates. All candidates regardless of background are welcome to apply.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;