import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Award, Users, Clock, Video, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MetaTags from '@/components/MetaTags';
import { useAuth } from '@/hooks/useAuth';

const courses = [
  {
    title: 'Business Fundamentals',
    description: 'Core business concepts tailored for Indigenous entrepreneurs.',
    duration: '8 hours',
    modules: 12
  },
  {
    title: 'Financial Literacy',
    description: 'Understanding cash flow, budgeting, and financial statements.',
    duration: '6 hours',
    modules: 8
  },
  {
    title: 'Marketing & Sales',
    description: 'Building your brand and reaching your target customers.',
    duration: '10 hours',
    modules: 15
  },
  {
    title: 'Proposal Writing',
    description: 'Writing winning proposals for grants and contracts.',
    duration: '4 hours',
    modules: 6
  }
];

const features = [
  {
    title: 'Self-Paced Learning',
    description: 'Learn on your schedule with 24/7 access to all course materials.',
    icon: Clock
  },
  {
    title: 'Video Lessons',
    description: 'Engaging video content taught by Indigenous business leaders.',
    icon: Video
  },
  {
    title: 'Downloadable Resources',
    description: 'Templates, checklists, and worksheets to apply what you learn.',
    icon: FileText
  },
  {
    title: 'Community Support',
    description: 'Connect with fellow learners in our discussion forums.',
    icon: Users
  },
  {
    title: 'Certifications',
    description: 'Earn certificates to showcase your skills to funders.',
    icon: Award
  },
  {
    title: 'Expert Mentorship',
    description: 'Access to Indigenous business mentors for guidance.',
    icon: BookOpen
  }
];

const PublicLearning: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <MetaTags
        title="Learning & Training Hub | Indigenous Rising AI"
        description="Build your business skills with courses designed for Indigenous entrepreneurs. Self-paced learning, certifications, and expert mentorship."
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section with Gradient */}
        <div className="bg-gradient-to-b from-primary/90 to-primary">
          <Navigation />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-16">
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                Learning Hub
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
                Build Your{' '}
                <span className="text-white/90">Business Skills</span>
              </h1>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Access courses, workshops, and certifications designed specifically for 
                Indigenous entrepreneurs. Learn from industry experts and community leaders.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                {user ? (
                  <Button asChild size="lg" variant="secondary">
                    <Link to="/dashboard/resources">
                      Browse Courses
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild size="lg" variant="secondary">
                      <Link to="/auth">
                        Start Learning
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                      <Link to="/training">View Training Calendar</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Featured Courses */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Featured Courses</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start with our most popular courses designed to help you succeed.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <Card key={index} className="hover:shadow-lg hover:border-primary/30 transition-all">
                  <CardHeader>
                    <CardTitle className="text-foreground">{course.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span>{course.modules} modules</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{course.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-muted/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">Learning Made Easy</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to grow your skills and build a successful business.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  Earn Recognized Certifications
                </h2>
                <p className="text-muted-foreground mb-8">
                  Complete courses to earn certifications that demonstrate your expertise to 
                  funders, partners, and customers. Our certifications are recognized by 
                  leading Indigenous business organizations.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-foreground">
                    <Award className="w-5 h-5 text-primary" />
                    Indigenous Business Fundamentals Certificate
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Award className="w-5 h-5 text-primary" />
                    Financial Management Certification
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Award className="w-5 h-5 text-primary" />
                    Procurement Readiness Badge
                  </li>
                  <li className="flex items-center gap-3 text-foreground">
                    <Award className="w-5 h-5 text-primary" />
                    OCAP™ Compliance Training
                  </li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20 text-center">
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">500+</h3>
                <p className="text-muted-foreground mb-6">Certifications Earned</p>
                <p className="text-sm text-muted-foreground">
                  Join hundreds of Indigenous entrepreneurs who've advanced their skills through our platform.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground mb-8">
              Access our full library of courses and start building your skills today.
            </p>
            {user ? (
              <Button asChild size="lg">
                <Link to="/dashboard/resources">
                  Browse All Courses
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

export default PublicLearning;
