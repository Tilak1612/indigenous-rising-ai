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
        <meta name="robots" content="noindex, follow" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.indigenousrising.ai/404" />
        <meta property="og:title" content="404 - Page Not Found" />
        <meta property="og:description" content="The page you are looking for does not exist." />
        <meta property="og:image" content="https://www.indigenousrising.ai/og-home.jpg" />
      </Helmet>
      
      <Navigation />
      <main>
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <p className="text-6xl font-display font-bold text-primary mb-4" aria-hidden="true">404</p>
          <h1 className="text-2xl font-display font-semibold text-foreground mb-4">Page not found</h1>
          <p className="text-muted-foreground mb-8">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-semibold"
          >
            Return to Home
          </Link>
          {/* A dead end loses the visitor and the crawl path. Point both at the
              pages most people arriving on a stale link were looking for. */}
          <nav aria-label="Popular pages" className="mt-8">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
              <li><Link to="/guides/indigenous-business-grants" className="text-primary underline-offset-4 hover:underline">Grants &amp; funding guide</Link></li>
              <li><Link to="/funding" className="text-primary underline-offset-4 hover:underline">Find funding</Link></li>
              <li><Link to="/blog" className="text-primary underline-offset-4 hover:underline">Blog</Link></li>
              <li><Link to="/pricing" className="text-primary underline-offset-4 hover:underline">Pricing</Link></li>
              <li><Link to="/contact" className="text-primary underline-offset-4 hover:underline">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
