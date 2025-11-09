import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  twitterImage?: string;
  url?: string;
  type?: string;
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Indigenous Rising AI",
  "description": "AI-powered business support platform for Indigenous entrepreneurs in Canada",
  "url": "https://indigenousrising.ai",
  "logo": "https://indigenousrising.ai/logo.png",
  "foundingDate": "2025",
  "founders": [{
    "@type": "Person",
    "name": "[Founder Name]"
  }],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA"
  },
  "sameAs": [
    "[LinkedIn URL]",
    "[Twitter URL]"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@indigenousrising.ai"
  }
};

const MetaTags = ({
  title = 'Indigenous Rising AI - Business Support Platform',
  description = 'Culturally respectful AI-powered platform supporting Indigenous entrepreneurs across Canada. Harmonizing traditional knowledge with modern business tools while honoring data sovereignty principles.',
  keywords = 'Indigenous business, OCAP, First Nations entrepreneurship, Aboriginal business support, Indigenous AI, business funding, NACCA, Canadian Indigenous business, traditional knowledge, data sovereignty',
  ogImage = 'https://indigenousrising.ai/og-home.jpg',
  twitterImage = 'https://indigenousrising.ai/og-home.jpg',
  url = 'https://indigenousrising.ai',
  type = 'website'
}: MetaTagsProps) => {
  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content={type} />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="en_CA" />
        <meta property="og:site_name" content="Indigenous Rising AI" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={url} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={twitterImage} />
        <meta name="twitter:site" content="@indigenous_ai" />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Indigenous Rising AI" />
        
        {/* Geo Tags */}
        <meta name="geo.region" content="CA" />
        <meta name="geo.placename" content="Canada" />
        
        {/* Canonical */}
        <link rel="canonical" href={url} />
      </Helmet>
      
      {/* Structured Data - Outside Helmet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
};

export default MetaTags;
