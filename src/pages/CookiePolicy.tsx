import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import MetaTags from '../components/MetaTags';
import Breadcrumbs from '../components/Breadcrumbs';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Cookie, Shield, Settings, BarChart3, Megaphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CookieInfo {
  name: string;
  provider: string;
  purpose: string;
  expiry: string;
  type: 'Necessary' | 'Functional' | 'Analytics' | 'Marketing';
}

const cookies: CookieInfo[] = [
  // Necessary Cookies
  {
    name: 'sb-access-token',
    provider: 'Lovable Cloud',
    purpose: 'Authentication token for secure user sessions',
    expiry: 'Session',
    type: 'Necessary',
  },
  {
    name: 'sb-refresh-token',
    provider: 'Lovable Cloud',
    purpose: 'Maintains user authentication across sessions',
    expiry: '7 days',
    type: 'Necessary',
  },
  {
    name: 'cookie_consent',
    provider: 'Indigenous Rising AI',
    purpose: 'Stores your cookie consent preferences',
    expiry: '1 year',
    type: 'Necessary',
  },
  {
    name: 'csrf_token',
    provider: 'Indigenous Rising AI',
    purpose: 'Security token to prevent cross-site request forgery',
    expiry: 'Session',
    type: 'Necessary',
  },
  // Functional Cookies
  {
    name: 'accessibility_settings',
    provider: 'Indigenous Rising AI',
    purpose: 'Stores accessibility preferences (high contrast, text size, etc.)',
    expiry: '1 year',
    type: 'Functional',
  },
  {
    name: 'language_preference',
    provider: 'Indigenous Rising AI',
    purpose: 'Remembers your preferred language setting',
    expiry: '1 year',
    type: 'Functional',
  },
  {
    name: 'theme_preference',
    provider: 'Indigenous Rising AI',
    purpose: 'Stores dark/light mode preference',
    expiry: '1 year',
    type: 'Functional',
  },
  // Analytics Cookies
  {
    name: '_ga',
    provider: 'Google Analytics',
    purpose: 'Distinguishes unique users by assigning a randomly generated number',
    expiry: '2 years',
    type: 'Analytics',
  },
  {
    name: '_ga_*',
    provider: 'Google Analytics',
    purpose: 'Maintains session state across page requests',
    expiry: '2 years',
    type: 'Analytics',
  },
  {
    name: '_gid',
    provider: 'Google Analytics',
    purpose: 'Distinguishes users for analytics purposes',
    expiry: '24 hours',
    type: 'Analytics',
  },
  {
    name: '_gat',
    provider: 'Google Analytics',
    purpose: 'Throttles request rate to limit data collection',
    expiry: '1 minute',
    type: 'Analytics',
  },
  // Marketing Cookies
  {
    name: '_fbp',
    provider: 'Facebook',
    purpose: 'Tracks visits across websites for targeted advertising',
    expiry: '3 months',
    type: 'Marketing',
  },
  {
    name: '_gcl_au',
    provider: 'Google Ads',
    purpose: 'Stores conversion tracking information',
    expiry: '3 months',
    type: 'Marketing',
  },
];

