export const OrganizationSchema = () => {
  const schema = {
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

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
