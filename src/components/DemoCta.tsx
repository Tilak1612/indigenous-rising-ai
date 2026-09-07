import { Link } from 'react-router-dom';
import { trackEvent } from '@/utils/analytics';

/**
 * Every demo call to action on the site.
 *
 * One component so the destination and the analytics event cannot drift
 * between the header, the hero, pricing, the mobile menu and the footer.
 * `placement` is what makes the funnel readable afterwards — without it
 * every click looks the same and you cannot tell which surface earns them.
 */
export const DEMO_PATH = '/demo';

type Props = {
  placement: 'nav' | 'nav_mobile' | 'hero' | 'pricing' | 'footer';
  className?: string;
  /** LandingV2 is styled inline, so its CTA needs this. */
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onNavigate?: () => void;
};

export const DemoCta = ({ placement, className, style, children, onNavigate }: Props) => (
  <Link
    to={DEMO_PATH}
    className={className}
    style={style}
    onClick={() => {
      trackEvent('demo_cta_click', { placement });
      onNavigate?.();
    }}
  >
    {children ?? 'Book a demo'}
  </Link>
);

export default DemoCta;
