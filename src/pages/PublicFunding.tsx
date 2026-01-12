import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, DollarSign, FileCheck, Building2, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { useAuth } from '@/hooks/useAuth';

const fundingTypes = [
  {
    title: 'Government Grants',
    description: 'Non-repayable funding from federal and provincial programs designed specifically for Indigenous entrepreneurs.',
    icon: Building2,
    amount: 'Up to $500K+'
  },
  {
    title: 'Business Loans',
    description: 'Low-interest financing options through Aboriginal Financial Institutions and community lenders.',
    icon: DollarSign,
    amount: 'Flexible terms'
  },
  {
    title: 'Equity Investment',
    description: 'Growth capital from Indigenous-focused investment funds and impact investors.',
    icon: TrendingUp,
    amount: 'Seed to Series'
  },
  {
    title: 'Community Programs',
    description: 'Local economic development initiatives and Nation-specific business support programs.',
    icon: Users,
    amount: 'Varies by region'
  }
];

const features = [
  'AI-powered funding matching based on your business profile',
  'Personalized eligibility assessments for 200+ programs',
  'Application tracking and deadline reminders',
  'Document preparation assistance',
  'Direct links to application portals',
  'Success rate insights and tips'
];

const PublicFunding: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <MetaTags
        title="Indigenous Business Funding Navigator | Indigenous Rising AI"
        description="Discover grants, loans, and equity opportunities for Indigenous entrepreneurs. AI-powered matching to find funding you qualify for."
      />
      
      <div className="min-h-screen bg-neutral-900">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="w-4 h-4" />
                Funding Navigator
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Find the Right Funding for Your{' '}
                <span className="text-primary">Indigenous Business</span>
              </h1>
              <p className="text-lg text-white/70 mb-8">
                Access our comprehensive database of 200+ funding opportunities. Our AI matches you 
                with grants, loans, and investment options based on your unique business profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/dashboard/funding">
                      Go to Funding Navigator
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                      <Link to="/auth">
                        Start Finding Funding
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                      <Link to="/pricing">View Plans</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Funding Types */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Types of Funding Available</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                From startup grants to growth capital, we help you navigate every funding option available to Indigenous entrepreneurs.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {fundingTypes.map((type, index) => (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <type.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-white">{type.title}</CardTitle>
                    <div className="text-primary font-semibold">{type.amount}</div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/60">{type.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Smart Funding Matching Technology
                </h2>
                <p className="text-white/70 mb-8">
                  Our AI analyzes your business profile, industry, location, and growth stage to 
                  recommend funding opportunities with the highest likelihood of approval.
                </p>
                <ul className="space-y-4">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <FileCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-white/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">$2.5B+</div>
                  <p className="text-white/70 mb-6">in funding opportunities tracked</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">200+</div>
                      <p className="text-sm text-white/60">Programs</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">85%</div>
                      <p className="text-sm text-white/60">Match Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Find Your Funding?
            </h2>
            <p className="text-white/70 mb-8">
              Create your free profile and get matched with funding opportunities in minutes.
            </p>
            {user ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/dashboard/funding">
                  Access Funding Navigator
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default PublicFunding;
