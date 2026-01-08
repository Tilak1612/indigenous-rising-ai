import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Shield, Lock, Key, AlertTriangle, CheckCircle2, Clock, Globe, Smartphone } from 'lucide-react';

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
}

const securitySettings: SecuritySetting[] = [
  {
    id: 'mfa',
    title: 'Two-Factor Authentication',
    description: 'Add an extra layer of security to your account',
    enabled: true,
    icon: Smartphone,
  },
  {
    id: 'session',
    title: 'Session Timeout',
    description: 'Automatically log out after 30 minutes of inactivity',
    enabled: true,
    icon: Clock,
  },
  {
    id: 'ip',
    title: 'IP Allowlisting',
    description: 'Restrict access to specific IP addresses',
    enabled: false,
    icon: Globe,
  },
  {
    id: 'audit',
    title: 'Audit Logging',
    description: 'Track all account activities and changes',
    enabled: true,
    icon: Shield,
  },
];

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'warning' | 'error';
}

const auditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'Login successful',
    user: 'sarah@company.com',
    timestamp: '2024-01-20 14:32:00',
    ip: '192.168.1.1',
    status: 'success',
  },
  {
    id: '2',
    action: 'API key created',
    user: 'michael@company.com',
    timestamp: '2024-01-20 13:15:00',
    ip: '192.168.1.2',
    status: 'success',
  },
  {
    id: '3',
    action: 'Failed login attempt',
    user: 'unknown@example.com',
    timestamp: '2024-01-20 12:45:00',
    ip: '45.33.22.11',
    status: 'warning',
  },
  {
    id: '4',
    action: 'Permission changed',
    user: 'sarah@company.com',
    timestamp: '2024-01-20 11:00:00',
    ip: '192.168.1.1',
    status: 'success',
  },
];

const statusIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const statusColors = {
  success: 'text-green-500',
  warning: 'text-amber-500',
  error: 'text-red-500',
};

export default function Security() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account security and monitor activity
          </p>
        </div>

        {/* Security Score */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Security Score: 85%</h3>
                  <p className="text-muted-foreground">Your account is well protected</p>
                </div>
              </div>
              <Badge className="bg-green-500">Strong</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure your account security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {securitySettings.map(setting => (
              <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                    <setting.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{setting.title}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                </div>
                <Switch defaultChecked={setting.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Password & Keys */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Last changed 30 days ago
              </p>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Recovery Codes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                8 of 10 recovery codes remaining
              </p>
              <Button variant="outline" className="w-full">
                View Recovery Codes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Monitor security-related events on your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.map(log => {
                const StatusIcon = statusIcons[log.status];
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${statusColors[log.status]}`} />
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user} • {log.ip}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
