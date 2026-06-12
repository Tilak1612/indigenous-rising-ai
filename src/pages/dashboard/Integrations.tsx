import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plug, Settings, ExternalLink, CheckCircle2, Circle } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  connected: boolean;
  popular?: boolean;
}

const integrations: Integration[] = [
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync your accounting and financial data',
    category: 'Accounting',
    icon: '📊',
    connected: true,
    popular: true,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications and updates in Slack',
    category: 'Communication',
    icon: '💬',
    connected: true,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync contacts and manage email campaigns',
    category: 'Marketing',
    icon: '📧',
    connected: false,
    popular: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect your CRM data and contacts',
    category: 'CRM',
    icon: '☁️',
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions',
    category: 'Payments',
    icon: '💳',
    connected: true,
    popular: true,
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Track website and app analytics',
    category: 'Analytics',
    icon: '📈',
    connected: false,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing, sales, and service software',
    category: 'CRM',
    icon: '🧲',
    connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps automatically',
    category: 'Automation',
    icon: '⚡',
    connected: true,
  },
];

const categories = ['All', 'Accounting', 'Communication', 'Marketing', 'CRM', 'Payments', 'Analytics', 'Automation'];

export default function Integrations() {
  const connectedCount = integrations.filter(i => i.connected).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">
            Connect your favorite tools and services
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plug className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{integrations.length}</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedCount}</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Custom</p>
                <p className="text-sm text-muted-foreground">Build Your Own</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Connected Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Integrations</CardTitle>
            <CardDescription>
              Manage your active integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {integrations.filter(i => i.connected).map(integration => (
              <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{integration.name}</p>
                      <Badge variant="outline" className="text-success border-success/30">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Switch defaultChecked />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Available Integrations */}
        <Card>
          <CardHeader>
            <CardTitle>Available Integrations</CardTitle>
            <CardDescription>
              Explore and connect new integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.filter(i => !i.connected).map(integration => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{integration.name}</p>
                        {integration.popular && (
                          <Badge variant="secondary">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </div>
                  </div>
                  <Button size="sm">Connect</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Build Custom Integration</CardTitle>
            <CardDescription>
              Need a custom integration? Our team can help build it for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Request Custom Integration
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
