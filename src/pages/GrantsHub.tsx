import { Link } from 'react-router-dom';
import { ChevronUp, ArrowRight, Compass, MapPin, Users, Award } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { getAllPosts, type BlogPost } from '@/data/blogPosts';
import { grantsHubFaqs as FAQS } from '@/data/grantsHubFaqs';
import { ROUTE_TITLES } from '@/data/routeTitles';

// Indigenous business grants & funding hub. This is a PILLAR page: it does not
// invent programs, amounts, or deadlines — it organizes and links to the site's
// existing, fact-checked guides so search engines (and readers) can see the
// topical structure. All specifics live in the linked articles, which cite real
// programs (ISC, NACCA, Indigenous Financial Institutions, provincial bodies).


const HubList = ({ posts }: { posts: BlogPost[] }) => (
  <ul className="grid sm:grid-cols-2 gap-4">
    {posts.map((p) => (
      <li key={p.id}>
        <Link
          to={`/blog/${p.slug}`}
          className="group flex flex-col h-full rounded-xl border border-border bg-card/60 p-5 hover:shadow-elevated transition-spring"
        >
          <span className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
            {p.title}
          </span>
          <span className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {p.summary}
          </span>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
            Read the guide <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

const GrantsHub = () => {
  const posts = getAllPosts();
  const bySlug = (slug: string) => posts.find((p) => p.slug === slug);

  const provincial = posts.filter((p) => p.category === 'Provincial Guides');
  const community = posts.filter(
    (p) => p.category === 'Identity-Specific' || p.category === 'Audience-Specific',
  );
  const core = posts.filter((p) =>
    ['Funding Guides', 'How-To Guides', 'Context & Background', 'Community Development', 'Training & Development'].includes(
      p.category,
    ),
  );
  const procurement = [
    bySlug('how-to-get-certified-indigenous-business-canada'),
    bySlug('procurement-ready-corporate-indigenous-partnership-opportunities'),
  ].filter(Boolean) as BlogPost[];

  const Section = ({
    icon: Icon,
    title,
    blurb,
    posts,
  }: {
    icon: typeof Compass;
    title: string;
    blurb: string;
    posts: BlogPost[];
  }) =>
    posts.length > 0 ? (
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
        </div>
        <p className="text-muted-foreground mb-5 max-w-3xl">{blurb}</p>
        <HubList posts={posts} />
      </section>
    ) : null;

  return (
    <div className="min-h-screen warm-page">
      <MetaTags
        title={ROUTE_TITLES['/guides/indigenous-business-grants']}
        description="A hub of guides to Indigenous business grants, loans, and non-repayable funding across Canada — by province and by community (First Nations, Métis, Inuit), plus how to apply and get procurement-ready."
        keywords="Indigenous business grants, Indigenous business funding Canada, First Nations business grants, Métis business grants, Inuit business grants, Indigenous startup funding, Indigenous business loans"
        url="https://www.indigenousrising.ai/guides/indigenous-business-grants"
      />
      <Navigation />
      <main className="pt-24">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Breadcrumbs />

          <header className="mb-12">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Indigenous Business Grants &amp; Funding in Canada
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              A practical, plain-language hub for First Nations, Métis, and Inuit entrepreneurs
              looking for grants, non-repayable contributions, and loans. Start with your province
              or community, learn how the application process works, and get procurement-ready. Every
              guide references real programs — and where rules or amounts can change, we say to
              verify the current details.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Match me to funding <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border-2 border-border font-semibold hover:bg-muted/50 transition-colors"
              >
                Browse all guides
              </Link>
            </div>
          </header>

          <Section
            icon={Compass}
            title="How Indigenous business funding works"
            blurb="Start here: the difference between grants and loans, how to apply step by step, non-repayable contributions, Indigenous Financial Institutions, and building a fundable business plan."
            posts={core}
          />
          <Section
            icon={MapPin}
            title="Funding by province & region"
            blurb="Programs and Indigenous Financial Institutions vary by province. Find the guide for where your business operates."
            posts={provincial}
          />
          <Section
            icon={Users}
            title="Funding by community & audience"
            blurb="First Nations, Métis, and Inuit entrepreneurs — plus women, youth, and other groups — have both community-specific and general programs available."
            posts={community}
          />
          <Section
            icon={Award}
            title="Procurement & certification"
            blurb="Beyond grants: get certified and registered so you can compete for the federal 5% Indigenous procurement target and corporate supplier-diversity contracts."
            posts={procurement}
          />

          {/* Before you apply — the three things that trip people up, and the
              only substantive content the hub carries of its own. Kept short so
              it orients rather than duplicating the education guide it links to. */}
          <section className="mb-16">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Before you apply
            </h2>
            <div className="space-y-5 max-w-3xl">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Most of these programs have no deadline
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every program currently listed in our Funding Navigator is rolling intake rather
                  than a dated competition. That removes the deadline panic, but it also means
                  nothing prompts you to act. Treat the first phone call as the deadline you set
                  yourself.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  The institution decides, not the program name
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Federal capital under the Aboriginal Entrepreneurship Program is delivered by
                  Indigenous Financial Institutions and Métis Capital Corporations, and Indigenous
                  Services Canada notes that eligibility varies between them. There is no central
                  application form. Find the institution serving your region and ask them what they
                  need, in what order.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Confirm the current terms with the funder
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Amounts, eligibility and intake status change, and funder pages are not always
                  updated the day a program does. Where we show a program we show when its details
                  were last verified, and we link to the funder&rsquo;s own page. Nothing here is an
                  eligibility decision — only the funder can make that.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ — visible Q&A mirrors the FAQPage schema emitted in <head> */}
          <section id="faq" className="mb-16 scroll-mt-24">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((f, i) => (
                <details key={i} className="group rounded-lg border border-border bg-card p-5">
                  <summary className="cursor-pointer list-none font-semibold text-foreground flex items-center justify-between gap-4">
                    {f.question}
                    <ChevronUp className="w-5 h-5 text-primary shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 text-foreground/90 leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GrantsHub;
