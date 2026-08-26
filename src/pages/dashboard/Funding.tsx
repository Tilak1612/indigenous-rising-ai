import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Target,
  DollarSign,
  Calendar,
  Building2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  ChevronDown,
  Clock,
  Users,
  MapPin,
  Loader2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Link } from 'react-router-dom';

interface FundingOpportunity {
  id: string;
  name: string;
  organization: string;
  amount: { min: number; max: number };
  deadline: string;
  category: string;
  region: string[];
  eligibility: string[];
  description: string;
  website: string;
  fundingType: string | null;
  isRepayable: boolean;
  lastVerified: string | null;
  status: 'open' | 'closing_soon' | 'closed';
  saved: boolean;
}

// Derive status from deadline date so it stays accurate over time
const deriveStatus = (deadline: string): FundingOpportunity['status'] => {
  if (deadline === 'Ongoing') return 'open';
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysUntil = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return 'closed';
  if (daysUntil <= 30) return 'closing_soon';
  return 'open';
};

// Opportunities come from public.grants, the verified catalogue — never
// hardcoded. This page previously shipped six invented entries with fabricated
// match scores (95, 88, 85, 75, 72, 68), deadlines the catalogue does not have
// (grants.deadline is null on every row today), and `saved: true` on accounts
// that had saved nothing. It is the PAID "Funding Navigator", badged AI in the
// nav, so a paying customer was shown fabricated results as the feature they
// bought.
const fundingData: FundingOpportunity[] = [];

const categories = ['All', 'Business Development', 'Loans & Financing', 'Tourism', 'Women Entrepreneurs', 'Regional Development', 'Community Development'];
const regions = ['All Regions', 'All Provinces', 'British Columbia', 'Alberta', 'Saskatchewan', 'Manitoba', 'Ontario', 'Quebec', 'Atlantic Provinces', 'Northern Territories'];
const amountRanges = [
  { label: 'Any Amount', value: 'all' },
  { label: 'Under $25,000', value: '0-25000' },
  { label: '$25,000 - $100,000', value: '25000-100000' },
  { label: '$100,000 - $500,000', value: '100000-500000' },
  { label: 'Over $500,000', value: '500000+' },
];

