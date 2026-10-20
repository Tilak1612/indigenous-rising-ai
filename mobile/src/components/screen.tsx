import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, useTheme } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  /** Scroll by default; pass false for screens that own a FlatList. */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
}

export function Screen({ children, scroll = true, refreshing = false, onRefresh, style }: ScreenProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  // Native tabs overlay the bottom; leave room so the last row is reachable.
  const padding = { paddingBottom: insets.bottom + Spacing.xxl + 56 };
  if (!scroll) {
    return <View style={[styles.flex, { backgroundColor: t.background }, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: t.background }]}
      contentContainerStyle={[styles.content, padding, style]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} /> : undefined
      }>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
});
