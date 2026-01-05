type Lang = 'en' | 'oj' | 'cr' | 'iu' | 'fr' | 'mi';

const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    greeting: 'Welcome',
    territory_ack: 'Territory acknowledgment: [Placeholder territory]'
  },
  oj: {
    greeting: 'Boozhoo',
    territory_ack: 'Aaniin: [Placeholder territory]'
  },
  cr: { greeting: 'Tansi', territory_ack: 'Territory acknowledgment: [Placeholder territory]' },
  iu: { greeting: 'ᐊᓘ', territory_ack: 'Territory acknowledgment: [Placeholder territory]' },
  fr: { greeting: 'Bienvenue', territory_ack: "Reconnaissance du territoire : [Territoire]" },
  mi: { greeting: 'Kwe', territory_ack: 'Territory acknowledgment: [Placeholder territory]' }
};

export const getString = (lang: Lang | string, key: string) => {
  const l = (lang as Lang) || 'en';
  return (STRINGS[l] && STRINGS[l][key]) || STRINGS['en'][key] || '';
};
