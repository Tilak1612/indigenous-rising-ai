import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';

/**
 * Slim, fixed-bottom compliance notice. Replaces the previous large dialog
 * that had its own paragraph + bullet grid (which moved to /privacy and
 * /accessibility where it belongs). The banner now shows a single line of
 * summary text plus three actions: Accept, Privacy Policy, Close.
 *
 * Stacks above the CookieConsent banner via bottom-[64px] when both are
 * present so neither overlaps the other.
 */
const ComplianceBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('compliance-accepted');
    if (!accepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('compliance-accepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Privacy and Canadian compliance notice"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-primary/40 bg-card/95 backdrop-blur-md shadow-elevated animate-fade-in-up"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
          <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5 sm:mt-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-foreground/90 leading-snug">
            We use cookies and comply with{' '}
            <span className="font-semibold text-foreground">PIPEDA, CASL, AODA &amp; OCAP™</span>.
            Your data is stored in Canada.{' '}
            <Link
              to="/privacy"
              className="text-primary underline underline-offset-2 hover:text-primary/80 whitespace-nowrap"
            >
              Privacy Policy
            </Link>
            <span className="mx-1 text-muted-foreground" aria-hidden="true">·</span>
            <Link
              to="/accessibility"
              className="text-primary underline underline-offset-2 hover:text-primary/80 whitespace-nowrap"
            >
              Accessibility
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Accept &amp; Continue
          </button>
          <button
            type="button"
            onClick={handleAccept}
            aria-label="Dismiss compliance notice"
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceBanner;
