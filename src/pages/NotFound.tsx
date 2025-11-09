import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from 'react-helmet-async';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Indigenous Rising AI</title>
        <meta name="description" content="The page you are looking for does not exist." />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://indigenousrising.ai/404" />
        <meta property="og:title" content="404 - Page Not Found" />
        <meta property="og:description" content="The page you are looking for does not exist." />
        <meta property="og:image" content="https://indigenousrising.ai/og-home.jpg" />
      </Helmet>
      
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-6xl font-display font-bold text-primary mb-4">404</h1>
          <p className="text-2xl text-foreground mb-4">Oops! Page not found</p>
          <p className="text-muted-foreground mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            Return to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
