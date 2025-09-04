import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  MousePointer, 
  Settings, 
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface AccessibilityState {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  textSize: number;
  isOpen: boolean;
}

const AccessibilityToolbar: React.FC = () => {
  const [accessibility, setAccessibility] = useState<AccessibilityState>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    focusIndicators: false,
    textSize: 100,
    isOpen: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      const settings = JSON.parse(saved);
      setAccessibility(prev => ({ ...prev, ...settings }));
      applySettings(settings);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(accessibility));
    applySettings(accessibility);
  }, [accessibility]);

  const applySettings = (settings: AccessibilityState) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--transition-smooth', 'none');
      root.style.setProperty('--transition-spring', 'none');
    } else {
      root.style.removeProperty('--transition-smooth');
      root.style.removeProperty('--transition-spring');
    }

    // Text size
    root.style.fontSize = `${settings.textSize}%`;

    // Focus indicators
    if (settings.focusIndicators) {
      root.setAttribute('data-focus-visible', 'true');
    } else {
      root.removeAttribute('data-focus-visible');
    }
  };

  const toggleSetting = (key: keyof AccessibilityState) => {
    setAccessibility(prev => ({
      ...prev,
      [key]: !prev[key as keyof AccessibilityState]
    }));
  };

  const adjustTextSize = (increment: number) => {
    setAccessibility(prev => ({
      ...prev,
      textSize: Math.max(75, Math.min(150, prev.textSize + increment))
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      focusIndicators: false,
      textSize: 100,
      isOpen: accessibility.isOpen,
    };
    setAccessibility(defaultSettings);
  };

  return (
    <>
      {/* Accessibility Button - Always visible */}
      <Button
        onClick={() => toggleSetting('isOpen')}
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 shadow-elevated bg-primary text-primary-foreground hover:bg-primary-hover"
        aria-label="Open accessibility toolbar"
        size="icon"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Accessibility Toolbar Panel */}
      {accessibility.isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 p-4 w-80 shadow-elevated bg-card border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">Accessibility Options</h3>
            <Button
              onClick={() => toggleSetting('isOpen')}
              variant="outline"
              size="icon"
              aria-label="Close accessibility toolbar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Contrast className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">High Contrast</span>
              </div>
              <Button
                onClick={() => toggleSetting('highContrast')}
                variant={accessibility.highContrast ? 'default' : 'outline'}
                size="sm"
                aria-pressed={accessibility.highContrast}
              >
                {accessibility.highContrast ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </div>

            {/* Text Size */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Type className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">Text Size: {accessibility.textSize}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => adjustTextSize(-10)}
                  variant="outline"
                  size="sm"
                  disabled={accessibility.textSize <= 75}
                  aria-label="Decrease text size"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => adjustTextSize(10)}
                  variant="outline"
                  size="sm"
                  disabled={accessibility.textSize >= 150}
                  aria-label="Increase text size"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Focus Indicators */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MousePointer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-card-foreground">Enhanced Focus</span>
              </div>
              <Button
                onClick={() => toggleSetting('focusIndicators')}
                variant={accessibility.focusIndicators ? 'default' : 'outline'}
                size="sm"
                aria-pressed={accessibility.focusIndicators}
              >
                {accessibility.focusIndicators ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-card-foreground">Reduce Motion</span>
              </div>
              <Button
                onClick={() => toggleSetting('reducedMotion')}
                variant={accessibility.reducedMotion ? 'default' : 'outline'}
                size="sm"
                aria-pressed={accessibility.reducedMotion}
              >
                {accessibility.reducedMotion ? 'On' : 'Off'}
              </Button>
            </div>

            {/* Reset Button */}
            <div className="pt-2 border-t border-border">
              <Button
                onClick={resetSettings}
                variant="outline"
                size="sm"
                className="w-full"
                aria-label="Reset all accessibility settings"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Settings are automatically saved to your browser.
          </p>
        </Card>
      )}
    </>
  );
};

export default AccessibilityToolbar;