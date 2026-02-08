import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Lightbulb, PenTool, BarChart3, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { useAuth } from '@/hooks/useAuth';

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
    description: 'Build realistic financial forecasts with templates.',
    icon: BarChart3
  },
  {
    title: 'Community Impact',
    description: 'Highlight your contribution to Indigenous communities.',
    icon: Users
  }
];

const templates = [
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
        title="Business Planning Assistant | Indigenous Rising AI"
        description="Create a professional business plan with AI-powered guidance. Sector-specific templates and step-by-step assistance for Indigenous entrepreneurs."
      />
      
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <FileText className="w-4 h-4" />
                Business Planning
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Build Your{' '}
                <span className="text-primary">Business Plan</span>{' '}
                with AI Guidance
              </h1>
              <p className="text-lg text-white/70 mb-8">
                Our step-by-step business planning assistant helps you create professional, 
                bank-ready business plans with AI copilots and sector-specific templates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/dashboard/plan">
                      Open Business Planner
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                      <Link to="/auth">
                        Start Your Plan
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

        {/* Plan Sections */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Complete Business Plan Sections</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Our guided process walks you through every section lenders and investors expect to see.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {planSections.map((section, index) => (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <section.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-white">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/60">{section.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Sector-Specific Templates
                </h2>
                <p className="text-white/70 mb-8">
                  Start with a template tailored to your industry. Our templates include 
                  industry benchmarks, sample content, and Indigenous business considerations.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {templates.map((template, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{template}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">AI Copilot</h4>
                      <p className="text-sm text-white/60">Get writing assistance as you go</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">PDF Export</h4>
                      <p className="text-sm text-white/60">Bank-ready professional format</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/30 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Auto-Save</h4>
                      <p className="text-sm text-white/60">Never lose your progress</p>
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
              Ready to Build Your Business Plan?
            </h2>
            <p className="text-white/70 mb-8">
              Join thousands of Indigenous entrepreneurs who've created winning business plans.
            </p>
            {user ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/dashboard/plan">
                  Open Business Planner
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

export default PublicPlan;
