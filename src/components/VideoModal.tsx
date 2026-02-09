import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Play } from 'lucide-react';

interface VideoModalProps {
  triggerText?: string;
  triggerSize?: 'default' | 'sm' | 'lg';
  triggerClassName?: string;
  videoUrl?: string | null;
}

const VideoModal = ({ 
  triggerText = 'Watch Video', 
  triggerSize = 'lg',
  triggerClassName = '',
  videoUrl = null
}: VideoModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasVideo = Boolean(videoUrl);

  if (!hasVideo) {
    return (
      <ShinyButton
        size={triggerSize}
        className={`gap-2 ${triggerClassName}`}
        disabled
        aria-disabled="true"
      >
        <Play className="w-5 h-5" />
        {triggerText}
      </ShinyButton>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <ShinyButton 
          size={triggerSize}
          className={`gap-2 ${triggerClassName}`}
        >
          <Play className="w-5 h-5" />
          {triggerText}
        </ShinyButton>
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
          <iframe
            src={videoUrl}
            title="Indigenous Rising AI Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoModal;
