import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MapPin, 
  Locate, 
  Plus, 
  X, 
  Check, 
  Loader2,
  Info,
  Sparkles
} from 'lucide-react';
import { useTerritorySettings, CANADIAN_TERRITORIES, generateAcknowledgment } from '@/hooks/useTerritorySettings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function TerritorySettings() {
  const { 
    settings, 
    saveSettings, 
    getAcknowledgmentText, 
    detectTerritory, 
    loading,
    territories 
  } = useTerritorySettings();

  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleDetectLocation = async () => {
    const detected = await detectTerritory();
    if (detected) {
      setLocalSettings(prev => ({
        ...prev,
        primaryTerritory: detected,
        autoDetected: true,
      }));
      toast.success('Territory detected based on your location');
    } else {
      toast.error('Could not detect territory. Please select manually.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    saveSettings(localSettings);
    toast.success('Territory acknowledgment saved');
    setSaving(false);
  };

  const addTerritory = (territoryId: string) => {
    if (!localSettings.additionalTerritories.includes(territoryId) && territoryId !== localSettings.primaryTerritory) {
      setLocalSettings(prev => ({
        ...prev,
        additionalTerritories: [...prev.additionalTerritories, territoryId],
      }));
    }
  };

  const removeTerritory = (territoryId: string) => {
    setLocalSettings(prev => ({
      ...prev,
      additionalTerritories: prev.additionalTerritories.filter(id => id !== territoryId),
    }));
  };

  const previewText = localSettings.useCustom && localSettings.customAcknowledgment
    ? localSettings.customAcknowledgment
    : generateAcknowledgment(
        localSettings.primaryTerritory 
          ? [localSettings.primaryTerritory, ...localSettings.additionalTerritories]
          : localSettings.additionalTerritories
      );

  const availableTerritories = territories.filter(
    t => t.id !== localSettings.primaryTerritory && !localSettings.additionalTerritories.includes(t.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>Territory Acknowledgment</CardTitle>
        </div>
        <CardDescription>
          Customize how you acknowledge the traditional territories where you live and work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-detect Location */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-3">
            <Locate className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Auto-detect Territory</p>
              <p className="text-sm text-muted-foreground">
                Use your location to suggest the appropriate territory
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleDetectLocation}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Locate className="h-4 w-4 mr-2" />
                Detect Location
              </>
            )}
          </Button>
        </div>

        {/* Primary Territory Selection */}
        <div className="space-y-2">
          <Label>Primary Territory</Label>
          <Select
            value={localSettings.primaryTerritory}
            onValueChange={(value) => setLocalSettings(prev => ({ ...prev, primaryTerritory: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select primary territory..." />
            </SelectTrigger>
            <SelectContent>
              {territories.map(territory => (
                <SelectItem key={territory.id} value={territory.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{territory.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({territory.region})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {localSettings.autoDetected && localSettings.primaryTerritory && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Auto-detected based on your location
            </p>
          )}
        </div>

        {/* Additional Territories */}
        <div className="space-y-2">
          <Label>Additional Territories (for traveling entrepreneurs)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {localSettings.additionalTerritories.map(id => {
              const territory = territories.find(t => t.id === id);
              return territory ? (
                <Badge key={id} variant="secondary" className="gap-1">
                  {territory.name}
                  <button onClick={() => removeTerritory(id)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ) : null;
            })}
          </div>
          <Select onValueChange={addTerritory} value="">
            <SelectTrigger>
              <SelectValue placeholder="Add another territory..." />
            </SelectTrigger>
            <SelectContent>
              {availableTerritories.map(territory => (
                <SelectItem key={territory.id} value={territory.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{territory.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">({territory.region})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Acknowledgment Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Use Custom Acknowledgment</p>
            <p className="text-sm text-muted-foreground">
              Write your own territory acknowledgment text
            </p>
          </div>
          <Switch
            checked={localSettings.useCustom}
            onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, useCustom: checked }))}
          />
        </div>

        {/* Custom Acknowledgment Text */}
        {localSettings.useCustom && (
          <div className="space-y-2">
            <Label>Custom Acknowledgment Text</Label>
            <Textarea
              placeholder="We acknowledge that we are on the traditional territory of..."
              value={localSettings.customAcknowledgment}
              onChange={(e) => setLocalSettings(prev => ({ ...prev, customAcknowledgment: e.target.value }))}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Write a respectful acknowledgment that reflects your relationship with the land and communities
            </p>
          </div>
        )}

        {/* Preview */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Preview
          </Label>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm italic text-foreground/80">"{previewText}"</p>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Save Territory Settings
        </Button>
      </CardContent>
    </Card>
  );
}
