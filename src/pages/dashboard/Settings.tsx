import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { readStoredSession } from '@/lib/auth-storage';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Globe, 
  Shield, 
  Download,
  Key,
  Trash2,
  CreditCard,
  LogOut,
  Check,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { z } from 'zod';

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

interface NotificationSettings {
  emailUpdates: boolean;
  fundingAlerts: boolean;
  communityDigest: boolean;
  trainingReminders: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
}

interface PrivacySettings {
  profileVisible: boolean;
  showInDirectory: boolean;
  allowMessages: boolean;
  shareAnalytics: boolean;
}

const languages = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'iu', name: 'Inuktitut', native: 'ᐃᓄᒃᑎᑐᑦ' },
  { code: 'cr', name: 'Cree', native: 'ᓀᐦᐃᔭᐍᐏᐣ' },
  { code: 'oj', name: 'Ojibwe', native: 'Anishinaabemowin' },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { subscribed, product_id, loading: subLoading } = useSubscription();
  
  const [activeSection, setActiveSection] = useState('account');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Password state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailUpdates: true,
    fundingAlerts: true,
    communityDigest: false,
    trainingReminders: true,
    securityAlerts: true,
    marketingEmails: false,
  });
  
  // Privacy settings
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisible: true,
    showInDirectory: true,
    allowMessages: true,
    shareAnalytics: false,
  });

  const tierLabel = product_id?.toLowerCase().includes('enterprise') ? 'Gimishoomis (Enterprise)' :
                    subscribed ? 'Ogichidaakwe (Growth)' : 'Maadaadiziwin (Free)';

  // Upsert preferences via direct PostgREST (not the supabase-js SDK, whose
  // query path can hang on this project). user_id is the PK, so
  // Prefer: resolution=merge-duplicates does a true upsert.
  const upsertPrefs = useCallback(async (patch: Record<string, unknown>): Promise<boolean> => {
    if (!user) return false;
    const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/user_preferences`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ user_id: user.id, updated_at: new Date().toISOString(), ...patch }),
    });
    return res.ok;
  }, [user]);

  // Load saved preferences on mount (direct fetch — reliable).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const token = readStoredSession()?.access_token ?? SUPABASE_ANON_KEY;
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/user_preferences?select=notifications,privacy,language&user_id=eq.${user.id}`,
          { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } }
        );
        if (!res.ok || cancelled) return;
        const rows = (await res.json()) as Array<{ notifications?: NotificationSettings; privacy?: PrivacySettings; language?: string }>;
        const data = rows[0];
        if (!data || cancelled) return;
        if (data.notifications && Object.keys(data.notifications).length > 0) {
          setNotifications(prev => ({ ...prev, ...data.notifications }));
        }
        if (data.privacy && Object.keys(data.privacy).length > 0) {
          setPrivacy(prev => ({ ...prev, ...data.privacy }));
        }
        if (data.language) setSelectedLanguage(data.language);
      } catch {
        /* keep defaults on error */
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handlePasswordChange = async () => {
    setPasswordErrors({});

    try {
      passwordSchema.parse(passwordData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) errors[err.path[0] as string] = err.message;
        });
        setPasswordErrors(errors);
      }
      return;
    }

    setSaving(true);
    try {
      // Re-authenticate with current password to verify identity
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email ?? '',
        password: passwordData.currentPassword,
      });
      if (authError) {
        setPasswordErrors({ currentPassword: 'Current password is incorrect' });
        return;
      }

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      if (updateError) {
        toast.error(updateError.message);
        return;
      }

      toast.success('Password updated successfully');
      // Invalidate all other active sessions — prevents stolen sessions remaining valid
      await supabase.auth.signOut({ scope: 'others' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      if (!(await upsertPrefs({ notifications }))) throw new Error('save failed');
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setSaving(true);
    try {
      if (!(await upsertPrefs({ privacy }))) throw new Error('save failed');
      toast.success('Privacy settings saved');
    } catch {
      toast.error('Failed to save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLanguage = async () => {
    setSaving(true);
    try {
      localStorage.setItem('preferred-language', selectedLanguage);
      if (!(await upsertPrefs({ language: selectedLanguage }))) throw new Error('save failed');
      toast.success(`Language changed to ${languages.find(l => l.code === selectedLanguage)?.name}`);
    } catch {
      toast.error('Failed to save language preference');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const uid = user?.id;
      if (!uid) {
        toast.error('You must be signed in to export data');
        return;
      }

      const [profileResult, subscriptionResult] = await Promise.all([
        supabase.from('profiles').select('id, email, full_name, created_at, updated_at').eq('id', uid).single(),
        supabase.from('subscriptions').select('stripe_product_id, status, current_period_start, current_period_end, cancel_at_period_end, created_at').eq('user_id', uid).maybeSingle(),
      ]);

      const data = {
        exportDate: new Date().toISOString(),
        profile: profileResult.data ?? { email: user?.email },
        subscription: subscriptionResult.data ?? null,
        preferences: {
          notifications,
          privacy,
          language: selectedLanguage,
        },
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'indigenous-rising-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    toast.error('Account deletion requires contacting support');
  };

  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language', icon: Globe },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data Export', icon: Download },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <Card className="lg:col-span-1 h-fit">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {sections.map(section => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Settings */}
            {activeSection === 'account' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Your account details and email address
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="flex gap-2 mt-1">
                        <Input value={user?.email || ''} disabled className="flex-1" />
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            toast.info('Email change verification sent! Check your inbox.');
                          }}
                        >
                          Change Email
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        A verification link will be sent to both your current and new email
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Account ID</label>
                      <Input value={user?.id?.slice(0, 8) + '...' || ''} disabled className="mt-1 font-mono" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your password regularly for security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Current Password</label>
                      <div className="relative mt-1">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-destructive mt-1">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">New Password</label>
                      <div className="relative mt-1">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium">Confirm New Password</label>
                      <Input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirm new password"
                        className="mt-1"
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                    <Button onClick={handlePasswordChange} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
                      Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible account actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Sign out of all devices</p>
                        <p className="text-sm text-muted-foreground">This will log you out everywhere</p>
                      </div>
                      <Button variant="outline" onClick={() => signOut()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your account
                              and remove your data from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to receive updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'emailUpdates', title: 'Email Updates', description: 'Receive important account updates via email' },
                    { key: 'fundingAlerts', title: 'Funding Alerts', description: 'Get notified when new funding opportunities match your profile' },
                    { key: 'communityDigest', title: 'Community Digest', description: 'Weekly digest of community discussions and events' },
                    { key: 'trainingReminders', title: 'Training Reminders', description: 'Reminders for upcoming training sessions and courses' },
                    { key: 'securityAlerts', title: 'Security Alerts', description: 'Important security notifications (recommended)' },
                    { key: 'marketingEmails', title: 'Marketing Emails', description: 'Promotional content and special offers' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={notifications[item.key as keyof NotificationSettings]}
                        onCheckedChange={(checked) => 
                          setNotifications(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                  <Separator />
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Language Settings */}
            {activeSection === 'language' && (
              <Card>
                <CardHeader>
                  <CardTitle>Language & Region</CardTitle>
                  <CardDescription>
                    Select your preferred language for the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium">Display Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.name}</span>
                              <span className="text-muted-foreground">({lang.native})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">
                      Some content may not be available in all languages
                    </p>
                  </div>
                  <Button onClick={handleSaveLanguage} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Save Language
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control how your information is shared
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { key: 'profileVisible', title: 'Public Profile', description: 'Allow others to view your profile' },
                    { key: 'showInDirectory', title: 'Partner Directory', description: 'Show your business in the partner network directory' },
                    { key: 'allowMessages', title: 'Direct Messages', description: 'Allow other members to send you messages' },
                    { key: 'shareAnalytics', title: 'Share Analytics', description: 'Contribute anonymous usage data to improve the platform' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={privacy[item.key as keyof PrivacySettings]}
                        onCheckedChange={(checked) => 
                          setPrivacy(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                  <Separator />
                  <Button onClick={handleSavePrivacy} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                    Save Privacy Settings
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Data Export */}
            {activeSection === 'data' && (
              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>
                    Download a copy of your data in compliance with OCAP® principles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">What's included in your export:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Profile information and settings</li>
                      <li>• Business plan data and documents</li>
                      <li>• Funding applications and history</li>
                      <li>• Community forum posts and comments</li>
                      <li>• Certification progress and achievements</li>
                    </ul>
                  </div>
                  <Button onClick={handleExportData} disabled={exporting}>
                    {exporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Preparing Export...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Your data will be downloaded as a JSON file. This may take a few moments.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Subscription */}
            {activeSection === 'subscription' && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {subLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading subscription details...</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Current Plan</p>
                          <p className="text-sm text-muted-foreground">Your active subscription tier</p>
                        </div>
                        <Badge className={subscribed ? 'bg-primary' : 'bg-muted'}>{tierLabel}</Badge>
                      </div>
                      
                      {!subscribed && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Upgrade to Ogichidaakwe (Growth)</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Get access to AI-powered funding navigator, advanced analytics, partner network, and more.
                          </p>
                          <Button asChild>
                            <a href="/pricing">View Pricing</a>
                          </Button>
                        </div>
                      )}
                      
                      {subscribed && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Billing Period</p>
                              <p className="text-sm text-muted-foreground">Monthly subscription</p>
                            </div>
                            <span className="text-lg font-bold">$49/month</span>
                          </div>
                          <Button variant="outline">Manage Billing</Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
