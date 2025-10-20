import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Calendar, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FundingOpportunity {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  province: string;
  industry: string;
  description: string;
}

const fundingOpportunities: FundingOpportunity[] = [
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

const FundingSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredOpportunities = fundingOpportunities.filter((opp) => {
    const matchesSearch = opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = selectedProvince === 'all' || opp.province === selectedProvince;
    const matchesIndustry = selectedIndustry === 'all' || opp.industry === selectedIndustry;
    return matchesSearch && matchesProvince && matchesIndustry;
  });

  return (
    <section id="funding" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground mb-4">
              Current Funding Opportunities
            </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore funding opportunities tailored for Indigenous entrepreneurs. All opportunities are vetted for cultural appropriateness and compliance with OCAP™ principles.
          </p>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search funding opportunities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger className="w-full md:w-[200px] bg-background">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Province" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Provinces</SelectItem>
                  <SelectItem value="National">National</SelectItem>
                  <SelectItem value="Ontario">Ontario</SelectItem>
                  <SelectItem value="British Columbia">British Columbia</SelectItem>
                  <SelectItem value="Alberta">Alberta</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full md:w-[200px] bg-background">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="All Sectors">All Sectors</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Tourism">Tourism</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Funding Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opportunity, index) => {
              const daysLeft = getDaysUntilDeadline(opportunity.deadline);
              const isUrgent = daysLeft <= 14;

              return (
                <Card
                  key={opportunity.id}
                  className="p-6 hover:shadow-elevated transition-all hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-2">
                        {opportunity.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {opportunity.amount}
                      </Badge>
                      <Badge variant="outline">
                        <MapPin className="w-3 h-3 mr-1" />
                        {opportunity.province}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span className={isUrgent ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                          {daysLeft} days left
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                        Apply Now
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="gradient-earth text-white font-bold shadow-elevated"
              onClick={() => {
                const element = document.querySelector('#pricing');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Sign Up to Access Complete Database
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              500+ funding opportunities available to members
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FundingSection;
