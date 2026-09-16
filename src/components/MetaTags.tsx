import { Helmet } from 'react-helmet-async';
import { StructuredData } from './StructuredData';

interface MetaTagsProps {
  title?: string;
  // Accepted for existing call sites but not rendered: scripts/prerender.mjs
  // owns description, keywords, og/twitter images and canonical per route.
  description?: string;
  keywords?: string;
  ogImage?: string;
  twitterImage?: string;
  url?: string;
  type?: string;
  isHomePage?: boolean;
  faqs?: { question: string; answer: string }[];
}

const MetaTags = ({
  title = 'Indigenous Rising AI - Business Support Platform',
  isHomePage = false,
  faqs
}: MetaTagsProps) => {
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
      {/* The WebPage node is written by scripts/prerender.mjs from the same
          title and description as the meta tags. Only the homepage FAQ is
          still emitted here. */}
      <StructuredData type={isHomePage ? 'home' : 'page'} faqs={faqs} />
    </>
  );
};

export default MetaTags;
