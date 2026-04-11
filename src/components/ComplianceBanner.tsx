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

  // Theme-independent dark green palette (hardcoded by design — the project's
  // semantic tokens resolve to white in light mode, which would defeat the
  // purpose of a contrast-y compliance bar). These hexes match the brand
  // forest-green used elsewhere on the site.
  return (
    <div
      role="region"
      aria-label="Privacy and Canadian compliance notice"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a2e1a] border-t-2 border-[#4caf50] shadow-lg animate-fade-in-up"
    >
      <div className="w-full px-4 sm:px-6 py-2.5 flex flex-row flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Shield className="w-4 h-4 text-[#a5d6a7] shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm text-[#e8f5e9] leading-snug">
            We use cookies and comply with{' '}
            <span className="font-semibold text-white">PIPEDA, CASL, AODA &amp; OCAP™</span>.
            Your data is stored in Canada.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/privacy"
            className="text-xs sm:text-sm text-[#a5d6a7] underline underline-offset-2 hover:text-white transition-colors whitespace-nowrap"
          >
            Privacy Policy
          </Link>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-md bg-[#4caf50] hover:bg-[#388e3c] text-white transition-colors"
          >
            Accept &amp; Continue
          </button>
          <button
            type="button"
            onClick={handleAccept}
            aria-label="Dismiss compliance notice"
            className="p-1 rounded-md text-[#a5d6a7] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceBanner;
