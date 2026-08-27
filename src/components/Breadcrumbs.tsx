import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

// Must match MetaTags' BASE_URL — the canonical host is www. Emitting the
// bare apex here put a non-canonical URL in every BreadcrumbList.
const BASE_URL = 'https://www.indigenousrising.ai';

interface BreadcrumbItem {
  name: string;
  path: string;
  /** false when the path is a URL namespace with no route behind it. */
  navigable?: boolean;
}

// Path prefixes that exist only to namespace their children — there is no
// route at the prefix itself. Breadcrumbs previously linked every intermediate
// segment, so /guides/indigenous-business-grants rendered a link to /guides,
// which 404s. These render as plain text instead, and are omitted from the
// JSON-LD `item` URL so search engines aren't handed a dead link either.
const NON_ROUTE_SEGMENTS = new Set(['/guides', '/features']);

const routeNames: Record<string, string> = {
  '/': 'Home',
  '/guides': 'Guides',
  '/features': 'Features',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service',
  '/cookies': 'Cookie Policy',
  '/accessibility': 'Accessibility',
  '/compliance': 'Canadian Compliance',
  '/data-rights': 'Data Rights',
  '/contact': 'Contact',
  '/training': 'Training Programs',
  '/auth': 'Sign In',
  '/admin': 'Admin Dashboard',
  '/track-request': 'Track Request',
  '/unsubscribe': 'Unsubscribe',
  '/faq': 'FAQ',
  '/success-stories': 'Success Stories',
};

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ customItems, className = '' }: BreadcrumbsProps) => {
  const location = useLocation();
  
  // Build breadcrumb items from current path
  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [{ name: 'Home', path: '/' }];
    
    let currentPath = '';
    for (const segment of pathSegments) {
      currentPath += `/${segment}`;
      const name = routeNames[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      items.push({ name, path: currentPath, navigable: !NON_ROUTE_SEGMENTS.has(currentPath) });
    }
    
    return items;
  };
  
  const breadcrumbs = buildBreadcrumbs();
  
  // Don't show breadcrumbs on homepage
  if (location.pathname === '/') return null;
  
  // Generate JSON-LD schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      // A namespace segment has no page to point at; omitting `item` is valid
      // for BreadcrumbList and avoids publishing a URL that 404s.
      ...(item.navigable === false ? {} : { "item": `${BASE_URL}${item.path}` })
    }))
  };
  
  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>
      
      <nav 
        aria-label="Breadcrumb" 
        className={`py-4 px-4 text-sm border-b bg-muted ${className}`}
      >
        <ol 
          className="flex flex-wrap items-center gap-1 text-muted-foreground"
          itemScope 
          itemType="https://schema.org/BreadcrumbList"
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return (
              <li 
                key={item.path}
                className="flex items-center"
                itemScope
                itemProp="itemListElement"
                itemType="https://schema.org/ListItem"
              >
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" aria-hidden="true" />
                )}
                
                {isLast ? (
                  <span
                    className="text-foreground font-medium"
                    itemProp="name"
                    aria-current="page"
                  >
                    {index === 0 ? <Home className="h-4 w-4" role="img" aria-label="Home" /> : item.name}
                  </span>
                ) : item.navigable === false ? (
                  <span className="flex items-center">
                    <span itemProp="name">{item.name}</span>
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="hover:text-primary transition-colors flex items-center"
                    itemProp="item"
                    // The home crumb's only content is an icon. aria-label on a
                    // bare <svg> is not reliably exposed (no role="img"), so the
                    // link had an empty accessible name and announced only
                    // "link". Naming the link itself is what screen readers read.
                    aria-label={index === 0 ? 'Home' : undefined}
                  >
                    <span itemProp="name">
                      {index === 0
                        ? <Home className="h-4 w-4" role="img" aria-label="Home" />
                        : item.name}
                    </span>
                  </Link>
                )}
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
