import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function FundingLayout() {
  const t = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.background },
        headerTintColor: t.primary,
        headerTitleStyle: { color: t.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: t.background },
      }}>
      <Stack.Screen name="index" options={{ title: 'Funding', headerLargeTitle: true }} />
      <Stack.Screen name="matches" options={{ title: 'My matches' }} />
      <Stack.Screen name="saved" options={{ title: 'Saved' }} />
      <Stack.Screen name="[id]" options={{ title: 'Programme' }} />
    </Stack>
  );
}
