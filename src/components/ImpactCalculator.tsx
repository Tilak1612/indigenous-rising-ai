import { useState } from 'react';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, Users, TrendingUp, Target } from 'lucide-react';

const ImpactCalculator = () => {
  const [businessStage, setBusinessStage] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [showResults, setShowResults] = useState(false);

  const calculateImpact = () => {
    if (businessStage && industry && location && teamSize) {
      setShowResults(true);
    }
  };

  const getEstimatedFunding = () => {
    const baseAmount = parseInt(teamSize) * 10000;
    return businessStage === 'startup' ? baseAmount * 0.8 : baseAmount * 1.5;
  };

  const getJobCreation = () => {
    return Math.ceil(parseInt(teamSize) * 2.5);
  };

  const getImpactScore = () => {
    return Math.floor(Math.random() * 20) + 80;
  };

  return (
    <section id="impact" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-sky opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <h2 className="font-display text-4xl md:text-5xl font-black text-foreground">
                See Your Potential Impact
              </h2>
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Beta
              </span>
            </div>
            <p className="text-lg text-muted-foreground">
              Discover what Indigenous Rising AI can help you achieve
            </p>
            <a href="/impact" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
              Learn how we calculate this
            </a>
          </div>

          <Card className="p-8 shadow-elevated bg-card/95 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label htmlFor="business-stage">Business Stage</Label>
                <Select value={businessStage} onValueChange={setBusinessStage}>
                  <SelectTrigger id="business-stage" className="bg-background">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="idea">Idea / Planning</SelectItem>
                    <SelectItem value="startup">Startup (0-2 years)</SelectItem>
                    <SelectItem value="growing">Growing (2-5 years)</SelectItem>
                    <SelectItem value="established">Established (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger id="industry" className="bg-background">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="tourism">Tourism & Hospitality</SelectItem>
                    <SelectItem value="arts">Arts & Culture</SelectItem>
                    <SelectItem value="retail">Retail & E-commerce</SelectItem>
                    <SelectItem value="services">Professional Services</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location" className="bg-background">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value="on">Ontario</SelectItem>
                    <SelectItem value="bc">British Columbia</SelectItem>
                    <SelectItem value="ab">Alberta</SelectItem>
                    <SelectItem value="sk">Saskatchewan</SelectItem>
                    <SelectItem value="mb">Manitoba</SelectItem>
                    <SelectItem value="qc">Quebec</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-size">Current Team Size</Label>
                <Input
                  id="team-size"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter number"
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <ShinyButton
              onClick={calculateImpact}
              disabled={!businessStage || !industry || !location || !teamSize}
              size="lg"
              className="w-full"
            >
              Calculate My Impact
            </ShinyButton>

            {showResults && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up">
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-primary" />
                    <div className="font-display text-2xl font-black text-primary">
                      ${getEstimatedFunding().toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated Funding Opportunities
                  </p>
                </Card>

                <Card className="p-6 bg-secondary/5 border-secondary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-secondary" />
                    <div className="font-display text-2xl font-black text-secondary">
                      {getJobCreation()}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Potential Job Creation
                  </p>
                </Card>

                <Card className="p-6 bg-accent/5 border-accent/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-8 h-8 text-accent" />
                    <div className="font-display text-2xl font-black text-accent">
                      {getImpactScore()}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Community Impact Score
                  </p>
                </Card>

                <Card className="p-6 bg-success/5 border-success/20">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-8 h-8 text-success" />
                    <div className="font-display text-2xl font-black text-success">
                      High
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Growth Potential
                  </p>
                </Card>
              </div>
            )}

            {showResults && (
              <div className="mt-8 text-center space-y-4">
                <p className="text-muted-foreground">
                  Based on your profile, we recommend starting with our{' '}
                  <span className="font-bold text-primary">Growth</span> plan
                </p>
                <ShinyButton
                  size="lg"
                  onClick={() => {
                    const element = document.querySelector('#pricing');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Get Your Free Assessment
                </ShinyButton>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ImpactCalculator;
