import { Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Body, Button, Caption, Card, EmptyState, Heading, Loading, Notice, Title } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { fetchGrant, fetchSavedGrantIds, formatAmount, formatDeadline, setSaved } from '@/lib/funding';
import { Spacing } from '@/theme';

export default function GrantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const grant = useAsync(() => fetchGrant(id), [id]);
  const [saved, setSavedState] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedGrantIds().then((ids) => setSavedState(ids.has(id))).catch(() => undefined);
  }, [id]);

  const toggle = async () => {
    if (!user) return;
    setBusy(true);
    setError(null);
    try {
      await setSaved(user.id, id, !saved);
      setSavedState(!saved);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const g = grant.data;
  const officialUrl = g?.source_url || g?.application_url || null;

  return (
    <Screen refreshing={grant.refreshing} onRefresh={grant.reload}>
      <Stack.Screen options={{ title: g?.funder ?? 'Programme' }} />
      {grant.loading ? (
        <Loading />
      ) : grant.error ? (
        <Notice tone="danger">{grant.error}</Notice>
      ) : !g ? (
        <EmptyState title="Programme not found" body="It may have been unpublished since you saved it." />
      ) : (
        <>
          <View style={styles.gap}>
            <Heading>{g.name}</Heading>
            <Body muted>{g.funder ?? 'Funder not listed'}</Body>
          </View>

          <View style={styles.badges}>
            {g.funding_type ? <Badge>{g.funding_type}</Badge> : null}
            {g.is_repayable === false ? <Badge tone="success">Non-repayable</Badge> : null}
            {g.is_repayable === true ? <Badge>Repayable</Badge> : null}
            {g.verification_status ? <Badge tone="primary">{g.verification_status}</Badge> : null}
          </View>

          <Card>
            <Row label="Amount" value={formatAmount(g.amount_min, g.amount_max)} />
            <Row label="Deadline" value={formatDeadline(g.deadline, g.is_recurring)} />
            {g.provinces?.length ? <Row label="Where" value={g.provinces.join(', ')} /> : null}
            {g.industries?.length ? <Row label="Industries" value={g.industries.join(', ')} /> : null}
            {g.last_verified ? <Row label="Last verified" value={formatDeadline(g.last_verified)} /> : null}
          </Card>

          {g.description ? (
            <Card>
              <Title>About</Title>
              <Body>{g.description}</Body>
            </Card>
          ) : null}

          {g.eligibility_notes ? (
            <Card>
              <Title>Eligibility notes</Title>
              <Body>{g.eligibility_notes}</Body>
            </Card>
          ) : null}

          <Notice>
            This is decision support, not an eligibility decision. Only the funder can confirm whether you qualify;
            amounts, deadlines and rules change, so check the official page before you apply.
          </Notice>

          {error ? <Notice tone="danger">{error}</Notice> : null}

          <View style={styles.gap}>
            {officialUrl ? (
              <Button title="Open the official programme page" onPress={() => WebBrowser.openBrowserAsync(officialUrl)} />
            ) : (
              <Caption>No official link is recorded for this programme yet.</Caption>
            )}
            <Button title={saved ? 'Remove from saved' : 'Save this programme'} variant="secondary" onPress={toggle} loading={busy} />
          </View>
        </>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Caption style={styles.rowLabel}>{label}</Caption>
      <Body style={styles.rowValue}>{value}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  gap: { gap: Spacing.sm },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  rowLabel: { width: 96, paddingTop: 3 },
  rowValue: { flex: 1 },
});
