import React, { useState, useEffect, useRef } from 'react';
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  HelpCircle,
  Clock,
  ArrowRight,
  Command as CommandIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resource' | 'forum' | 'plan' | 'help';
  url: string;
}

const typeIcons = {
  resource: BookOpen,
  forum: MessageSquare,
  plan: FileText,
  help: HelpCircle,
};

const typeLabels = {
  resource: 'Resource',
  forum: 'Forum',
  plan: 'Business Plan',
  help: 'Help',
};

// Mock search results
const mockResults: SearchResult[] = [
  { id: '1', title: 'Starting an Indigenous Business', description: 'Comprehensive guide to launching your first business', type: 'resource', url: '/dashboard/resources' },
  { id: '2', title: 'Tips for First-Time Grant Applications', description: 'Community discussion about grant applications', type: 'forum', url: '/dashboard/forum' },
  { id: '3', title: 'Business Plan Template', description: 'Indigenous-focused business plan template', type: 'resource', url: '/dashboard/resources' },
  { id: '4', title: 'OCAP® Principles Overview', description: 'Understanding data sovereignty principles', type: 'resource', url: '/dashboard/resources' },
  { id: '5', title: 'Vision & Mission Section', description: 'Your business plan draft', type: 'plan', url: '/dashboard/plan' },
  { id: '6', title: 'How to use the funding navigator', description: 'Help article about finding funding', type: 'help', url: '/faq' },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'funding opportunities',
    'OCAP compliance',
    'business plan template',
  ]);
  const navigate = useNavigate();

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const filteredResults = query.length > 0 
    ? mockResults.filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => {
      const updated = [result.title, ...prev.filter(s => s !== result.title)].slice(0, 5);
      return updated;
    });
    navigate(result.url);
    setOpen(false);
    setQuery('');
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64 bg-white/10 border-white/20 hover:bg-white/20 text-white/80"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex text-muted-foreground">
          <CommandIcon className="h-3 w-3" />K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Search resources, forum, help docs..." 
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {query.length === 0 && recentSearches.length > 0 && (
            <CommandGroup heading="Recent Searches">
              {recentSearches.map((search, idx) => (
                <CommandItem
                  key={idx}
                  onSelect={() => handleRecentSearch(search)}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.length > 0 && filteredResults.length > 0 && (
            <>
              {['resource', 'forum', 'plan', 'help'].map(type => {
                const typeResults = filteredResults.filter(r => r.type === type);
                if (typeResults.length === 0) return null;
                
                return (
                  <CommandGroup key={type} heading={`${typeLabels[type as keyof typeof typeLabels]}s`}>
                    {typeResults.map(result => {
                      const Icon = typeIcons[result.type];
                      return (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                            <div>
                              <span>{result.title}</span>
                              <p className="text-xs text-muted-foreground">{result.description}</p>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => { navigate('/dashboard/plan'); setOpen(false); }}>
              <FileText className="mr-2 h-4 w-4" />
              Create Business Plan
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/funding'); setOpen(false); }}>
              <Search className="mr-2 h-4 w-4" />
              Browse Funding
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/forum'); setOpen(false); }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Ask Community
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
