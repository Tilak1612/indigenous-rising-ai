import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { StructuredData } from './StructuredData';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  twitterImage?: string;
  url?: string;
  type?: string;
  isHomePage?: boolean;
  faqs?: { question: string; answer: string }[];
}

const BASE_URL = 'https://www.indigenousrising.ai';

const MetaTags = ({
  title = 'Indigenous Rising AI - Business Support Platform',
  description = 'Culturally respectful AI-powered platform supporting Indigenous entrepreneurs across Canada. Harmonizing traditional knowledge with modern business tools while honoring data sovereignty principles.',
  keywords = 'Indigenous business, OCAP, First Nations entrepreneurship, Aboriginal business support, Indigenous AI, business funding, NACCA, Canadian Indigenous business, traditional knowledge, data sovereignty',
  ogImage = `${BASE_URL}/og-home.jpg`,
  twitterImage = `${BASE_URL}/og-home.jpg`,
  url,
  type = 'website',
  isHomePage = false,
  faqs
}: MetaTagsProps) => {
  const location = useLocation();
  // Self-referential canonical: use explicitly passed url, or derive from current route
  const canonicalUrl = url || `${BASE_URL}${location.pathname === '/' ? '' : location.pathname}`;
  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:site_name" content="Indigenous Rising AI" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={twitterImage} />
        <meta name="twitter:site" content="@indigenous_ai" />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Indigenous Rising AI" />

        {/* Geo Tags for Canadian focus */}
        <meta name="geo.region" content="CA" />
        <meta name="geo.placename" content="Canada" />

        {/* Canonical — self-referential per page for correct indexing */}
        <link rel="canonical" href={canonicalUrl} />

        {/* Alternate languages */}
        <link rel="alternate" hrefLang="en-ca" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      </Helmet>
      
      {/* Structured Data */}
      <StructuredData 
        type={isHomePage ? 'home' : 'page'}
        pageData={!isHomePage ? { name: title, description, url: canonicalUrl } : undefined}
        faqs={faqs}
      />
    </>
  );
};

export default MetaTags;
