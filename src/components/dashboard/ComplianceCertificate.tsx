import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Award, 
  Download, 
  Shield, 
  Calendar,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComplianceCertificateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: number;
  businessName?: string;
  completedRequirements: number;
  totalRequirements: number;
}

export default function ComplianceCertificate({
  open,
  onOpenChange,
  score,
  businessName = 'Your Business',
  completedRequirements,
  totalRequirements
}: ComplianceCertificateProps) {
  const isEligible = score >= 100;
  const today = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownload = () => {
    // Create a simple text certificate for now
    const certificateText = `
═══════════════════════════════════════════════════════════════
                    OCAP™ COMPLIANCE CERTIFICATE
═══════════════════════════════════════════════════════════════

This certifies that

                         ${businessName}

has demonstrated commitment to the First Nations principles of
Ownership, Control, Access, and Possession (OCAP™) in their
data governance practices.

Compliance Score: ${score}%
Requirements Completed: ${completedRequirements} of ${totalRequirements}
Date Issued: ${today}

This certificate recognizes adherence to Indigenous data 
sovereignty principles as established by the First Nations 
Information Governance Centre (FNIGC).

═══════════════════════════════════════════════════════════════
                    Indigenous Rising AI
               Supporting Indigenous Entrepreneurs
═══════════════════════════════════════════════════════════════
    `;

    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OCAP-Compliance-Certificate-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Award className={cn(
              "h-6 w-6",
              isEligible ? "text-amber-500" : "text-muted-foreground"
            )} />
            <DialogTitle>OCAP™ Compliance Certificate</DialogTitle>
          </div>
          <DialogDescription>
            {isEligible 
              ? "Congratulations! You're eligible for your compliance certificate."
              : "Complete all OCAP™ requirements to earn your certificate."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {isEligible ? (
            <>
              {/* Certificate Preview */}
              <div className="p-6 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-amber-500/5">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Award className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">This certifies that</p>
                    <h3 className="text-xl font-bold mt-1">{businessName}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    has demonstrated commitment to First Nations principles of
                    Ownership, Control, Access, and Possession (OCAP™)
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {score}% Compliant
                    </Badge>
                  </div>

                  <div className="pt-4 border-t flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {today}
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Indigenous Rising AI
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleDownload} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Use this certificate in grant applications to demonstrate your commitment to Indigenous data sovereignty.
              </p>
            </>
          ) : (
            <>
              {/* Not Eligible State */}
              <div className="p-6 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/30">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Award className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Not Yet Eligible</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Complete all OCAP™ requirements to earn your certificate
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary">
                      {completedRequirements} of {totalRequirements} complete
                    </Badge>
                    <Badge variant="outline">{score}%</Badge>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Continue Working on Requirements
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
