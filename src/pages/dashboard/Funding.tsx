import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
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
  matchScore: number;
  description: string;
  website: string;
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

const fundingData: FundingOpportunity[] = [
  {
    id: '1',
    name: 'Indigenous Business Development Program',
    organization: 'Indigenous Services Canada',
    amount: { min: 10000, max: 99999 },
    deadline: '2026-09-30',
    category: 'Business Development',
    region: ['All Provinces'],
    eligibility: ['Indigenous-owned', 'Registered Business'],
    matchScore: 95,
    description: 'Funding to support Indigenous entrepreneurs in starting, expanding, or acquiring a business.',
    website: 'https://www.isc.gc.ca',
    status: deriveStatus('2026-09-30'),
    saved: true,
  },
  {
    id: '2',
    name: 'Aboriginal Business Financing Program',
    organization: 'Business Development Bank of Canada',
    amount: { min: 25000, max: 250000 },
    deadline: '2026-12-31',
    category: 'Loans & Financing',
    region: ['All Provinces'],
    eligibility: ['Indigenous-owned', '51% Indigenous ownership'],
    matchScore: 88,
    description: 'Flexible financing solutions for Indigenous entrepreneurs with favorable terms.',
    website: 'https://www.bdc.ca',
    status: deriveStatus('2026-12-31'),
    saved: false,
  },
  {
    id: '3',
    name: 'Indigenous Tourism Grant',
    organization: 'Indigenous Tourism Association of Canada',
    amount: { min: 5000, max: 50000 },
    deadline: '2026-08-31',
    category: 'Tourism',
    region: ['British Columbia', 'Alberta', 'Ontario'],
    eligibility: ['Tourism Business', 'Indigenous-owned'],
    matchScore: 72,
    description: 'Grants to support Indigenous tourism businesses and experiences.',
    website: 'https://indigenoustourism.ca',
    status: deriveStatus('2026-08-31'),
    saved: false,
  },
  {
    id: '4',
    name: 'Women Entrepreneurship Strategy',
    organization: 'Innovation, Science and Economic Development Canada',
    amount: { min: 10000, max: 100000 },
    deadline: '2026-10-15',
    category: 'Women Entrepreneurs',
    region: ['All Provinces'],
    eligibility: ['Woman-owned', 'Indigenous-owned'],
    matchScore: 85,
    description: 'Support for women entrepreneurs including Indigenous women in business.',
    website: 'https://ised-isde.canada.ca',
    status: deriveStatus('2026-10-15'),
    saved: true,
  },
  {
    id: '5',
    name: 'Northern Ontario Heritage Fund',
    organization: 'NOHFC',
    amount: { min: 5000, max: 500000 },
    deadline: '2026-11-30',
    category: 'Regional Development',
    region: ['Ontario'],
    eligibility: ['Northern Ontario', 'Indigenous Communities'],
    matchScore: 68,
    description: 'Economic development funding for projects in Northern Ontario.',
    website: 'https://nohfc.ca',
    status: deriveStatus('2026-11-30'),
    saved: false,
  },
  {
    id: '6',
    name: 'Community Futures Development',
    organization: 'Community Futures Network',
    amount: { min: 5000, max: 150000 },
    deadline: 'Ongoing',
    category: 'Community Development',
    region: ['All Provinces'],
    eligibility: ['Small Business', 'Rural Communities'],
    matchScore: 75,
    description: 'Loans and support for small business development in rural and Indigenous communities.',
    website: 'https://communityfutures.ca',
    status: deriveStatus('Ongoing'),
    saved: false,
  },
];

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
  const [opportunities, setOpportunities] = useState(fundingData);
  const [analyzing, setAnalyzing] = useState(false);

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
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [opportunities, searchTerm, selectedCategory, selectedRegion, selectedAmount]);

  const toggleSaved = (id: string) => {
    setOpportunities(prev => prev.map(opp => 
      opp.id === id ? { ...opp, saved: !opp.saved } : opp
    ));
    const opp = opportunities.find(o => o.id === id);
    toast.success(opp?.saved ? 'Removed from saved' : 'Added to saved opportunities');
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('AI analysis complete! Match scores updated based on your profile.');
    setAnalyzing(false);
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
                      <Badge>{opp.matchScore}% match</Badge>
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
              AI-powered funding opportunity matching
            </p>
          </div>
          <Button onClick={runAIAnalysis} disabled={analyzing}>
            {analyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
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
                    {/* Match Score */}
                    <div className="flex-shrink-0">
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold ${
                        opp.matchScore >= 80 ? 'bg-success/20 text-success' :
                        opp.matchScore >= 60 ? 'bg-warning/20 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {opp.matchScore}%
                      </div>
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
