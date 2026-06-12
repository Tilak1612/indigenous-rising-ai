import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, MapPin } from 'lucide-react';

// Shared trust/disclaimer components — canonical copy defined ONCE so no page
// over-claims. The honest hedging that previously lived only on the homepage
// ("designed around OCAP®, not certified"; "PIPEDA-aligned… not a third-party
// certification") is the single source of truth here. Import these instead of
// re-typing the wording.

export const TRUST_COPY = {
  ocap:
    'Designed around the First Nations principles of Ownership, Control, Access, and Possession (OCAP®). OCAP® is a registered trademark of the First Nations Information Governance Centre; we are designed around it, not certified by it.',
  compliance:
    'PIPEDA-aligned and CASL-aligned. These describe how we build and operate; they are not third-party certifications unless explicitly stated on our Trust page.',
  comingSoon:
    "◐ marks features that are planned but not yet available. You'll never be charged for a feature before it ships.",
  dataResidency:
    "Your data is stored in Canada and doesn't leave the country. Encrypted in transit and at rest, with role-based access you manage.",
} as const;

/** Full OCAP® notice — for the sovereignty section and the compliance page. */
export function OcapNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 ${className}`}>
      <Leaf className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden />
      <p className="text-sm text-muted-foreground leading-relaxed">{TRUST_COPY.ocap}</p>
    </div>
  );
}

/**
 * Compliance badge — the "PIPEDA-aligned" / "CASL-aligned" pills, which ALWAYS
 * link to /compliance for the full explanation (they used to appear bare).
 */
export function ComplianceBadge({
  label = 'PIPEDA-aligned',
  className = '',
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Link
      to="/compliance"
      title={TRUST_COPY.compliance}
      className={`inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors ${className}`}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
      {label}
    </Link>
  );
}

/** The ◐ marker for planned features. Always pair with <ComingSoonLegend />. */
export function ComingSoonTag({ className = '' }: { className?: string }) {
  return (
    <span className={`text-[#A87A1E] font-semibold ${className}`} aria-label="Coming soon" title={TRUST_COPY.comingSoon}>
      ◐
    </span>
  );
}

/** The single reusable legend that explains the ◐ marker. */
export function ComingSoonLegend({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>
      <ComingSoonTag /> {TRUST_COPY.comingSoon.replace('◐ ', '')}
    </p>
  );
}

/** Canada data-residency note — sovereignty, compliance, pricing footer, auth. */
export function DataResidencyNote({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" aria-hidden />
      <p className="text-sm text-muted-foreground leading-relaxed">{TRUST_COPY.dataResidency}</p>
    </div>
  );
}
