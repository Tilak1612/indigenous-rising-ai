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
          content="Four plans for every stage of the Indigenous business journey: Free, Growth ($49/mo), Professional ($149/mo), and Enterprise (custom). All OCAP® compliant, all data stored in Canada."
        />
        <meta name="keywords" content="Indigenous business pricing, First Nations entrepreneur tools, Aboriginal business support plans, OCAP compliant platform pricing" />
      </Helmet>
      
      <StructuredData 
        type="page" 
        pageData={{
          name: "Pricing Plans - Indigenous Rising AI",
          description: "Flexible pricing plans for Indigenous entrepreneurs. From free starter tools to enterprise solutions with OCAP® compliance and cultural competency features.",
          url: "https://www.indigenousrising.ai/pricing"
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
