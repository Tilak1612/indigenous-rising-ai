/* eslint-disable react-refresh/only-export-components */
import { Helmet } from 'react-helmet-async';

// The Organization, WebSite and SoftwareApplication nodes are written
// statically (index.html and scripts/prerender.mjs), and WebPage by the
// prerender. The unused copies that lived here were deleted: they described
// the product differently — a featureList claiming a "Business analytics
// dashboard" and "Grant tracking system", and an Organization "harmonizing
// traditional knowledge" — and were one import away from shipping.

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

// No WebPage generator here: scripts/prerender.mjs writes the WebPage node
// from each route's own title and description, so it cannot disagree with
// the meta tags or depend on JavaScript.

interface StructuredDataProps {
  type?: 'home' | 'page';
  faqs?: { question: string; answer: string }[];
}

export const StructuredData = ({ type = 'page', faqs }: StructuredDataProps) => {
  const schemas = [];

  // Organization + WebSite JSON-LD are emitted statically in index.html (so
  // no-JS crawlers see them). Re-emitting them here duplicated each block once
  // the app hydrated. Keep only the SoftwareApplication schema in React, which
  // index.html does not include.
  // SoftwareApplication is emitted once, statically, on the homepage by
  // scripts/prerender.mjs. Pushing it here as well put two conflicting
  // SoftwareApplication entities on the homepage after hydration (and
  // index.html used to add a third on every page).
  void type;
  
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
