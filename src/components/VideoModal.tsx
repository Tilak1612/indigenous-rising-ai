import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface VideoModalProps {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'hero' | 'ghost';
  triggerSize?: 'default' | 'sm' | 'lg';
  triggerClassName?: string;
}

const VideoModal = ({ 
  triggerText = 'Watch Video', 
  triggerVariant = 'outline',
  triggerSize = 'lg',
  triggerClassName = ''
}: VideoModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={triggerVariant} 
          size={triggerSize}
          className={`gap-2 ${triggerClassName}`}
        >
          <Play className="w-5 h-5" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full bg-background">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Indigenous Rising AI Platform Overview
          </DialogTitle>
          <DialogDescription>
            See how our platform empowers Indigenous entrepreneurs
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
          {/* Placeholder for actual video */}
          <div className="text-center space-y-4">
            <Play className="w-16 h-16 mx-auto text-primary" />
            <p className="text-muted-foreground">
              Video coming soon: Platform demonstration
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Our comprehensive platform walkthrough will show you how to navigate funding opportunities, 
              track community impact, and access training programs—all while maintaining data sovereignty.
            </p>
          </div>
          {/* Replace with actual video embed when available:
          <iframe
            src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
            title="Indigenous Rising AI Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
          */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
