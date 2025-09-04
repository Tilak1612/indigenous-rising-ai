import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Cookie, Settings, X } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
    setShowBanner(false);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    saveConsent(essentialOnly);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    
    // In a real implementation, you would trigger analytics/marketing scripts here
    console.log('Cookie preferences saved:', prefs);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <Card className="fixed bottom-0 left-0 right-0 z-50 m-4 p-4 shadow-lg border border-border bg-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-semibold text-card-foreground">We Value Your Privacy</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your experience, analyze site traffic, and provide personalized content. 
                Your data is handled in accordance with Canadian privacy laws (PIPEDA).
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Button
              onClick={handleRejectNonEssential}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              Essential Only
            </Button>
            
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Cookie Preferences</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Manage your cookie preferences. You can enable or disable different types of cookies below.
                  </p>
                  
                  {/* Necessary Cookies */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Necessary Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Required for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </div>
                  
                  {/* Functional Cookies */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Functional Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Remember your preferences and settings to enhance your experience.
                        </p>
                      </div>
                      <Switch 
                        checked={preferences.functional}
                        onCheckedChange={(checked) => updatePreference('functional', checked)}
                      />
                    </div>
                  </div>
                  
                  {/* Analytics Cookies */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Analytics Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Help us understand how visitors interact with our website through anonymous data.
                        </p>
                      </div>
                      <Switch 
                        checked={preferences.analytics}
                        onCheckedChange={(checked) => updatePreference('analytics', checked)}
                      />
                    </div>
                  </div>
                  
                  {/* Marketing Cookies */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Used to provide personalized advertisements and content.
                        </p>
                      </div>
                      <Switch 
                        checked={preferences.marketing}
                        onCheckedChange={(checked) => updatePreference('marketing', checked)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSavePreferences} className="flex-1">
                      Save Preferences
                    </Button>
                    <Button onClick={handleAcceptAll} variant="outline">
                      Accept All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={handleAcceptAll}
              size="sm"
              className="w-full sm:w-auto"
            >
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CookieConsent;