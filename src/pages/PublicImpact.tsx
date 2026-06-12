import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Leaf, Heart, Briefcase, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { useAuth } from '@/hooks/useAuth';

// What the impact tracker does — described as capabilities, not fabricated
// platform-wide totals. We do not publish aggregate impact numbers we can't
// verify; users measure and report their own real impact.
const trackerCapabilities = [
  {
    title: 'Track',
    description: 'Log jobs, youth programs, funding, and cultural initiatives as they happen.',
    icon: TrendingUp
  },
  {
    title: 'Measure',
    description: 'See your impact across the dimensions that matter to your community.',
    icon: BarChart3
  },
  {
    title: 'Report',
    description: 'Generate funder-ready reports with charts and year-over-year views.',
    icon: Briefcase
  },
  {
    title: 'Share',
    description: 'Publish a shareable public impact page when you\'re ready.',
    icon: Users
  }
];

const impactAreas = [
  {
    title: 'Economic Development',
    description: 'Track job creation, revenue growth, and local procurement impacts.',
    icon: TrendingUp
  },
  {
    title: 'Youth Engagement',
    description: 'Measure mentorship hours, internships, and youth employment.',
    icon: Users
  },
  {
    title: 'Language & Culture',
    description: 'Document cultural programming and language revitalization efforts.',
    icon: Heart
  },
  {
    title: 'Environmental Stewardship',
    description: 'Track sustainability initiatives and environmental impacts.',
    icon: Leaf
  }
];

const PublicImpact: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <MetaTags
        title="Community Impact Tracker | Indigenous Rising AI"
        description="Measure and report your business's community impact. Track jobs, youth engagement, cultural preservation, and environmental stewardship."
      />
      
      <div className="min-h-screen bg-neutral-900">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Impact Tracking
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Measure Your{' '}
                <span className="text-primary">Community Impact</span>
              </h1>
              <p className="text-lg text-white/70 mb-8">
                Track, measure, and report the positive impact your business has on Indigenous 
                communities. Generate impact reports for funders and stakeholders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                    <Link to="/dashboard/analytics">
                      View Impact Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                      <Link to="/auth">
                        Start Tracking Impact
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-primary/40 text-primary bg-white hover:bg-primary/5">
                      <Link to="/pricing">View Plans</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Impact */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">How the impact tracker works</h2>
              <p className="text-white/70 max-w-2xl mx-auto">
                Capture the difference your business makes — in numbers you can stand behind and
                report with confidence.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {trackerCapabilities.map((cap, index) => (
                <Card key={index} className="bg-white/5 border-white/10 text-center">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <cap.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-white text-lg">{cap.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/60">{cap.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Areas */}
        <section className="py-20 px-6 bg-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">
                  Track What Matters Most
                </h2>
                <p className="text-white/70 mb-8">
                  Our impact tracker is designed around metrics that matter to Indigenous communities, 
                  funders, and economic development organizations.
                </p>
                <div className="grid gap-4">
                  {impactAreas.map((area, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <area.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">{area.title}</h4>
                        <p className="text-sm text-white/60">{area.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <h3 className="text-xl font-bold text-white mb-6">Generate Impact Reports</h3>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Funder-ready PDF reports
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Visual charts and infographics
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Year-over-year comparisons
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Community testimonials
                  </li>
                  <li className="flex items-center gap-3 text-white/80">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Shareable public impact page
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Measuring Your Impact
            </h2>
            <p className="text-white/70 mb-8">
              Show funders and stakeholders the real difference your business makes.
            </p>
            {user ? (
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link to="/dashboard/analytics">
                  Open Impact Dashboard
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

export default PublicImpact;
