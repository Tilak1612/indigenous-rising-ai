import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Key, Copy, Eye, EyeOff, RefreshCw, Trash2, Plus, ExternalLink, Code } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'ir_live_sk_1a2b3c4d5e6f7g8h9i0j',
    created: '2024-01-15',
    lastUsed: '2024-01-20',
    permissions: ['read', 'write'],
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'ir_test_sk_9z8y7x6w5v4u3t2s1r0q',
    created: '2024-01-10',
    lastUsed: '2024-01-19',
    permissions: ['read'],
  },
];

export default function ApiAccess() {
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('API key copied to clipboard');
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + '•'.repeat(16);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Access</h1>
            <p className="text-muted-foreground mt-1">
              Manage your API keys and integrations
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Key
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-muted-foreground">API Calls Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys List */}
        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Use these keys to authenticate API requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeys.map(apiKey => (
              <div key={apiKey.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{apiKey.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      Created {apiKey.created} • Last used {apiKey.lastUsed}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {apiKey.permissions.map(perm => (
                      <Badge key={perm} variant="secondary" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                  >
                    {showKeys[apiKey.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiKey.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to integrate with our API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-mono text-sm mb-2">Quick Start</h4>
              <pre className="text-xs overflow-x-auto">
{`curl -X GET https://api.indigenousrising.ai/v1/funding \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Documentation
              </Button>
              <Button variant="outline" className="justify-start">
                <Code className="h-4 w-4 mr-2" />
                API Reference
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
