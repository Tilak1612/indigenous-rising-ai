import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextToolbarProps {
  onFormat: (command: string) => void;
  className?: string;
}

export function RichTextToolbar({ onFormat, className }: RichTextToolbarProps) {
  const tools = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
  ];

  const listTools = [
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
  ];

  const alignTools = [
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
  ];

  const historyTools = [
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
  ];

  return (
    <div className={cn("flex items-center gap-1 p-2 border rounded-t-lg bg-muted/30", className)}>
      {tools.map((tool) => (
        <Button
          key={tool.command}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFormat(tool.command)}
          title={tool.title}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {listTools.map((tool) => (
        <Button
          key={tool.command}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFormat(tool.command)}
          title={tool.title}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {alignTools.map((tool) => (
        <Button
          key={tool.command}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFormat(tool.command)}
          title={tool.title}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {historyTools.map((tool) => (
        <Button
          key={tool.command}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => onFormat(tool.command)}
          title={tool.title}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
