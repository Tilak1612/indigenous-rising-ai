import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, DollarSign, Building2, Users, TrendingUp, Bell, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface Grant {
  id: string;
  name: string;
  funder: string;
  description: string;
  amount_min: number | null;
  amount_max: number | null;
  amount_currency: string;
  deadline: string | null;
  is_recurring: boolean;
  recurrence_notes: string | null;
  provinces: string[];
  industries: string[];
  application_url: string;
}

const PROVINCES = [
  { code: 'all', name: 'All provinces & territories' },
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];

const INDUSTRY_FILTERS = [
  'all',
  'Agriculture & Forestry',
  'Arts & Crafts',
  'Construction',
  'Consulting',
  'Education',
  'Energy & Mining',
  'Finance & Insurance',
  'Food & Beverage',
  'Healthcare',
  'Hospitality & Tourism',
  'Information Technology',
  'Manufacturing',
  'Professional Services',
  'Real Estate',
  'Retail',
  'Transportation',
  'Other',
];

const fundingTypes = [
  {
    title: 'Government Grants',
    description: 'Non-repayable funding from federal and provincial programs designed specifically for Indigenous entrepreneurs.',
    icon: Building2,
    amount: 'Up to $500K+',
  },
  {
    title: 'Business Loans',
    description: 'Low-interest financing options through Aboriginal Financial Institutions and community lenders.',
    icon: DollarSign,
    amount: 'Flexible terms',
  },
  {
    title: 'Equity Investment',
    description: 'Growth capital from Indigenous-focused investment funds and impact investors.',
    icon: TrendingUp,
    amount: 'Seed to Series',
  },
  {
    title: 'Community Programs',
    description: 'Local economic development initiatives and Nation-specific business support programs.',
    icon: Users,
    amount: 'Varies by region',
  },
];

function formatAmount(g: Grant): string {
  if (!g.amount_min && !g.amount_max) return 'Amount varies';
  const fmt = (n: number) => '$' + n.toLocaleString('en-CA');
  if (g.amount_min && g.amount_max && g.amount_min !== g.amount_max) {
    return `${fmt(g.amount_min)} – ${fmt(g.amount_max)}`;
  }
  return `Up to ${fmt(g.amount_max ?? g.amount_min ?? 0)}`;
}

function formatDeadline(g: Grant): { text: string; status: 'recurring' | 'urgent' | 'soon' | 'open' | 'closed' } {
  if (g.is_recurring && !g.deadline) {
    return { text: g.recurrence_notes || 'Rolling intake', status: 'recurring' };
  }
  if (!g.deadline) return { text: 'No deadline', status: 'open' };
  const deadline = new Date(g.deadline);
  const today = new Date();
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = deadline.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  if (daysLeft < 0) return { text: formatted, status: 'closed' };
  if (daysLeft <= 7) return { text: `${formatted} — ${daysLeft} days left`, status: 'urgent' };
  if (daysLeft <= 30) return { text: `${formatted} — ${daysLeft} days left`, status: 'soon' };
  return { text: `${formatted} — ${daysLeft} days left`, status: 'open' };
}

