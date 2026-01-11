import { useState, useEffect, useCallback } from 'react';

export interface TerritorySettings {
  primaryTerritory: string;
  additionalTerritories: string[];
  customAcknowledgment: string;
  useCustom: boolean;
  autoDetected: boolean;
}

const STORAGE_KEY = 'territory-settings';

// Common Canadian territories for selection
export const CANADIAN_TERRITORIES = [
  { id: 'algonquin', name: 'Algonquin Anishinaabe', region: 'Ontario/Quebec' },
  { id: 'anishinaabe', name: 'Anishinaabe', region: 'Ontario/Manitoba' },
  { id: 'blackfoot', name: 'Blackfoot Confederacy (Siksika, Piikani, Kainai)', region: 'Alberta' },
  { id: 'coast-salish', name: 'Coast Salish', region: 'British Columbia' },
  { id: 'cree', name: 'Cree (ᓀᐦᐃᔭᐍᐏᐣ)', region: 'Alberta/Saskatchewan/Manitoba' },
  { id: 'dene', name: 'Dene', region: 'Northwest Territories/Saskatchewan' },
  { id: 'gitxsan', name: 'Gitxsan', region: 'British Columbia' },
  { id: 'haida', name: 'Haida', region: 'British Columbia (Haida Gwaii)' },
  { id: 'haudenosaunee', name: 'Haudenosaunee (Six Nations)', region: 'Ontario/Quebec' },
  { id: 'innu', name: 'Innu', region: 'Quebec/Labrador' },
  { id: 'inuit', name: 'Inuit (ᐃᓄᐃᑦ)', region: 'Nunavut/Nunavik/Nunatsiavut' },
  { id: 'kwakwakawakw', name: 'Kwakwaka\'wakw', region: 'British Columbia' },
  { id: 'lekwungen', name: 'Lekwungen (Songhees, Esquimalt)', region: 'British Columbia' },
  { id: 'metis', name: 'Métis Nation', region: 'Prairies/Ontario' },
  { id: 'mikmaq', name: 'Mi\'kmaq (Mi\'kma\'ki)', region: 'Atlantic Provinces' },
  { id: 'mohawk', name: 'Mohawk (Kanien\'keha:ka)', region: 'Ontario/Quebec' },
  { id: 'musqueam', name: 'Musqueam (xʷməθkʷəy̓əm)', region: 'British Columbia' },
  { id: 'nisga', name: 'Nisga\'a', region: 'British Columbia' },
  { id: 'nuu-chah-nulth', name: 'Nuu-chah-nulth', region: 'British Columbia' },
  { id: 'ojibwe', name: 'Ojibwe (Anishinaabemowin)', region: 'Ontario/Manitoba' },
  { id: 'oneida', name: 'Oneida', region: 'Ontario' },
  { id: 'sto-lo', name: 'Sto:lo', region: 'British Columbia' },
  { id: 'squamish', name: 'Sḵwx̱wú7mesh (Squamish)', region: 'British Columbia' },
  { id: 'tlicho', name: 'Tłı̨chǫ (Dogrib)', region: 'Northwest Territories' },
  { id: 'tsilhqotin', name: 'Tsilhqot\'in', region: 'British Columbia' },
  { id: 'tsimshian', name: 'Tsimshian', region: 'British Columbia' },
  { id: 'wolastoqey', name: 'Wolastoqey (Maliseet)', region: 'New Brunswick' },
];

// Generate respectful acknowledgment text
export const generateAcknowledgment = (territories: string[]): string => {
  if (territories.length === 0) {
    return 'We acknowledge that we work on the traditional territories of Indigenous peoples across Turtle Island.';
  }

  const territoryList = territories
    .map(id => CANADIAN_TERRITORIES.find(t => t.id === id)?.name)
    .filter(Boolean);

  if (territoryList.length === 1) {
    return `We acknowledge that we are on the traditional territory of the ${territoryList[0]} people.`;
  }

  const last = territoryList.pop();
  return `We acknowledge that we are on the traditional territories of the ${territoryList.join(', ')} and ${last} peoples.`;
};

const DEFAULT_SETTINGS: TerritorySettings = {
  primaryTerritory: '',
  additionalTerritories: [],
  customAcknowledgment: '',
  useCustom: false,
  autoDetected: false,
};

export function useTerritorySettings() {
  const [settings, setSettings] = useState<TerritorySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [loading, setLoading] = useState(false);

  const saveSettings = useCallback((newSettings: Partial<TerritorySettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save territory settings', e);
    }
  }, [settings]);

  const getAcknowledgmentText = useCallback(() => {
    if (settings.useCustom && settings.customAcknowledgment) {
      return settings.customAcknowledgment;
    }

    const allTerritories = settings.primaryTerritory
      ? [settings.primaryTerritory, ...settings.additionalTerritories]
      : settings.additionalTerritories;

    return generateAcknowledgment(allTerritories);
  }, [settings]);

  const detectTerritory = useCallback(async () => {
    setLoading(true);
    try {
      // Use a free geolocation API to detect approximate location
      const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error('Geolocation failed');
      
      const data = await response.json();
      const region = data.region || data.city || '';
      
      // Simple mapping of Canadian regions to territories
      const regionMapping: Record<string, string> = {
        'Ontario': 'anishinaabe',
        'Quebec': 'haudenosaunee',
        'British Columbia': 'coast-salish',
        'Alberta': 'blackfoot',
        'Saskatchewan': 'cree',
        'Manitoba': 'cree',
        'Nova Scotia': 'mikmaq',
        'New Brunswick': 'wolastoqey',
        'Newfoundland and Labrador': 'innu',
        'Prince Edward Island': 'mikmaq',
        'Northwest Territories': 'dene',
        'Yukon': 'dene',
        'Nunavut': 'inuit',
        'Toronto': 'haudenosaunee',
        'Vancouver': 'musqueam',
        'Ottawa': 'algonquin',
        'Montreal': 'haudenosaunee',
        'Calgary': 'blackfoot',
        'Edmonton': 'cree',
        'Winnipeg': 'anishinaabe',
        'Halifax': 'mikmaq',
      };

      for (const [key, territoryId] of Object.entries(regionMapping)) {
        if (region.toLowerCase().includes(key.toLowerCase())) {
          saveSettings({
            primaryTerritory: territoryId,
            autoDetected: true,
          });
          setLoading(false);
          return territoryId;
        }
      }

      // Default if no match found
      setLoading(false);
      return null;
    } catch (e) {
      console.error('Territory detection failed:', e);
      setLoading(false);
      return null;
    }
  }, [saveSettings]);

  return {
    settings,
    saveSettings,
    getAcknowledgmentText,
    detectTerritory,
    loading,
    territories: CANADIAN_TERRITORIES,
  };
}
