import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Building2, Mail, ExternalLink, Users, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Partner {
  id: string;
  name: string;
  organization: string;
  location: string;
  industry: string;
  expertise: string[];
  bio: string;
  email: string;
  website?: string;
}

const partners: Partner[] = [
  {
    id: '1',
    name: 'Sarah Whitehorse',
    organization: 'Northern Ventures Inc.',
    location: 'Yellowknife, NT',
    industry: 'Technology',
    expertise: ['Software Development', 'AI/ML', 'Data Analytics'],
    bio: 'Helping Indigenous businesses leverage technology for growth.',
    email: 'sarah@northernventures.ca',
    website: 'https://northernventures.ca',
  },
  {
    id: '2',
    name: 'Michael Bearfoot',
    organization: 'Eagle Eye Consulting',
    location: 'Vancouver, BC',
    industry: 'Consulting',
    expertise: ['Business Strategy', 'Market Analysis', 'Funding'],
    bio: 'Strategic advisor with 15+ years supporting Indigenous enterprises.',
    email: 'michael@eagleeye.ca',
  },
  {
    id: '3',
    name: 'Lisa Crow',
    organization: 'Heritage Crafts Co-op',
    location: 'Winnipeg, MB',
    industry: 'Arts & Crafts',
    expertise: ['Artisan Products', 'E-commerce', 'Export'],
    bio: 'Connecting traditional artisans with global markets.',
    email: 'lisa@heritagecrafts.ca',
    website: 'https://heritagecrafts.ca',
  },
  {
    id: '4',
    name: 'David Moose',
    organization: 'First Nations Finance',
    location: 'Toronto, ON',
    industry: 'Finance',
    expertise: ['Investment', 'Grants', 'Financial Planning'],
    bio: 'Specialized in Indigenous business financing and grants.',
    email: 'david@fnfinance.ca',
  },
  {
    id: '5',
    name: 'Jennifer Raven',
    organization: 'Turtle Island Tourism',
    location: 'Ottawa, ON',
    industry: 'Tourism',
    expertise: ['Eco-tourism', 'Cultural Experiences', 'Hospitality'],
    bio: 'Creating authentic Indigenous tourism experiences.',
    email: 'jennifer@turtleisland.ca',
    website: 'https://turtleislandtourism.ca',
  },
  {
    id: '6',
    name: 'Robert Thunder',
    organization: 'Green Earth Construction',
    location: 'Calgary, AB',
    industry: 'Construction',
    expertise: ['Sustainable Building', 'Project Management', 'Infrastructure'],
    bio: 'Building sustainable infrastructure for Indigenous communities.',
    email: 'robert@greenearthcon.ca',
  },
];

const industries = ['All', 'Technology', 'Consulting', 'Arts & Crafts', 'Finance', 'Tourism', 'Construction'];

export default function Network() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.expertise.some(e => e.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = selectedIndustry === 'All' || partner.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Partner Network</h1>
          <p className="text-muted-foreground mt-1">
            Connect with Indigenous business leaders and potential partners
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{partners.length}</p>
                <p className="text-sm text-muted-foreground">Active Partners</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{industries.length - 1}</p>
                <p className="text-sm text-muted-foreground">Industries</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-sm text-muted-foreground">Provinces/Territories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners by name, organization, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map(partner => (
            <Card key={partner.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {partner.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{partner.name}</CardTitle>
                    <CardDescription className="truncate">{partner.organization}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{partner.location}</span>
                </div>
                <Badge variant="secondary">{partner.industry}</Badge>
                <p className="text-sm line-clamp-2">{partner.bio}</p>
                <div className="flex flex-wrap gap-1">
                  {partner.expertise.map(exp => (
                    <Badge key={exp} variant="outline" className="text-xs">
                      {exp}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  {partner.website && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={partner.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No partners found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
