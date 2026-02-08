import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Shield, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  triggerText?: string;
  triggerSize?: 'sm' | 'default' | 'lg';
  details?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ triggerText = 'Upgrade to access', triggerSize = 'default', details }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <ShinyButton size={triggerSize} onClick={() => setOpen(true)}>
          {triggerText}
        </ShinyButton>
      </DialogTrigger>
      <DialogContent className="max-w-lg w-full bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Upgrade to Ogichidaakwe</DialogTitle>
          <DialogDescription>
            Unlock premium features including AI-powered funding matching, advanced analytics, and priority support.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary">Ogichidaakwe</Badge>
            <div className="text-sm text-muted-foreground">From $49 / month</div>
          </div>

          <p className="text-muted-foreground">{details || 'Access AI funding matches, advanced impact analytics, and priority support.'}</p>

          <div className="mt-4 flex gap-3">
            <ShinyButton asChild>
              <Link to="/pricing">View Plans</Link>
            </ShinyButton>
            <ShinyButton variant="ghost" asChild>
              <Link to="/contact">Contact Sales</Link>
            </ShinyButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
