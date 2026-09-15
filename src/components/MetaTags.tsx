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
  keywords = 'Indigenous business, OCAP, First Nations entrepreneurship, Aboriginal business support, Indigenous AI, business funding, Canadian Indigenous business, traditional knowledge, data sovereignty',
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
  // Keep the SERP/social description under Google's truncation point.
  return (
    <>
      <Helmet>
        {/* Title only. scripts/prerender.mjs writes the description,
            canonical, robots and og/twitter tags per route into the static
            HTML and is their only source — react-helmet-async deletes tags it
            owns but a page does not re-emit, which is how /pricing ended up
            with no canonical and no og:title. The title stays here so the tab
            updates on client-side navigation; it must match the prerendered
            one, which src/__tests__/seo-title-parity.test.ts checks. */}
        <title>{title}</title>
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
