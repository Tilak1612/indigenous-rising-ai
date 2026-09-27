import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Lightbulb, PenTool, BarChart3, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { useAuth } from '@/hooks/useAuth';
import { ROUTE_TITLES } from '@/data/routeTitles';

const planSections = [
  {
    title: 'Vision & Mission',
    description: 'Define your purpose and long-term goals with guided prompts.',
    icon: Lightbulb
  },
  {
    title: 'Market Analysis',
    description: 'Understand your target market and competitive landscape.',
    icon: BarChart3
  },
  {
    title: 'Products & Services',
    description: 'Clearly articulate your offerings and value proposition.',
    icon: FileText
  },
  {
    title: 'Operations Plan',
    description: 'Map out your day-to-day business operations.',
    icon: PenTool
  },
  {
    title: 'Financial Projections',
    description: 'Set out your revenue and costs, and the assumptions behind them.',
    icon: BarChart3
  },
  {
    title: 'Community Impact',
    description: 'Highlight your contribution to Indigenous communities.',
    icon: Users
  }
];

const sectors = [
  'Tourism & Cultural Experiences',
  'Arts & Crafts Retail',
  'Food & Beverage',
  'Technology & Software',
  'Construction & Trades',
  'Natural Resources',
  'Health & Wellness',
  'Professional Services'
];

const PublicPlan: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <MetaTags
        title={ROUTE_TITLES['/plan']}
        description="Build a funder-ready business plan section by section, with prompts grounded in Indigenous business context. Export it as a document or plain text. Free to start, no credit card."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section with Gradient */}
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="mb-4">
                <FileText className="w-3 h-3 mr-1" />
                Business Planning
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Build Your{' '}
                <span className="text-white/90">Business Plan</span>{' '}
                Step by Step
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                A guided assistant that walks you through the six sections funders ask for,
                with prompts written for Indigenous business context — not generic templates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {user ? (
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/dashboard/plan">
                      Open Business Planner
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" variant="secondary">
                      <Link to="/auth">
                        Start Your Plan
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                      <Link to="/pricing">View Plans</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Sections */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Complete Business Plan Sections</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our guided process walks you through every section lenders and investors expect to see.
                A plan is preparation, not an application — a funder still reviews it on their own criteria.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planSections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg hover:border-primary/30 transition-all">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-foreground">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{section.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="py-20 px-6 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  Written for Indigenous business context
                </h2>
                <p className="text-muted-foreground mb-8">
                  The same six sections work for any sector. What changes is the prompting:
                  the questions are written for Indigenous entrepreneurs, and the plan has a
                  Community Impact section most planning tools do not. Entrepreneurs use it
                  across these sectors and others.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {sectors.map((sector, index) => (
                    <div key={index} className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{sector}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">Guided prompts</h3>
                      <p className="text-sm text-muted-foreground">Concrete questions for every section</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">PDF Export</h3>
                      <p className="text-sm text-muted-foreground">Plus Word and plain text for funder forms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-foreground font-semibold">Auto-Save</h3>
                      <p className="text-sm text-muted-foreground">Never lose your progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Ready to Build Your Business Plan?
            </h2>
            <p className="text-muted-foreground mb-8">
              Work through it section by section, at your own pace. Free to start, no credit card.
            </p>
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard/plan">
                  Open Business Planner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg">
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

export default PublicPlan;
