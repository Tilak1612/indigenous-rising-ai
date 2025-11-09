import { Helmet } from 'react-helmet-async';
import { OrganizationSchema } from './StructuredData';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const MetaTags = ({
  title = 'Indigenous Rising AI - Business Support Platform',
  description = 'Culturally respectful AI-powered platform supporting Indigenous entrepreneurs across Canada. Harmonizing traditional knowledge with modern business tools while honoring data sovereignty principles.',
  keywords = 'Indigenous business, OCAP, First Nations entrepreneurship, Aboriginal business support, Indigenous AI, business funding, NACCA, Canadian Indigenous business, traditional knowledge, data sovereignty',
  image = 'https://www.indigenousrising.ai/logo-icon.png',
  url = 'https://www.indigenousrising.ai',
  type = 'website'
}: MetaTagsProps) => {
  return (
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
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="en_CA" />
      <meta property="og:site_name" content="Indigenous Rising AI" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
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
      
      {/* Structured Data */}
      <OrganizationSchema />
    </Helmet>
  );
};

export default MetaTags;