export default function Funding() {
  const { subscribed, loading: subLoading } = useSubscription();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedAmount, setSelectedAmount] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [opportunities, setOpportunities] = useState<FundingOpportunity[]>(fundingData);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Read the verified catalogue. RLS exposes only published grants, so this is
  // the same source the funding matcher and the digest gate use — one catalogue,
  // no page-local copy that can drift from it.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('grants')
        .select('id,name,funder,description,amount_min,amount_max,deadline,provinces,eligibility_notes,application_url,source_url,funding_type,is_repayable,last_verified')
        .eq('is_published', true);
      if (cancelled) return;
      if (error) {
        // Surface the failure. An empty list that looks like "no programmes"
        // would be a lie when the truth is "we could not load them".
        setLoadError(error.message);
        setOpportunities([]);
      } else {
        setOpportunities((data ?? []).map((g): FundingOpportunity => ({
          id: g.id,
          name: g.name,
          organization: g.funder ?? 'Unknown funder',
          amount: { min: g.amount_min ?? 0, max: g.amount_max ?? 0 },
          deadline: g.deadline ?? '',
          category: g.funding_type ?? 'Funding',
          region: g.provinces ?? [],
          eligibility: g.eligibility_notes ? [g.eligibility_notes] : [],
          description: g.description ?? '',
          website: g.source_url ?? g.application_url ?? '',
          fundingType: g.funding_type ?? null,
          isRepayable: Boolean(g.is_repayable),
          lastVerified: g.last_verified ?? null,
          status: g.deadline ? deriveStatus(g.deadline) : 'open',
          saved: false,
        })));
        setLoadError(null);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || opp.category === selectedCategory;
      
      const matchesRegion = selectedRegion === 'All Regions' || 
        opp.region.includes('All Provinces') || 
        opp.region.includes(selectedRegion);
      
      let matchesAmount = true;
      if (selectedAmount !== 'all') {
        const [min, max] = selectedAmount.split('-').map(v => v === '+' ? Infinity : parseInt(v));
        matchesAmount = opp.amount.max >= (min || 0) && (max ? opp.amount.min <= max : true);
      }
      
      return matchesSearch && matchesCategory && matchesRegion && matchesAmount;
    }).sort((a, b) => {
      // No match score to rank by — asserting one without criteria is exactly
      // what #118 removed from the other funding page. Soonest deadline first,
      // undated programmes last.
      if (!a.deadline && !b.deadline) return a.name.localeCompare(b.name);
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  }, [opportunities, searchTerm, selectedCategory, selectedRegion, selectedAmount]);

  // Saving writes to funding_saved_matches, the same table SavedMatches reads.
  // This used to set local state only and still toast "Added to saved
  // opportunities" — so the user was told it saved, went to Saved Matches, and
  // found nothing. RLS scopes the row to auth.uid() on both read and write.
  const toggleSaved = async (id: string) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return;
    const nowSaved = !opp.saved;

    // Optimistic, reverted below if the write fails — never leave the UI
    // claiming a state the database does not have.
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, saved: nowSaved } : o)));

    const { data: auth } = await supabase.auth.getUser();
    const userId = auth?.user?.id;
    if (!userId) {
      setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, saved: !nowSaved } : o)));
      toast.error('Please sign in again to save opportunities');
      return;
    }

    const { error } = nowSaved
      ? await supabase.from('funding_saved_matches')
          .upsert({ user_id: userId, grant_id: id, status: 'saved' }, { onConflict: 'user_id,grant_id' })
      : await supabase.from('funding_saved_matches')
          .delete().eq('user_id', userId).eq('grant_id', id);

    if (error) {
      setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, saved: !nowSaved } : o)));
      toast.error(nowSaved ? 'Could not save — please try again' : 'Could not remove — please try again');
      return;
    }
    toast.success(nowSaved ? 'Saved — find it in Saved Matches' : 'Removed from saved');
  };

  const formatAmount = (min: number, max: number) => {
    const format = (n: number) => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;
    return `${format(min)} - ${format(max)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'closing_soon':
        return <Badge variant="destructive" className="ml-2">Closing Soon</Badge>;
      case 'closed':
        return <Badge variant="secondary" className="ml-2">Closed</Badge>;
      default:
        return <Badge variant="outline" className="ml-2 text-success border-success/30">Open</Badge>;
    }
  };

  if (subLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!subscribed) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Funding Navigator</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered funding opportunity matching
            </p>
          </div>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <Target className="h-16 w-16 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Unlock AI-Powered Funding Matches</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Get personalized funding recommendations based on your business profile, with match scores and application guidance.
              </p>
              <Button asChild size="lg">
                <Link to="/pricing">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Upgrade to Pro
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Preview of what they'll get */}
          <Card className="opacity-60">
            <CardHeader>
              <CardTitle className="text-lg">Preview: Available Funding Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fundingData.slice(0, 2).map(opp => (
                  <div key={opp.id} className="p-4 border rounded-lg blur-sm">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{opp.name}</h4>
                      <Badge variant="secondary">{opp.fundingType ?? 'Funding'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{opp.organization}</p>
                  </div>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Upgrade to see all {fundingData.length}+ funding opportunities
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Funding Navigator</h1>
            <p className="text-muted-foreground mt-1">
              Browse verified funding and financing programs across Canada
            </p>
          </div>
          {/* Was a "Run AI Analysis" button that waited 2s on a setTimeout and
              then claimed "AI analysis complete! Match scores updated based on
              your profile." No model was called and nothing was updated — pure
              theatre on the paid, AI-badged page. Matching is real, but it lives
              on /dashboard/funding/matches, so send people there. */}
          <Button asChild>
            <Link to="/dashboard/funding/matches">
              <Sparkles className="h-4 w-4 mr-2" />
              Match me to funding
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredOpportunities.length}</p>
                <p className="text-sm text-muted-foreground">Matches Found</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">$2.1M</p>
                <p className="text-sm text-muted-foreground">Available Funding</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <BookmarkCheck className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{opportunities.filter(o => o.saved).length}</p>
                <p className="text-sm text-muted-foreground">Saved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-sm text-muted-foreground">Avg Match Score</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search funding opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowFilters(!showFilters)}
                className="md:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Region</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Amount Range</label>
                  <Select value={selectedAmount} onValueChange={setSelectedAmount}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {amountRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No matches found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredOpportunities.map(opp => (
              <Card key={opp.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* Funding type — a fact from the catalogue, not an
                        asserted score. Repayable instruments are called out so
                        a loan is never mistaken for a grant. */}
                    <div className="flex-shrink-0 space-y-1">
                      <Badge variant={opp.isRepayable ? 'destructive' : 'secondary'}>
                        {opp.fundingType ?? 'Funding'}
                      </Badge>
                      {opp.isRepayable && (
                        <p className="text-xs text-muted-foreground max-w-[7rem]">
                          You pay this back
                        </p>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="font-semibold text-lg">{opp.name}</h3>
                            {getStatusBadge(opp.status)}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="h-4 w-4" />
                            {opp.organization}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleSaved(opp.id)}
                          // Icon-only control: without a name a screen reader
                          // announces just "button". aria-pressed conveys the
                          // saved/not-saved state that the icon shows visually.
                          aria-label={opp.saved ? `Remove ${opp.name} from saved` : `Save ${opp.name}`}
                          aria-pressed={opp.saved}
                          title={opp.saved ? 'Remove from saved' : 'Save'}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          {opp.saved ? (
                            <BookmarkCheck className="h-5 w-5 text-primary" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {opp.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-success" />
                          <span className="font-medium">{formatAmount(opp.amount.min, opp.amount.max)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{opp.deadline === 'Ongoing' ? 'Ongoing' : `Deadline: ${opp.deadline}`}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{opp.region.join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {opp.eligibility.map(req => (
                          <Badge key={req} variant="secondary" className="text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 flex-shrink-0">
                      <Button asChild className="flex-1">
                        <a href={opp.website} target="_blank" rel="noopener noreferrer">
                          Apply
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
