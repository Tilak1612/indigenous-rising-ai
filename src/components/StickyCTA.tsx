import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero section (roughly 100vh)
      const scrollPosition = window.scrollY;
      const shouldShow = scrollPosition > window.innerHeight && !isDismissed;
      setIsVisible(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-40 animate-fade-in-up',
        'transform transition-all duration-300'
      )}
    >
      <div className="bg-primary text-primary-foreground rounded-2xl shadow-elevated p-4 pr-12 relative max-w-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="space-y-3">
          <p className="font-bold text-sm">
            Ready to transform your Indigenous business?
          </p>
          <Button
            size="sm"
            variant="outline"
            className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 border-none"
            onClick={() => {
              const element = document.querySelector('#pricing');
              element?.scrollIntoView({ behavior: 'smooth' });
              handleDismiss();
            }}
          >
            Start Free Today
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StickyCTA;
