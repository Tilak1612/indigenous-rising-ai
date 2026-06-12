import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Feather, Compass, TreePine, Users, Network, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const EnhancedFeatures = () => {
  const features = [
    {
      icon: Feather,
      title: 'Business Planning Assistant',
      slug: 'business-planning',
      ojibwe: 'Oshki-Kijiganan Naadamaage',
      description: 'OCAP® compliant AI tools that connect traditional knowledge with modern business strategy.',
      benefits: [
        'Cultural business templates',
        'Community impact forecasting',
        'Seven generations planning'
      ],
      color: 'primary',
      bgGradient: 'from-primary/10 to-primary/5'
    },
    {
      icon: Compass,
      title: 'Funding Navigator',
      slug: 'funding-navigator',
      ojibwe: 'Tebwewin Naadamaage',
      description: 'AI-powered grant matching aligned with your community goals.',
      benefits: [
        'Smart grant matching (500+ sources)',
        'Application templates',
        'Success rate analytics'
      ],
      color: 'accent',
      bgGradient: 'from-accent/10 to-accent/5'
    },
    {
      icon: TreePine,
      title: 'Community Impact Tracker',
      slug: 'impact-tracker',
      ojibwe: 'Biidaasige Gibaakwa\'iganan',
      description: 'Measure community wellbeing and environmental stewardship.',
      benefits: [
        'Employment and youth metrics',
        'Wellness indicators dashboard',
        'Environmental impact tracking'
      ],
      color: 'secondary',
      bgGradient: 'from-secondary/10 to-secondary/5'
    },
    {
      icon: GraduationCap,
      title: 'Training & Certification',
      slug: 'training-certification',
      ojibwe: 'Gikinoo\'amaage miinawaa Dibendaagoziwinikazo',
      description: 'Learning programs blending cultural competency and core business skills.',
      benefits: [
        'Indigenous Business Fundamentals',
        'Elder knowledge integration',
        'Peer mentorship programs'
      ],
      color: 'goldenrod',
      bgGradient: 'from-[hsl(45,75%,62%)]/10 to-[hsl(45,75%,62%)]/5'
    },
    {
      icon: Network,
      title: 'Partnership Network',
      slug: 'partnership-network',
      ojibwe: 'Wiidookodaadwin Mazina\'igan',
      description: 'Access to established networks and regional Indigenous councils.',
      benefits: [
        '150+ partner organizations',
        'Supplier diversity programs',
        'Government partnership facilitation'
      ],
      color: 'ochre',
      bgGradient: 'from-[hsl(30,45%,48%)]/10 to-[hsl(30,45%,48%)]/5'
    },
    {
      icon: Users,
      title: 'Data Sovereignty Tools',
      slug: 'subscription-plans',
      ojibwe: 'Gibaakwa\'iganan Dibendaagoziwining',
      description: 'Built on OCAP® principles so communities control their data.',
      benefits: [
        'Secure, encrypted storage',
        'Community-controlled access',
        'Indigenous-led governance'
      ],
      color: 'canoe-red',
      bgGradient: 'from-[hsl(5,55%,42%)]/10 to-[hsl(5,55%,42%)]/5'
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30" aria-labelledby="features-heading">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              Comprehensive Support for Indigenous Innovation
            </Badge>
            <h2 id="features-heading" className="font-display text-4xl md:text-5xl font-black text-foreground mb-6">
              Platform Features Built on
              <span className="block gradient-earth bg-clip-text text-transparent">
                Respect & Traditional Knowledge
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Miigwech — Our platform integrates traditional Indigenous wisdom with modern AI technology, 
              respecting culture while accelerating business success.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className={`group p-8 hover:shadow-elevated transition-all duration-500 bg-gradient-to-br ${feature.bgGradient} border-border/50 hover:border-primary/30 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-natural group-hover:shadow-glow transition-all flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold text-foreground mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-primary/70 italic font-medium">
                          {feature.ojibwe}
                        </p>
                      </div>
                      
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-foreground/80">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      
                              <div className="flex items-center gap-3">
                                <Button
                                  asChild
                                  variant="ghost"
                                  size="sm"
                                  className="group/btn text-primary hover:text-primary hover:bg-primary/10 -ml-2"
                                >
                                  <Link to={`/features/${feature.slug}`}>
                                    Learn More
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                  </Link>
                                </Button>
                                {feature.title === 'Funding Navigator' && (
                                  <Button asChild size="sm" variant="outline">
                                    <Link to="/contact">Request Platform Video</Link>
                                  </Button>
                                )}
                              </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Platform Demo CTA */}
          <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 border-primary/20">
            <h3 className="font-display text-3xl font-bold text-foreground mb-4">
              See the Platform in Action
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Experience how Indigenous Rising AI harmonizes traditional knowledge with cutting-edge technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="hero" className="shadow-elevated hover:shadow-glow">
                <Link to="/contact">Schedule Interactive Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-2 border-primary hover:bg-primary/10">
                <Link to="/contact">Request Demo Recording</Link>
              </Button>
            </div>
          </Card>

          {/* Cultural Acknowledgment */}
          <div className="mt-16 text-center bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
            <p className="text-muted-foreground italic max-w-3xl mx-auto">
              "All features are developed in consultation with Indigenous Elders and community leaders, 
              ensuring respectful integration of traditional knowledge with modern technology. 
              We acknowledge that Indigenous peoples have been innovating and creating sustainable businesses 
              for thousands of years—our platform simply provides tools to amplify that wisdom."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatures;
