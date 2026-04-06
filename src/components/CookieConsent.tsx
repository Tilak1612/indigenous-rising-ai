import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Cookie, Settings, ChevronDown, ChevronUp } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
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
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  // Minimized state - just a small icon
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
        aria-label="Open cookie preferences"
      >
        <Cookie className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] p-4 shadow-lg border border-border bg-card">
      {/* Header with minimize button */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Cookie className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-card-foreground">Cookie Settings</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Minimize cookie notice"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* Concise message */}
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        We use cookies to improve your experience. Your data is protected under Canadian privacy laws.
      </p>
      
      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleAcceptAll}
          size="sm"
          className="w-full font-medium"
        >
          Accept All Cookies
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={handleRejectNonEssential}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            Essential Only
          </Button>
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Cookie Preferences</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose which cookies to allow.
                </p>
                
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <h4 className="text-sm font-medium">Necessary</h4>
                    <p className="text-xs text-muted-foreground">Required for site functionality</p>
                  </div>
                  <Switch checked={true} disabled />
                </div>
                
                {/* Functional Cookies */}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <h4 className="text-sm font-medium">Functional</h4>
                    <p className="text-xs text-muted-foreground">Remember preferences</p>
                  </div>
                  <Switch 
                    checked={preferences.functional}
                    onCheckedChange={(checked) => updatePreference('functional', checked)}
                  />
                </div>
                
                {/* Analytics Cookies */}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <div>
                    <h4 className="text-sm font-medium">Analytics</h4>
                    <p className="text-xs text-muted-foreground">Anonymous usage data</p>
                  </div>
                  <Switch 
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => updatePreference('analytics', checked)}
                  />
                </div>
                
                {/* Marketing Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium">Marketing</h4>
                    <p className="text-xs text-muted-foreground">Personalized content</p>
                  </div>
                  <Switch 
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => updatePreference('marketing', checked)}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSavePreferences} size="sm" className="flex-1">
                    Save
                  </Button>
                  <Button onClick={handleAcceptAll} variant="outline" size="sm" className="flex-1">
                    Accept All
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Card>
  );
};

export default CookieConsent;