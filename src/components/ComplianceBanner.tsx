import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const ComplianceBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('compliance-accepted');
    if (!accepted) {
      setIsVisible(true);
    } else {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('compliance-accepted', 'true');
    setIsVisible(false);
    setHasAccepted(true);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || hasAccepted) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <Card className="max-w-4xl mx-auto bg-card/98 backdrop-blur-md border-2 border-border shadow-elevated">
        <div className="p-6">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Privacy & Canadian Compliance Notice
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Indigenous Rising AI is committed to protecting your privacy and complying with all Canadian regulations including:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">PIPEDA</strong> - Personal Information Protection and Electronic Documents Act
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">AODA</strong> - Accessibility for Ontarians with Disabilities Act
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">CASL</strong> - Canadian Anti-Spam Legislation
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <strong className="text-foreground">OCAP™</strong> - Indigenous Data Sovereignty Principles
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
                Your data is stored securely in Canada and protected under federal and provincial privacy laws.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  variant="hero"
                  className="flex-1 sm:flex-none"
                >
                  Accept & Continue
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('/privacy', '_blank')}
                  className="flex-1 sm:flex-none"
                >
                  Privacy Policy
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => window.open('/accessibility', '_blank')}
                  className="flex-1 sm:flex-none"
                >
                  Accessibility
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComplianceBanner;
