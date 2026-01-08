import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { User, Mail, Phone, MapPin, Building2, Globe, Camera, Save } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { subscribed, product_id } = useSubscription();

  const tierLabel = product_id?.toLowerCase().includes('enterprise') ? 'Gimishoomis (Enterprise)' :
                    subscribed ? 'Ogichidaakwe (Pro)' : 'Maadaadiziwin (Free)';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="outline" className="absolute bottom-0 right-0 h-8 w-8 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-semibold text-lg mt-4">{user?.email?.split('@')[0] || 'User'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-2">{tierLabel}</Badge>

              <div className="mt-6 pt-6 border-t space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Not provided</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Not provided</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Profile Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="Enter first name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Enter last name" className="mt-1" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email || ''} disabled className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="Enter phone number" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input placeholder="City, Province/Territory" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea 
                  placeholder="Tell us about yourself and your business..."
                  className="mt-1 min-h-24"
                />
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Information about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Business Name</label>
                <Input placeholder="Enter business name" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Industry</label>
                <Input placeholder="e.g., Technology, Tourism, Arts" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Business Website</label>
                <div className="relative mt-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="https://yourbusiness.com" className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Year Founded</label>
                <Input type="number" placeholder="2024" className="mt-1" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Business Description</label>
              <Textarea 
                placeholder="Describe your business, products, or services..."
                className="mt-1 min-h-24"
              />
            </div>

            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Business Info
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
