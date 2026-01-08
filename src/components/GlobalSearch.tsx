import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Target, MessageSquare, BookOpen, Users, Video, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'funding' | 'resource' | 'forum';
  type?: string;
  href: string;
}

// Mock data - in production this would come from an API/database
const searchableData: SearchResult[] = [
  // Funding opportunities
  {
    id: 'f1',
    title: 'Indigenous Business Development Program',
    description: 'Up to $99,999 for Indigenous entrepreneurs',
    category: 'funding',
    type: 'Grant',
    href: '/dashboard/funding',
  },
  {
    id: 'f2',
    title: 'Aboriginal Entrepreneurship Program',
    description: 'Support for startup and expansion of Indigenous businesses',
    category: 'funding',
    type: 'Grant',
    href: '/dashboard/funding',
  },
  {
    id: 'f3',
    title: 'Indigenous Growth Fund',
    description: 'Patient capital for Indigenous businesses across Canada',
    category: 'funding',
    type: 'Investment',
    href: '/dashboard/funding',
  },
  {
    id: 'f4',
    title: 'Indigenous Tourism Association Grants',
    description: 'Funding for Indigenous tourism businesses',
    category: 'funding',
    type: 'Grant',
    href: '/dashboard/funding',
  },
  // Resources
  {
    id: 'r1',
    title: 'Starting an Indigenous Business',
    description: 'Comprehensive guide to launching your first business with cultural considerations',
    category: 'resource',
    type: 'Guide',
    href: '/dashboard/resources',
  },
  {
    id: 'r2',
    title: 'OCAP™ Principles Overview',
    description: 'Understanding Ownership, Control, Access, and Possession principles',
    category: 'resource',
    type: 'Article',
    href: '/dashboard/resources',
  },
  {
    id: 'r3',
    title: 'Business Plan Template - Indigenous Focus',
    description: 'Pre-formatted template with community impact sections',
    category: 'resource',
    type: 'Template',
    href: '/dashboard/resources',
  },
  {
    id: 'r4',
    title: 'Financial Projections Spreadsheet',
    description: 'Excel template for revenue forecasting and budgeting',
    category: 'resource',
    type: 'Template',
    href: '/dashboard/resources',
  },
  {
    id: 'r5',
    title: 'Traditional Knowledge in Business',
    description: 'How to incorporate traditional knowledge while protecting IP',
    category: 'resource',
    type: 'Video',
    href: '/dashboard/resources',
  },
  // Forum posts
  {
    id: 'p1',
    title: 'Tips for First-Time Grant Applications',
    description: 'I recently received my first grant and wanted to share some tips...',
    category: 'forum',
    type: 'Discussion',
    href: '/dashboard/forum',
  },
  {
    id: 'p2',
    title: 'How to Balance Traditional Knowledge with Modern Business',
    description: 'Starting a business while honoring our traditions can be challenging...',
    category: 'forum',
    type: 'Discussion',
    href: '/dashboard/forum',
  },
  {
    id: 'p3',
    title: 'Looking for Mentorship in E-commerce',
    description: 'I am launching an online store for Indigenous crafts...',
    category: 'forum',
    type: 'Question',
    href: '/dashboard/forum',
  },
  {
    id: 'p4',
    title: 'Success Story: From Idea to $100K Revenue',
    description: 'Three years ago I started with just an idea...',
    category: 'forum',
    type: 'Success Story',
    href: '/dashboard/forum',
  },
  {
    id: 'p5',
    title: 'OCAP™ Compliance Questions',
    description: 'Can someone explain how OCAP principles apply to customer data?',
    category: 'forum',
    type: 'Question',
    href: '/dashboard/forum',
  },
];

const categoryConfig = {
  funding: {
    icon: Target,
    label: 'Funding',
    color: 'bg-green-500/10 text-green-600',
  },
  resource: {
    icon: BookOpen,
    label: 'Resource',
    color: 'bg-blue-500/10 text-blue-600',
  },
  forum: {
    icon: MessageSquare,
    label: 'Forum',
    color: 'bg-purple-500/10 text-purple-600',
  },
};

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = searchableData.filter(
      item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.type?.toLowerCase().includes(searchTerm)
    );
    setResults(filtered.slice(0, 8)); // Limit to 8 results
    setSelectedIndex(0);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search funding, resources, forum..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="h-9 w-64 lg:w-80 pl-9 pr-8 text-sm"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2 text-xs text-muted-foreground border-b border-border">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
          <div className="max-h-80 overflow-y-auto">
            {results.map((result, index) => {
              const config = categoryConfig[result.category];
              const Icon = config.icon;
              
              return (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    "w-full p-3 flex items-start gap-3 text-left hover:bg-muted/50 transition-colors",
                    selectedIndex === index && "bg-muted/50"
                  )}
                >
                  <div className={cn("h-8 w-8 rounded-md flex items-center justify-center shrink-0", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{result.title}</span>
                      {result.type && (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {result.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {result.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-2 border-t border-border text-xs text-muted-foreground flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd>
            <span>to navigate</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-2">↵</kbd>
            <span>to select</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] ml-2">esc</kbd>
            <span>to close</span>
          </div>
        </div>
      )}

      {/* No results state */}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">
            No results found for "{query}"
          </p>
        </div>
      )}
    </div>
  );
}