const PublicFunding: React.FC = () => {
  const { user } = useAuth();
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinceFilter, setProvinceFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  useEffect(() => {
    (async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('grants')
        .select('*')
        .eq('is_published', true)
        .or(`deadline.gte.${today},is_recurring.eq.true`)
        .order('deadline', { ascending: true, nullsFirst: false })
        .limit(20);

      if (!error && data) {
        setGrants(data as Grant[]);
      }
      setLoading(false);
    })();
  }, []);

  const filteredGrants = useMemo(() => {
    return grants.filter((g) => {
      if (provinceFilter !== 'all' && !g.provinces.includes(provinceFilter)) return false;
      if (industryFilter !== 'all' && g.industries.length > 0 && !g.industries.includes(industryFilter)) return false;
      return true;
    });
  }, [grants, provinceFilter, industryFilter]);

  return (
    <>
      <MetaTags
        title="Indigenous Business Funding Navigator | Indigenous Rising AI"
        description="Browse current grants, loans, and equity opportunities for Indigenous entrepreneurs in Canada. Free weekly funding alerts available."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="mb-4">
                <Target className="w-3 h-3 mr-1" />
                Funding Navigator
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Find the Right Funding for Your{' '}
                <span className="text-white/90">Indigenous Business</span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Browse current grants, loans, and equity opportunities. Subscribe to free weekly alerts filtered by your province and industry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/funding/alerts">
                    <Bell className="w-4 h-4 mr-2" />
                    Get free weekly alerts
                  </Link>
                </Button>
                {user ? (
                  <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary bg-white hover:bg-primary/5">
                    <Link to="/dashboard/funding">
                      Open Funding Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary bg-white hover:bg-primary/5">
                    <Link to="/pricing">View Plans</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live grants list */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-3xl font-display font-bold text-foreground mb-3">Current funding opportunities</h2>
              <p className="text-muted-foreground">
                Browse verified grants, loans, and programs. Filter by your province and industry below.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <Select value={provinceFilter} onValueChange={setProvinceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Province / Territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVINCES.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_FILTERS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i === 'all' ? 'All industries' : i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grants grid */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading current opportunities...</div>
            ) : filteredGrants.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center space-y-4">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="text-xl font-semibold text-foreground">
                    {grants.length === 0
                      ? 'New grants are being added shortly.'
                      : 'No grants match those filters.'}
                  </h3>
                  <p className="text-muted-foreground">
                    {grants.length === 0
                      ? 'Subscribe to free weekly alerts to be notified when new opportunities are added.'
                      : 'Try a different province or industry, or subscribe to alerts to be notified when new ones are added.'}
                  </p>
                  <Button asChild className="mt-2">
                    <Link to="/funding/alerts">
                      <Bell className="w-4 h-4 mr-2" />
                      Get free weekly alerts
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredGrants.map((grant) => {
                  const deadline = formatDeadline(grant);
                  const deadlineColor = {
                    urgent: 'bg-destructive/10 text-destructive border-destructive/30',
                    soon: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
                    open: 'bg-primary/10 text-primary border-primary/30',
                    recurring: 'bg-primary/10 text-primary border-primary/30',
                    closed: 'bg-muted text-muted-foreground',
                  }[deadline.status];

                  return (
                    <Card key={grant.id} className="hover:shadow-lg hover:border-primary/30 transition-all flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <CardTitle className="text-foreground text-xl leading-snug">{grant.name}</CardTitle>
                        </div>
                        <CardDescription className="text-sm">{grant.funder}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <p className="text-sm text-foreground/80 leading-relaxed flex-1">{grant.description}</p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatAmount(grant)}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${deadlineColor}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {deadline.text}
                          </Badge>
                        </div>

                        {grant.provinces.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {grant.provinces.slice(0, 5).map((p) => (
                              <Badge key={p} variant="secondary" className="text-[10px]">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Button asChild variant="outline" size="sm" className="w-full mt-auto">
                          <a href={grant.application_url} target="_blank" rel="noopener noreferrer">
                            Apply on funder's site
                            <ExternalLink className="w-3 h-3 ml-2" />
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Funding types */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Types of Funding Available</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From startup grants to growth capital, every funding option available to Indigenous entrepreneurs.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fundingTypes.map((type, index) => (
                <Card key={index} className="hover:shadow-lg hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{type.title}</CardTitle>
                    <div className="text-primary font-semibold">{type.amount}</div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{type.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Never miss a funding opportunity
            </h2>
            <p className="text-muted-foreground mb-8">
              Get a short email every Friday morning with new and upcoming grants for Indigenous businesses in your province and industry. Free, no spam, unsubscribe any time.
            </p>
            <Button asChild size="lg">
              <Link to="/funding/alerts">
                <Bell className="w-4 h-4 mr-2" />
                Subscribe to free weekly alerts
              </Link>
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PublicFunding;
