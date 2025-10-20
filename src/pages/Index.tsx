import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import EnhancedFeatures from '../components/EnhancedFeatures';
import FundingSection from '../components/FundingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ImpactCalculator from '../components/ImpactCalculator';
import ElderWisdom from '../components/ElderWisdom';
import TrainingSection from '../components/TrainingSection';
import PartnershipsSection from '../components/PartnershipsSection';
import PricingSection from '../components/PricingSection';
import FAQSection from '../components/FAQSection';
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
      <MetaTags />
      <ProgressBar />
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" role="main">
        <HeroSection />
        <SocialProof />
        <EnhancedFeatures />
        <FundingSection />
        <TestimonialsSection />
        <ImpactCalculator />
        <ElderWisdom />
        <TrainingSection />
        <PartnershipsSection />
        <PricingSection />
        <FAQSection />
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