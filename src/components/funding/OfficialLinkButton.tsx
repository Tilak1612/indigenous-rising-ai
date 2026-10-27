import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { officialLink, recordOfficialClick, type LinkSource } from '@/lib/funding-links';

interface Props {
  program: LinkSource & { id?: string; name?: string };
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline';
  className?: string;
  /** Show the one-line explanation under the button (detail page). */
  withDescription?: boolean;
}

/**
 * The single outbound button for a programme. The label is decided by the
 * link engine from apply_link_type, so a lender directory or a contact page
 * is never presented as an application form.
 */
export default function OfficialLinkButton({ program, size = 'sm', variant = 'outline', className = '', withDescription = false }: Props) {
  const link = officialLink(program);
  if (!link) {
    return (
      <p className="text-xs text-muted-foreground">
        No working link on file. Contact the funder directly, or report this so we can fix it.
      </p>
    );
  }
  return (
    <div className={className}>
      <Button asChild variant={variant} size={size} className="w-full">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={() => {
            recordOfficialClick(program.id, link.kind);
            import('@/utils/analytics').then((m) => m.trackEvent('funding_official_link_click', { grant_id: program.id, link_type: link.type })).catch(() => undefined);
          }}
        >
          {link.label}
          <ExternalLink className="w-3.5 h-3.5 ml-2" aria-hidden="true" />
        </a>
      </Button>
      {withDescription && <p className="text-xs text-muted-foreground mt-2">{link.description}</p>}
    </div>
  );
}
