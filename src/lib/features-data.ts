import { LucideIcon } from 'lucide-react';
import { TrendingUp, Target, Users, BookOpen, Building, Award } from 'lucide-react';

export interface FeatureEntry {
  slug: string;
  title: string;
  titleTranslation: string;
  description: string;
  icon: LucideIcon;
  features: string[];
  ctaText: string;
  gradient?: 'earth' | 'sky' | 'hero';
  premium?: boolean;
}

export const features: FeatureEntry[] = [
  {
    slug: 'business-planning',
    title: "Business Planning Assistant",
    titleTranslation: "Oshki-Kijiganan Naadamaage",
    description: "Intelligent tools that respect Indigenous data sovereignty while providing AI-powered business insights and traditional knowledge integration.",
    icon: TrendingUp,
    features: [
      "OCAP® compliant data handling",
      "Traditional knowledge integration",
      "Cultural business model guidance",
      "Community impact forecasting",
      "Multi-language support (Cree, Ojibwe, Inuktitut)"
    ],
    ctaText: "Explore Business Tools",
    gradient: 'earth'
  },
  {
    slug: 'funding-navigator',
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
    gradient: 'sky'
    , premium: true
  },
  {
    slug: 'impact-tracker',
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
    gradient: 'hero'
    , premium: true
  },
  {
    slug: 'training-certification',
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
    gradient: 'earth'
  },
  {
    slug: 'partnership-network',
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
    gradient: 'sky'
  },
  {
    slug: 'subscription-plans',
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
    gradient: 'hero'
  }
];

export function getFeatureBySlug(slug: string) {
  return features.find((f) => f.slug === slug) || null;
}
