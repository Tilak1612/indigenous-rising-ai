import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';

const CanadianComplianceBadge = () => {
  const compliances = ['PIPEDA', 'AODA', 'CASL', 'Data Residency'];

  return (
    <Card id="compliance" className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="w-4 h-4 text-primary" />
          Canadian Compliance Certified
        </div>
        <p className="text-sm text-muted-foreground">
          Canadian Compliance Certified (PIPEDA, CASL, data stored in Canada).
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {compliances.map((compliance) => (
          <span
            key={compliance}
            className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-foreground"
          >
            {compliance}
          </span>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a href="/compliance" className="text-sm font-semibold text-primary hover:underline">
          Learn more about compliance
        </a>
      </div>
    </Card>
  );
};

export default CanadianComplianceBadge;
