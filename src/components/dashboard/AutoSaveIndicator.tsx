import React from 'react';
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface AutoSaveIndicatorProps {
  lastSaved: Date | null;
  isSaving: boolean;
  hasError?: boolean;
  className?: string;
}

export function AutoSaveIndicator({ 
  lastSaved, 
  isSaving, 
  hasError = false,
  className 
}: AutoSaveIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isSaving ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Saving...</span>
        </>
      ) : hasError ? (
        <>
          <CloudOff className="h-4 w-4 text-destructive" />
          <span className="text-destructive">Save failed</span>
        </>
      ) : lastSaved ? (
        <>
          <Cloud className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">
            Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
          </span>
        </>
      ) : (
        <>
          <Cloud className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Not saved yet</span>
        </>
      )}
    </div>
  );
}
