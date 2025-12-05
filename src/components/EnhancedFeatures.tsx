import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Feather, Compass, TreePine, Users, Network, GraduationCap, ArrowRight, Check, Mic, Sparkles, Smartphone } from 'lucide-react';

const EnhancedFeatures = () => {
  const features = [
    {
      icon: Feather,
      title: 'Business Planning Assistant',
      ojibwe: 'Oshki-Kijiganan Naadamaage',
      description: 'OCAP™ compliant AI tools that integrate traditional Indigenous knowledge with modern business strategies.',
      benefits: [
        'Cultural business model templates',
        'Traditional knowledge integration',
        'Community impact forecasting',
        'Seven generations planning'
      ],
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      hoverBorder: 'hover:border-primary/20'
    },
    {
      icon: Compass,
      title: 'Funding Navigator',
      ojibwe: 'Tebwewin Naadamaage',
      description: 'AI-powered grant matching system that connects you with funding opportunities aligned with your community goals.',
      benefits: [
        'Smart grant matching (500+ sources)',
        'Application template library',
        'Success rate analytics',
        'Partnership connections'
      ],
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
      hoverBorder: 'hover:border-secondary/20'
    },
    {
      icon: TreePine,
      title: 'Community Impact Tracker',
      ojibwe: 'Biidaasige Gibaakwa\'iganan',
      description: 'Measure and report on your business contributions to community wellbeing and environmental stewardship.',
      benefits: [
        'Employment & youth metrics',
        'Truth & Reconciliation alignment',
        'Wellness indicators dashboard',
        'Environmental impact tracking'
      ],
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      hoverBorder: 'hover:border-accent/20'
    },
    {
      icon: GraduationCap,
      title: 'Training & Certification',
      ojibwe: 'Gikinoo\'amaage miinawaa Dibendaagoziwinikazo',
      description: 'Comprehensive learning programs blending cultural competency with essential business skills.',
      benefits: [
        'Indigenous Business Fundamentals',
        'Digital storytelling workshops',
        'Elder knowledge integration',
        'Peer mentorship programs'
      ],
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      hoverBorder: 'hover:border-primary/20'
    },
    {
      icon: Network,
      title: 'Partnership Network',
      ojibwe: 'Wiidookodaadwin Mazina\'igan',
      description: 'Access to established networks including NACCA, CCIB, AFN, and regional Indigenous business councils.',
      benefits: [
        '150+ partner organizations',
        'Cross-cultural collaboration tools',
        'Supplier diversity programs',
        'Government partnership facilitation'
      ],
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
      hoverBorder: 'hover:border-secondary/20'
    },
    {
      icon: Users,
      title: 'Data Sovereignty Tools',
      ojibwe: 'Gibaakwa\'iganan Dibendaagoziwining',
      description: 'Built on OCAP™ principles ensuring Indigenous communities maintain control over their data.',
      benefits: [
        'Secure, encrypted storage',
        'Community-controlled access',
        'Transparent data usage',
        'Indigenous-led governance'
      ],
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
      hoverBorder: 'hover:border-accent/20'
    }
  ];

  return (
    <section id="features" className="py-24 px-6 bg-background" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 id="features-heading" className="font-display text-4xl mb-4 text-foreground">
            Platform Features Built on
            <span className="block italic text-primary">Respect & Traditional Knowledge</span>
          </h2>
          <p className="text-foreground/60 text-lg">
            Miigwech — Our platform integrates traditional Indigenous wisdom with modern AI technology, 
            respecting culture while accelerating business success.
          </p>
        </div>

        {/* Features Grid - Aura Card Style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`bg-card p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 shadow-card hover:shadow-elevated border border-transparent ${feature.hoverBorder} group`}
              >
                <div className={`w-12 h-12 ${feature.iconBg} rounded-full flex items-center justify-center ${feature.iconColor} mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="font-display text-xl mb-2 font-medium text-foreground">{feature.title}</h3>
                <p className="text-xs text-primary/70 italic mb-3">{feature.ojibwe}</p>
                <p className="text-sm text-foreground/60 leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                <ul className="space-y-2">
                  {feature.benefits.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-foreground/70">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Platform Demo CTA */}
        <div className="mt-16 bg-card rounded-[2.5rem] shadow-elevated overflow-hidden flex flex-col md:flex-row">
          {/* Left Info */}
          <div className="md:w-5/12 bg-foreground text-background p-12 flex flex-col justify-between">
            <div>
              <h3 className="font-display text-3xl mb-6 text-card">See the Platform in Action</h3>
              <p className="text-card/70 mb-8 leading-relaxed">
                Experience how Indigenous Rising AI harmonizes traditional knowledge with cutting-edge technology.
              </p>
            </div>
            <div>
              <p className="text-xs text-card/30 uppercase tracking-widest">Built by Indigenous Communities<br/>For Indigenous Communities</p>
            </div>
          </div>

          {/* Right Content */}
          <div className="md:w-7/12 p-12 flex flex-col justify-center">
            <p className="text-foreground/70 mb-8 leading-relaxed">
              Join thousands of Indigenous entrepreneurs who are building sustainable, culturally grounded businesses 
              with our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-[hsl(15,60%,55%)] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                onClick={() => {
                  const element = document.querySelector('#pricing');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Schedule Interactive Demo
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-3 border-2 border-border rounded-full hover:border-primary hover:text-primary transition-all"
              >
                Watch Platform Video
              </Button>
            </div>
          </div>
        </div>

        {/* Cultural Acknowledgment */}
        <div className="mt-16 text-center bg-primary/5 rounded-2xl p-8 border border-primary/10">
          <p className="text-foreground/60 italic max-w-3xl mx-auto font-display text-lg">
            "All features are developed in consultation with Indigenous Elders and community leaders, 
            ensuring respectful integration of traditional knowledge with modern technology. 
            We acknowledge that Indigenous peoples have been innovating and creating sustainable businesses 
            for thousands of years—our platform simply provides tools to amplify that wisdom."
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnhancedFeatures;