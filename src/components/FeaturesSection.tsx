import FeatureCard from './FeatureCard';
import { TrendingUp, Target, Users, BookOpen, Building, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      title: "Business Planning Assistant",
      titleTranslation: "Oshki-Kijiganan Naadamaage",
      description: "Intelligent tools that respect Indigenous data sovereignty while providing AI-powered business insights and traditional knowledge integration.",
      icon: TrendingUp,
      features: [
        "OCAP™ compliant data handling",
        "Traditional knowledge integration",
        "Cultural business model guidance",
        "Community impact forecasting",
        "Multi-language support (Cree, Ojibwe, Inuktitut)"
      ],
      ctaText: "Explore Business Tools",
      gradient: "earth" as const
    },
    {
      title: "Funding Navigator",
      titleTranslation: "Tebwewin Naadamaage",
      description: "AI-powered matching system connecting Indigenous entrepreneurs with government grants, corporate partnerships, and community funding opportunities.",
      icon: Target,
      features: [
        "Real-time funding opportunity matching",
        "Application assistance and templates",
        "Success rate analytics",
        "Government program navigation",
        "Corporate partnership connections"
      ],
      ctaText: "Find Funding",
      gradient: "sky" as const
    },
    {
      title: "Community Impact Tracker",
      titleTranslation: "Biidaasige Gibaakwa'iganan",
      description: "Comprehensive analytics dashboard measuring employment growth, youth engagement, and environmental stewardship aligned with Truth and Reconciliation Calls to Action.",
      icon: Users,
      features: [
        "Employment impact measurement",
        "Youth engagement tracking",
        "Environmental stewardship metrics",
        "Truth and Reconciliation alignment",
        "Community wellness indicators"
      ],
      ctaText: "View Impact Dashboard",
      gradient: "hero" as const
    },
    {
      title: "Training & Certification",
      titleTranslation: "Gikinoo'amaage miinawaa Dibendaagoziwinikazo",
      description: "Culturally competent business development programs combining traditional Indigenous knowledge with modern entrepreneurial skills.",
      icon: BookOpen,
      features: [
        "Cultural competency certification",
        "Business development workshops",
        "Elder knowledge sharing sessions",
        "Peer mentorship programs",
        "Digital literacy training"
      ],
      ctaText: "Enroll in Programs",
      gradient: "earth" as const
    },
    {
      title: "Partnership Network",
      titleTranslation: "Wiidookodaadwin Mazina'igan",
      description: "Strategic connections with NACCA, CCIB, AFN, and other key Indigenous business organizations across Canada.",
      icon: Building,
      features: [
        "NACCA partnership integration",
        "CCIB network access",
        "AFN resource connections",
        "Regional business council links",
        "Cross-cultural collaboration tools"
      ],
      ctaText: "Explore Partnerships",
      gradient: "sky" as const
    },
    {
      title: "Subscription Plans",
      titleTranslation: "Ozhichigan Ina'koniganan",
      description: "Flexible pricing tiers designed to support Indigenous entrepreneurs at every stage of their business journey.",
      icon: Award,
      features: [
        "Basic: Essential tools for startups",
        "Premium: Advanced AI features",
        "Enterprise: Full community solutions",
        "Cultural organization discounts",
        "Flexible payment options"
      ],
      ctaText: "View Pricing",
      gradient: "hero" as const
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-6 animate-fade-in-up">
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            Comprehensive Support for
            <span className="block gradient-earth bg-clip-text text-transparent">
              Indigenous Innovation
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Miigwech - Our platform integrates traditional Indigenous wisdom with cutting-edge AI technology, 
            respecting cultural values while accelerating business success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <FeatureCard {...feature} />
            </div>
          ))}
        </div>

        {/* Cultural acknowledgment */}
        <div className="mt-20 text-center space-y-4 p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-natural">
          <p className="text-sm text-muted-foreground italic">
            "We acknowledge that we are on the traditional territories of Indigenous peoples and commit to honoring Indigenous data sovereignty principles in all our operations."
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground/70">
            <span>OCAP™ Principles</span>
            <span>•</span>
            <span>Truth and Reconciliation</span>
            <span>•</span>
            <span>Cultural Competency</span>
            <span>•</span>
            <span>Community Partnership</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;