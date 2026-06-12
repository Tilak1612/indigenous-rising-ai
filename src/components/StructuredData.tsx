/* eslint-disable react-refresh/only-export-components */
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://www.indigenousrising.ai';

// Organization Schema - main business info
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  "name": "Indigenous Rising AI",
  "alternateName": "Indigenous Rising",
  "description": "AI-powered business support platform for Indigenous entrepreneurs in Canada, harmonizing traditional knowledge with modern business tools while honoring data sovereignty principles.",
  "url": BASE_URL,
  "logo": {
    "@type": "ImageObject",
    "url": `${BASE_URL}/logo-icon.png`,
    "width": 512,
    "height": 512
  },
  "image": `${BASE_URL}/og-home.jpg`,
  "foundingDate": "2025",
  "areaServed": {
    "@type": "Country",
    "name": "Canada",
    "identifier": "CA"
  },
  "knowsAbout": [
    "Indigenous entrepreneurship",
    "First Nations business development",
    "OCAP principles",
    "Indigenous data sovereignty",
    "Business funding for Indigenous peoples",
    "Cultural competency training"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@indigenousrising.ai",
      "availableLanguage": ["English", "French"]
    },
    {
      "@type": "ContactPoint",
      "contactType": "Privacy Officer",
      "email": "privacy@indigenousrising.ai"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA"
  }
};

// SoftwareApplication Schema - for SaaS platform
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${BASE_URL}/#software`,
  "name": "Indigenous Rising AI Platform",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "CAD",
    "lowPrice": "0",
    // Advertise only currently-purchasable fixed-price tiers: Free ($0) and
    // Growth ($49). Professional ($149) is waitlisted (not yet buyable) and
    // Enterprise is custom-quote, so neither belongs in the public price range.
    // When Professional launches, bump highPrice to "149" and offerCount to 3.
    "highPrice": "49",
    "offerCount": 2
  },
  "provider": {
    "@id": `${BASE_URL}/#organization`
  },
  "featureList": [
    "AI-powered funding navigator",
    "Business analytics dashboard",
    "Cultural competency training",
    "Grant tracking system",
    "Community networking"
  ],
  "screenshot": `${BASE_URL}/og-home.jpg`
};

// WebSite Schema - for search features
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  "name": "Indigenous Rising AI",
  "url": BASE_URL,
  "publisher": {
    "@id": `${BASE_URL}/#organization`
  },
  "inLanguage": ["en-CA", "fr-CA"],
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

// FAQ Schema generator
export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// WebPage Schema generator
export const generateWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${page.url}/#webpage`,
  "name": page.name,
  "description": page.description,
  "url": page.url,
  "isPartOf": {
    "@id": `${BASE_URL}/#website`
  },
  "about": {
    "@id": `${BASE_URL}/#organization`
  },
  "datePublished": page.datePublished || "2025-01-01",
  "dateModified": page.dateModified || new Date().toISOString().split('T')[0],
  "inLanguage": "en-CA"
});

// Service Schema for specific offerings
export const generateServiceSchema = (service: {
  name: string;
  description: string;
  url: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.name,
  "description": service.description,
  "url": service.url,
  "provider": {
    "@id": `${BASE_URL}/#organization`
  },
  "areaServed": {
    "@type": "Country",
    "name": "Canada"
  },
  "serviceType": "Business Support Services"
});

interface StructuredDataProps {
  type?: 'home' | 'page';
  pageData?: {
    name: string;
    description: string;
    url: string;
  };
  faqs?: { question: string; answer: string }[];
}

export const StructuredData = ({ type = 'page', pageData, faqs }: StructuredDataProps) => {
  const schemas = [];

  // Organization + WebSite JSON-LD are emitted statically in index.html (so
  // no-JS crawlers see them). Re-emitting them here duplicated each block once
  // the app hydrated. Keep only the SoftwareApplication schema in React, which
  // index.html does not include.
  if (type === 'home') {
    schemas.push(softwareApplicationSchema);
  }
  
  // Add page-specific schema
  if (pageData) {
    schemas.push(generateWebPageSchema(pageData));
  }
  
  // Add FAQ schema if provided
  if (faqs && faqs.length > 0) {
    schemas.push(generateFAQSchema(faqs));
  }
  
  if (schemas.length === 0) return null;
  
  return (
    <Helmet>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default StructuredData;
