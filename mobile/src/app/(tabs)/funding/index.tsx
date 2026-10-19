import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GrantCard } from '@/components/grant-card';
import { Screen } from '@/components/screen';
import { Body, Caption, EmptyState, Loading, Notice } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { fetchGrants, fetchSavedGrantIds, setSaved, type Grant } from '@/lib/funding';
import { Radius, Spacing, useTheme } from '@/theme';

export default function FundingListScreen() {
  const { user } = useAuth();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  const grants = useAsync(fetchGrants);

  useFocusEffect(
    useCallback(() => {
      // Runs on first focus too, so this is the only saved-ids fetch; saves
      // made on the detail screen or the website show up on return.
      let active = true;
      fetchSavedGrantIds()
        .then((ids) => active && setSavedIds(ids))
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = grants.data ?? [];
    if (!q) return all;
    return all.filter((g) =>
      [g.name, g.funder, g.description, g.funding_type, ...(g.provinces ?? []), ...(g.industries ?? [])]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q)),
    );
  }, [grants.data, query]);

  const toggle = async (grant: Grant, next: boolean) => {
    if (!user) return;
    setSaveError(null);
    const before = new Set(savedIds);
    const optimistic = new Set(savedIds);
    if (next) optimistic.add(grant.id);
    else optimistic.delete(grant.id);
    setSavedIds(optimistic);
    try {
      await setSaved(user.id, grant.id, next);
    } catch (e) {
      setSavedIds(before);
      setSaveError(`Could not ${next ? 'save' : 'remove'}: ${(e as Error).message}`);
    }
  };

  return (
    <Screen scroll={false}>
      <FlatList
        data={filtered}
        keyExtractor={(g) => g.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 88 }]}
        keyboardShouldPersistTaps="handled"
        refreshing={grants.refreshing}
        onRefresh={grants.reload}
        ListHeaderComponent={
          <View style={styles.header}>
            <TextInput
              accessibilityLabel="Search programmes"
              placeholder="Search by name, funder, province or industry"
              placeholderTextColor={t.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
              style={[styles.search, { color: t.text, backgroundColor: t.surface, borderColor: t.border }]}
            />
            <View style={styles.links}>
              <Link href="/funding/matches" asChild>
                <Pressable accessibilityRole="button" style={[styles.chip, { backgroundColor: t.primary }]}>
                  <Body style={{ color: t.onPrimary, fontWeight: '600' }}>AI matches</Body>
                </Pressable>
              </Link>
              <Link href="/funding/saved" asChild>
                <Pressable accessibilityRole="button" style={[styles.chip, { backgroundColor: t.surface, borderColor: t.border, borderWidth: 1 }]}>
                  <Body style={{ fontWeight: '600' }}>Saved ({savedIds.size})</Body>
                </Pressable>
              </Link>
            </View>
            {saveError ? <Notice tone="danger">{saveError}</Notice> : null}
            {grants.error ? <Notice tone="danger">Could not load programmes: {grants.error}</Notice> : null}
            {grants.data ? (
              <Caption>
                {filtered.length} of {grants.data.length} verified programmes. Confirm current requirements with the funder before applying.
              </Caption>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          grants.loading ? (
            <Loading />
          ) : (
            <EmptyState title="No programmes match" body={query ? 'Try a different search term.' : 'The catalogue is empty right now.'} />
          )
        }
        renderItem={({ item }) => <GrantCard grant={item} saved={savedIds.has(item.id)} onToggleSave={toggle} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { padding: Spacing.lg },
  header: { gap: Spacing.md, marginBottom: Spacing.lg },
  search: { minHeight: 48, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, fontSize: 16 },
  links: { flexDirection: 'row', gap: Spacing.sm },
  chip: { borderRadius: Radius.pill, paddingHorizontal: Spacing.lg, minHeight: 40, justifyContent: 'center' },
});
