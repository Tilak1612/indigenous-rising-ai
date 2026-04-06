import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Camera,
  Save,
  Loader2,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  phone: z.string().optional(),
  location: z.string().optional(),
  territory: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

const businessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100, 'Name too long'),
  industry: z.string().min(1, 'Industry is required'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  yearFounded: z.string().optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  employees: z.string().optional(),
});

const territories = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
];

const industries = [
  'Agriculture & Forestry',
  'Arts & Crafts',
  'Construction',
  'Consulting',
  'Education',
  'Energy & Mining',
  'Finance & Insurance',
  'Food & Beverage',
  'Healthcare',
  'Hospitality & Tourism',
  'Information Technology',
  'Manufacturing',
  'Professional Services',
  'Real Estate',
  'Retail',
  'Transportation',
  'Other',
];

export default function Profile() {
  const { user } = useAuth();
  const { subscribed, product_id } = useSubscription();
  
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({});
  
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    territory: '',
    bio: '',
  });
  
  const [businessData, setBusinessData] = useState({
    businessName: '',
    industry: '',
    website: '',
    yearFounded: '',
    description: '',
    employees: '',
  });
  
  const [socialLinks, setSocialLinks] = useState({
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: '',
  });

  const tierLabel = product_id?.toLowerCase().includes('enterprise') ? 'Gimishoomis (Enterprise)' :
                    subscribed ? 'Ogichidaakwe (Pro)' : 'Maadaadiziwin (Free)';

  // Load existing profile from Supabase on mount
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('full_name, phone, location, territory, bio, business_name, industry, website, year_founded, business_description, employees, social_links')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data) return;
        const parts = (data.full_name || '').split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ');
        setProfileData({
          firstName,
          lastName,
          phone: data.phone || '',
          location: data.location || '',
          territory: data.territory || '',
          bio: data.bio || '',
        });
        setBusinessData({
          businessName: data.business_name || '',
          industry: data.industry || '',
          website: data.website || '',
          yearFounded: data.year_founded || '',
          description: data.business_description || '',
          employees: data.employees || '',
        });
        const sl = (data.social_links as Record<string, string>) || {};
        setSocialLinks({
          twitter: sl.twitter || '',
          linkedin: sl.linkedin || '',
          facebook: sl.facebook || '',
          instagram: sl.instagram || '',
        });
      });
  }, [user]);

  const handleSaveProfile = async () => {
    setProfileErrors({});
    try {
      profileSchema.parse(profileData);
      setSavingProfile(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          phone: profileData.phone || null,
          location: profileData.location || null,
          territory: profileData.territory || null,
          bio: profileData.bio || null,
        })
        .eq('id', user!.id);
      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setProfileErrors(errors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveBusiness = async () => {
    setBusinessErrors({});
    try {
      businessSchema.parse(businessData);
      setSavingBusiness(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: businessData.businessName || null,
          industry: businessData.industry || null,
          website: businessData.website || null,
          year_founded: businessData.yearFounded || null,
          business_description: businessData.description || null,
          employees: businessData.employees || null,
        })
        .eq('id', user!.id);
      if (error) throw error;
      toast.success('Business information updated');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setBusinessErrors(errors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to update business information');
      }
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleSaveSocial = async () => {
    setSavingSocial(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ social_links: socialLinks })
        .eq('id', user!.id);
      if (error) throw error;
      toast.success('Social links updated');
    } catch {
      toast.error('Failed to update social links');
    } finally {
      setSavingSocial(false);
    }
  };

  const handleAvatarUpload = () => {
    toast.info('Avatar upload coming soon');
  };

  const displayName = profileData.firstName && profileData.lastName 
    ? `${profileData.firstName} ${profileData.lastName}`
    : user?.email?.split('@')[0] || 'User';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal and business information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                  onClick={handleAvatarUpload}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-lg mt-4">{displayName}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2">{tierLabel}</Badge>

              <div className="mt-6 pt-6 border-t space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className={!profileData.phone ? 'text-muted-foreground' : ''}>
                    {profileData.phone || 'Not provided'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className={!profileData.location ? 'text-muted-foreground' : ''}>
                    {profileData.location || 'Not provided'}
                  </span>
                </div>
                {businessData.businessName && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{businessData.businessName}</span>
                  </div>
                )}
              </div>

              {/* Completion Status */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium mb-2">Profile Completion</p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ 
                      width: `${Math.min(100, [
                        profileData.firstName, 
                        profileData.lastName, 
                        profileData.phone, 
                        profileData.bio,
                        businessData.businessName,
                        businessData.industry,
                      ].filter(Boolean).length * 16)}%` 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete your profile to improve visibility
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name *</label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Enter first name"
                      className="mt-1"
                    />
                    {profileErrors.firstName && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {profileErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name *</label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Enter last name"
                      className="mt-1"
                    />
                    {profileErrors.lastName && (
                      <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {profileErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ''} disabled className="mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 555-5555"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">City/Community</label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Thunder Bay"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Province/Territory</label>
                    <Select 
                      value={profileData.territory} 
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, territory: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select province/territory" />
                      </SelectTrigger>
                      <SelectContent>
                        {territories.map(territory => (
                          <SelectItem key={territory} value={territory}>{territory}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself and your journey..."
                    className="mt-1 min-h-24"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {profileData.bio.length}/500 characters
                  </p>
                </div>

                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Details about your business or organization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Business Name *</label>
                    <Input
                      value={businessData.businessName}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Enter business name"
                      className="mt-1"
                    />
                    {businessErrors.businessName && (
                      <p className="text-xs text-destructive mt-1">{businessErrors.businessName}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Industry *</label>
                    <Select 
                      value={businessData.industry} 
                      onValueChange={(value) => setBusinessData(prev => ({ ...prev, industry: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {businessErrors.industry && (
                      <p className="text-xs text-destructive mt-1">{businessErrors.industry}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <div className="relative mt-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={businessData.website}
                        onChange={(e) => setBusinessData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourbusiness.com"
                        className="pl-10"
                      />
                    </div>
                    {businessErrors.website && (
                      <p className="text-xs text-destructive mt-1">{businessErrors.website}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium">Year Founded</label>
                    <Input
                      type="number"
                      value={businessData.yearFounded}
                      onChange={(e) => setBusinessData(prev => ({ ...prev, yearFounded: e.target.value }))}
                      placeholder="2024"
                      className="mt-1"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Number of Employees</label>
                  <Select 
                    value={businessData.employees} 
                    onValueChange={(value) => setBusinessData(prev => ({ ...prev, employees: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Just me</SelectItem>
                      <SelectItem value="2-5">2-5 employees</SelectItem>
                      <SelectItem value="6-10">6-10 employees</SelectItem>
                      <SelectItem value="11-25">11-25 employees</SelectItem>
                      <SelectItem value="26-50">26-50 employees</SelectItem>
                      <SelectItem value="51+">51+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Business Description</label>
                  <Textarea
                    value={businessData.description}
                    onChange={(e) => setBusinessData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your business, products, or services..."
                    className="mt-1 min-h-24"
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {businessData.description.length}/1000 characters
                  </p>
                </div>

                <Button onClick={handleSaveBusiness} disabled={savingBusiness}>
                  {savingBusiness ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Business Info
                </Button>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>
                  Connect your social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Twitter className="h-4 w-4" /> Twitter
                    </label>
                    <Input
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                      placeholder="@username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Linkedin className="h-4 w-4" /> LinkedIn
                    </label>
                    <Input
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="linkedin.com/in/username"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Facebook className="h-4 w-4" /> Facebook
                    </label>
                    <Input
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: e.target.value }))}
                      placeholder="facebook.com/page"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Instagram className="h-4 w-4" /> Instagram
                    </label>
                    <Input
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                      placeholder="@username"
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSocial} disabled={savingSocial}>
                  {savingSocial ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Social Links
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
