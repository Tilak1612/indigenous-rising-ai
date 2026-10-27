import { Link } from 'react-router-dom';
import { Calendar, DollarSign, MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import OfficialLinkButton from '@/components/funding/OfficialLinkButton';
import { formatFreshness } from '@/lib/funding-freshness';
import {
  deriveIntake, eligibilitySummary, formatAmount, fundingTypeLabel, regionLabel,
  type FundingProgram,
} from '@/lib/funding-catalog';

const TONE: Record<string, string> = {
  urgent: 'bg-destructive/10 text-destructive border-destructive/30',
  soon: 'bg-warning/10 text-warning border-warning/30',
  open: 'bg-primary/10 text-primary border-primary/30',
  rolling: 'bg-primary/10 text-primary border-primary/30',
  closed: 'bg-muted text-muted-foreground',
  unknown: 'bg-muted text-muted-foreground',
};

export default function FundingProgramCard({ program, action }: { program: FundingProgram; action?: React.ReactNode }) {
  const intake = deriveIntake(program);
  const freshness = formatFreshness(program);
  return (
    <Card className="hover:shadow-lg hover:border-primary/30 transition-all flex flex-col">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">{fundingTypeLabel(program)}</Badge>
          {program.is_repayable === false && program.funding_type !== 'contribution' && (
            <Badge variant="outline" className="text-xs">Non-repayable</Badge>
          )}
          <Badge variant="outline" className={`text-xs ${TONE[intake.tone]}`}>
            <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
            {intake.text}
          </Badge>
        </div>
        <CardTitle className="text-foreground text-xl leading-snug">
          <Link to={`/funding/${program.slug}`} className="hover:underline">{program.name}</Link>
        </CardTitle>
        <CardDescription className="text-sm">{program.funder}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4 flex-1">{program.description}</p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-start gap-1.5"><DollarSign className="w-3.5 h-3.5 mt-px text-muted-foreground" aria-hidden="true" /><dt className="sr-only">Amount</dt><dd>{formatAmount(program)}</dd></div>
          <div className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-px text-muted-foreground" aria-hidden="true" /><dt className="sr-only">Region</dt><dd>{regionLabel(program)}</dd></div>
          <div className="sm:col-span-2 text-muted-foreground"><dt className="sr-only">Who may qualify</dt><dd>{eligibilitySummary(program)}</dd></div>
        </dl>
        <p className={`text-xs flex items-center gap-1.5 ${freshness.verified ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-500'}`}>
          {freshness.verified ? <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> : <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />}
          {freshness.text}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-auto">
          <Link
            to={`/funding/${program.slug}`}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            View details
          </Link>
          <OfficialLinkButton program={program} />
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
