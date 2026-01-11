import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, RotateCcw, Eye } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface Version {
  id: string;
  timestamp: Date;
  summary: string;
  data: Record<string, string>;
}

interface VersionHistoryProps {
  versions: Version[];
  onRestore: (version: Version) => void;
  onPreview: (version: Version) => void;
}

export function VersionHistory({ versions, onRestore, onPreview }: VersionHistoryProps) {
  const [open, setOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          View {versions.length} previous versions
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of your business plan
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-3">
            {versions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No previous versions yet. Your plan will be automatically versioned as you save.
              </p>
            ) : (
              versions.map((version, index) => (
                <div 
                  key={version.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {format(version.timestamp, 'MMM d, yyyy h:mm a')}
                      </span>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">Latest</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {version.summary}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onPreview(version)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        onRestore(version);
                        setOpen(false);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
