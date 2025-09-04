import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import PricingSection from '../components/PricingSection';
import PartnershipsSection from '../components/PartnershipsSection';
import TrainingSection from '../components/TrainingSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content" role="main">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <TrainingSection />
        <PartnershipsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;