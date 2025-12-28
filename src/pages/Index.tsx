import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import PartnerLogos from '../components/PartnerLogos';
import EnhancedFeatures from '../components/EnhancedFeatures';
import FundingSection from '../components/FundingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ImpactCalculator from '../components/ImpactCalculator';
import ElderWisdom from '../components/ElderWisdom';
import TrainingSection from '../components/TrainingSection';
import PartnershipsSection from '../components/PartnershipsSection';
import PricingSection from '../components/PricingSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import StickyCTA from '../components/StickyCTA';
import ProgressBar from '../components/ProgressBar';
import CanadianComplianceBadge from '../components/CanadianComplianceBadge';
import SocialProof from '../components/SocialProof';
import MetaTags from '../components/MetaTags';
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <MetaTags 
        title="Indigenous Rising AI | Business Support for Indigenous Entrepreneurs in Canada"
        description="AI-powered platform supporting Indigenous entrepreneurs across Canada. Access funding navigation, business analytics, training programs, and culturally respectful tools honoring OCAP principles."
        ogImage="https://indigenousrising.ai/og-home.jpg"
        twitterImage="https://indigenousrising.ai/og-home.jpg"
        isHomePage={true}
      />
      <ProgressBar />
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" role="main">
        <HeroSection />
        <PartnerLogos />
        <SocialProof />
        <EnhancedFeatures />
        <FundingSection />
        <TestimonialsSection />
        <ImpactCalculator />
        <ElderWisdom />
        <TrainingSection />
        <PartnershipsSection />
        <PricingSection />
        <div className="container mx-auto px-4 py-12">
          <CanadianComplianceBadge />
        </div>
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
      <StickyCTA />
    </div>
  );
};

export default Index;