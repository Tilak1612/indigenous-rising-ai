import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrantCard } from '@/components/grant-card';
import { Screen } from '@/components/screen';
import { Body, EmptyState, Loading, Notice } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { fetchSavedMatches, setSaved, type Grant } from '@/lib/funding';
import { Spacing, useTheme } from '@/theme';

export default function SavedScreen() {
  const { user } = useAuth();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const saved = useAsync(fetchSavedMatches, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (saved.data) saved.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on focus only
    }, []),
  );

  const remove = async (grant: Grant) => {
    if (!user) return;
    await setSaved(user.id, grant.id, false);
    saved.reload();
  };

  const rows = (saved.data ?? []).filter((s) => s.grant);

  return (
    <Screen scroll={false}>
      <FlatList
        data={rows}
        keyExtractor={(s) => s.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 88 }]}
        refreshing={saved.refreshing}
        onRefresh={saved.reload}
        ListHeaderComponent={saved.error ? <Notice tone="danger">{saved.error}</Notice> : undefined}
        ListEmptyComponent={
          saved.loading ? (
            <Loading />
          ) : (
            <EmptyState
              title="Nothing saved yet"
              body="Save programmes from the catalogue or your matches to track their deadlines here."
              action={
                <Link href="/funding" asChild>
                  <Pressable accessibilityRole="button" style={StyleSheet.flatten([styles.chip, { backgroundColor: t.primary }])}>
                    <Body style={{ color: t.onPrimary, fontWeight: '600' }}>Browse funding</Body>
                  </Pressable>
                </Link>
              }
            />
          )
        }
        renderItem={({ item }) => <GrantCard grant={item.grant as Grant} saved onToggleSave={(g) => remove(g)} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg, flexGrow: 1 },
  chip: { borderRadius: 999, paddingHorizontal: Spacing.xl, minHeight: 44, justifyContent: 'center' },
});
