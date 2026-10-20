import { useColorScheme } from 'react-native';

// The approved Indigenous Rising brand palette (brand/09-brand-system). The
// web app maps the same five colours in src/index.css; keep them in sync.
export const Brand = {
  forest: '#124C3B',
  gold: '#D79A27',
  terracotta: '#D45B35',
  cream: '#F5F0E8',
  ink: '#111111',
} as const;

export const Colors = {
  light: {
    background: Brand.cream,
    surface: '#FFFFFF',
    surfaceMuted: '#EFE8DA',
    text: Brand.ink,
    textSecondary: '#5B5F5A',
    border: '#E3DCCF',
    primary: Brand.forest,
    onPrimary: '#FFFFFF',
    accent: Brand.gold,
    danger: Brand.terracotta,
    success: '#1E7A58',
  },
  dark: {
    background: '#121614',
    surface: '#1C221E',
    surfaceMuted: '#232B26',
    text: Brand.cream,
    textSecondary: '#B5B9B3',
    border: '#2C342F',
    // Forest green is too dark to read on a dark ground; lifted, as on the web.
    primary: '#3F9A7A',
    onPrimary: '#0B1511',
    accent: '#E0AE4A',
    danger: '#E27A5A',
    success: '#5CC49A',
  },
} as const;

export type Theme = (typeof Colors)['light'] | (typeof Colors)['dark'];

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}

export const Spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const Radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
export const FontSize = { xs: 12, sm: 14, md: 16, lg: 18, xl: 22, xxl: 28 } as const;