const CookiePolicy = () => {
  const getCategoryIcon = (type: CookieInfo['type']) => {
    switch (type) {
      case 'Necessary':
        return <Shield className="h-4 w-4" />;
      case 'Functional':
        return <Settings className="h-4 w-4" />;
      case 'Analytics':
        return <BarChart3 className="h-4 w-4" />;
      case 'Marketing':
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (type: CookieInfo['type']) => {
    switch (type) {
      case 'Necessary':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Functional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Analytics':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Marketing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  const necessaryCookies = cookies.filter(c => c.type === 'Necessary');
  const functionalCookies = cookies.filter(c => c.type === 'Functional');
  const analyticsCookies = cookies.filter(c => c.type === 'Analytics');
  const marketingCookies = cookies.filter(c => c.type === 'Marketing');

  return (
    <div className="min-h-screen bg-background">
      <MetaTags
        title="Cookie Policy | Indigenous Rising AI"
        description="Learn about the cookies we use on Indigenous Rising AI. Detailed information about necessary, functional, analytics, and marketing cookies in compliance with PIPEDA."

      />
      <Navigation />
      <div className="pt-16">
        <Breadcrumbs className="container mx-auto bg-muted border-b" />
      </div>

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Cookie className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            Cookie Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            This policy explains how Indigenous Rising AI uses cookies and similar technologies
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {new Date().toLocaleDateString('en-CA')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* What Are Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              What Are Cookies?
            </h2>
            <p className="text-muted-foreground mb-4">
              Cookies are small text files that are placed on your device when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to 
              website owners. We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Keep you signed in to your account</li>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our platform</li>
              <li>Improve our services based on usage patterns</li>
              <li>Provide relevant content and features</li>
            </ul>
          </Card>

          {/* Cookie Categories Overview */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
              Cookie Categories
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-foreground">Strictly Necessary</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Essential for the website to function. Cannot be disabled. These cookies do not 
                  store personally identifiable information.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-foreground">Functional</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable enhanced functionality and personalization like remembering your preferences. 
                  Require your consent.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-foreground">Analytics</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors interact with our website by collecting anonymous 
                  information. Require your consent.
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-foreground">Marketing</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Used to track visitors across websites to display relevant advertisements. 
                  Require your consent.
                </p>
              </div>
            </div>
          </Card>

          {/* Detailed Cookie Table */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-6">
              Complete Cookie Inventory
            </h2>

            {/* Necessary Cookies */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Strictly Necessary Cookies
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cookie Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {necessaryCookies.map((cookie) => (
                      <TableRow key={cookie.name}>
                        <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                        <TableCell>{cookie.provider}</TableCell>
                        <TableCell className="max-w-xs">{cookie.purpose}</TableCell>
                        <TableCell>{cookie.expiry}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cookie.type)}>
                            {getCategoryIcon(cookie.type)}
                            <span className="ml-1">{cookie.type}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Functional Cookies
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cookie Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {functionalCookies.map((cookie) => (
                      <TableRow key={cookie.name}>
                        <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                        <TableCell>{cookie.provider}</TableCell>
                        <TableCell className="max-w-xs">{cookie.purpose}</TableCell>
                        <TableCell>{cookie.expiry}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cookie.type)}>
                            {getCategoryIcon(cookie.type)}
                            <span className="ml-1">{cookie.type}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-yellow-600" />
                Analytics Cookies
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cookie Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsCookies.map((cookie) => (
                      <TableRow key={cookie.name}>
                        <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                        <TableCell>{cookie.provider}</TableCell>
                        <TableCell className="max-w-xs">{cookie.purpose}</TableCell>
                        <TableCell>{cookie.expiry}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cookie.type)}>
                            {getCategoryIcon(cookie.type)}
                            <span className="ml-1">{cookie.type}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-purple-600" />
                Marketing Cookies
              </h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cookie Name</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {marketingCookies.map((cookie) => (
                      <TableRow key={cookie.name}>
                        <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                        <TableCell>{cookie.provider}</TableCell>
                        <TableCell className="max-w-xs">{cookie.purpose}</TableCell>
                        <TableCell>{cookie.expiry}</TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(cookie.type)}>
                            {getCategoryIcon(cookie.type)}
                            <span className="ml-1">{cookie.type}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {/* Managing Cookies */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-muted-foreground mb-4">
              You can manage your cookie preferences at any time:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">On Our Website</h3>
                <p className="text-muted-foreground mb-3">
                  Click the cookie settings button that appears at the bottom of your screen, 
                  or use the button below to update your preferences.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Trigger cookie consent modal
                    localStorage.removeItem('cookieConsent');
                    window.location.reload();
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Cookie Settings
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">In Your Browser</h3>
                <p className="text-muted-foreground mb-3">
                  Most web browsers allow you to control cookies through their settings. Here are links 
                  to cookie management instructions for popular browsers:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a 
                    href="https://support.google.com/chrome/answer/95647" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Chrome <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a 
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Firefox <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a 
                    href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Safari <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="text-muted-foreground">•</span>
                  <a 
                    href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    Edge <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Google Analytics Opt-Out</h3>
                <p className="text-muted-foreground mb-3">
                  You can opt out of Google Analytics across all websites by installing the 
                  Google Analytics Opt-out Browser Add-on.
                </p>
                <a 
                  href="https://tools.google.com/dlpage/gaoptout" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary hover:underline"
                >
                  Download Google Analytics Opt-out Add-on <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
          </Card>

          {/* PIPEDA Compliance */}
          <Card className="p-6 border-l-4 border-l-primary bg-primary/5">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              PIPEDA Compliance
            </h2>
            <p className="text-muted-foreground mb-4">
              Our use of cookies complies with the Personal Information Protection and Electronic 
              Documents Act (PIPEDA). Under PIPEDA, we:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Obtain meaningful consent before placing non-essential cookies</li>
              <li>Provide clear information about what cookies we use and why</li>
              <li>Allow you to withdraw consent at any time</li>
              <li>Retain cookie consent records for compliance purposes</li>
              <li>Store all data on servers located in Canada when possible</li>
            </ul>
          </Card>

          {/* Contact */}
          <Card className="p-6">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-4">
              Questions About Cookies?
            </h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about our use of cookies or this policy, please contact us:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/privacy">View Privacy Policy</Link>
              </Button>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;
