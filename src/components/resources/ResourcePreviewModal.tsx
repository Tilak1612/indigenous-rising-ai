import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Download, ExternalLink, Clock, FileText } from 'lucide-react';

interface ResourcePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: {
    id: string;
    title: string;
    description: string;
    category: string;
    type: string;
    rating: number;
    downloads?: number;
    duration?: string;
  } | null;
}

const previewContent: Record<string, string> = {
  '1': `# Starting an Indigenous Business

## Introduction
This comprehensive guide is designed specifically for Indigenous entrepreneurs who are taking their first steps into business ownership. Drawing from both traditional knowledge and modern business practices, this guide provides a culturally grounded approach to entrepreneurship.

## Chapter 1: Finding Your Path
Before starting any business, it's important to understand your motivations and align them with your community values. Consider:
- What skills and knowledge do you bring?
- How does your business idea serve your community?
- What traditional practices can inform your approach?

## Chapter 2: Business Fundamentals
Learn the essential elements of business planning, including:
- Market research and customer identification
- Financial planning and budgeting
- Legal requirements and registration...`,

  '2': `# OCAP® Principles Overview

## What is OCAP®?
OCAP® stands for Ownership, Control, Access, and Possession. These are principles developed by the First Nations Information Governance Centre to guide how Indigenous communities manage their own information and data.

## The Four Pillars

### Ownership
Indigenous communities collectively own their cultural knowledge, data, and information. This includes traditional knowledge, research data, and any information about the community.

### Control
Communities have the right to control all aspects of data management and research processes that impact them...`,

  '3': `# Business Plan Template - Indigenous Focus

## Executive Summary
[Your business name and brief description]

## Vision & Mission
What is your purpose? How does it connect to your culture and community?

## Community Impact Section
This unique section addresses how your business will:
- Create employment opportunities for community members
- Preserve and promote cultural practices
- Support local economic development
- Maintain environmental sustainability...`,
};

export function ResourcePreviewModal({ open, onOpenChange, resource }: ResourcePreviewModalProps) {
  if (!resource) return null;

  const preview = previewContent[resource.id] || 'Preview not available for this resource.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{resource.type}</Badge>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span>{resource.rating}</span>
            </div>
            {resource.downloads && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Download className="h-3 w-3" />
                {resource.downloads.toLocaleString()}
              </span>
            )}
            {resource.duration && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {resource.duration}
              </span>
            )}
          </div>
          <DialogTitle>{resource.title}</DialogTitle>
          <DialogDescription>{resource.description}</DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 p-4 bg-muted/50 rounded-lg overflow-y-auto max-h-[300px]">
          <div className="prose prose-sm dark:prose-invert">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {preview}
            </pre>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download Full Resource
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
