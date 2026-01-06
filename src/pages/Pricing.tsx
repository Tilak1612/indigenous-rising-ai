import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
import { StructuredData } from '@/components/StructuredData';

const Pricing = () => {
  return (
    <>
      <Helmet>
        <title>Pricing Plans | Indigenous Rising AI - Business Support for Indigenous Entrepreneurs</title>
        <meta 
          name="description" 
          content="Choose the right plan for your Indigenous business journey. Free starter tools, professional plans at $49/month, and custom enterprise solutions. OCAP™ compliant." 
        />
        <meta name="keywords" content="Indigenous business pricing, First Nations entrepreneur tools, Aboriginal business support plans, OCAP compliant platform pricing" />
        <link rel="canonical" href="https://indigenousrising.ai/pricing" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indigenousrising.ai/pricing" />
        <meta property="og:title" content="Pricing Plans | Indigenous Rising AI" />
        <meta property="og:description" content="Flexible pricing plans for Indigenous entrepreneurs. Free to enterprise solutions with OCAP™ compliance." />
        <meta property="og:image" content="https://indigenousrising.ai/og-home.jpg" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing Plans | Indigenous Rising AI" />
        <meta name="twitter:description" content="Flexible pricing plans for Indigenous entrepreneurs. Free to enterprise solutions." />
        <meta name="twitter:image" content="https://indigenousrising.ai/og-home.jpg" />
      </Helmet>
      
      <StructuredData 
        type="page" 
        pageData={{
          name: "Pricing Plans - Indigenous Rising AI",
          description: "Flexible pricing plans for Indigenous entrepreneurs. From free starter tools to enterprise solutions with OCAP™ compliance and cultural competency features.",
          url: "https://indigenousrising.ai/pricing"
        }}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/90 via-primary to-accent overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <Navigation />
          
          <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg text-white/80">
                Investment in your business journey with plans designed for every stage of growth
              </p>
            </div>
          </div>
        </div>
        
        {/* Pricing content */}
        <PricingSection />
        
        <Footer />
      </div>
    </>
  );
};

export default Pricing;
