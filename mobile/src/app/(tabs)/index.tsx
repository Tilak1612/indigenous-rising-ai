import { Link, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Body, Caption, Card, Heading, Notice, Title } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { fetchProfile, fetchSubscription, formatDeletionDate, getDeletionRequest, profileMissingFields } from '@/lib/account';
import { daysUntil, fetchSavedMatches, formatDeadline } from '@/lib/funding';
import { Spacing, useTheme } from '@/theme';

export default function HomeScreen() {
  const { user } = useAuth();
  const t = useTheme();
  const userId = user?.id ?? '';

  const home = useAsync(async () => {
    const [profile, subscription, saved, deletion] = await Promise.all([
      fetchProfile(userId),
      fetchSubscription(),
      fetchSavedMatches(),
      getDeletionRequest(userId),
    ]);
    return { profile, subscription, saved, deletion };
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (home.data) home.reload();
      // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on each focus only
    }, []),
  );

  const profile = home.data?.profile ?? null;
  const missing = profileMissingFields(profile);
  const upcoming = (home.data?.saved ?? [])
    .map((s) => ({ s, days: daysUntil(s.grant?.deadline ?? null) }))
    .filter((x) => x.days !== null && x.days >= 0 && x.days <= 60)
    .sort((a, b) => (a.days as number) - (b.days as number))
    .slice(0, 3);

  return (
    <Screen refreshing={home.refreshing} onRefresh={home.reload}>
      <View>
        <Heading>Welcome back</Heading>
        <Caption>{profile?.business_name ?? 'Get funded. Grow your business. Keep your data.'}</Caption>
      </View>

      {home.error ? <Notice tone="danger">{home.error}</Notice> : null}

      {home.data?.deletion ? (
        <Notice tone="danger">
          Your account is scheduled for deletion on {formatDeletionDate(home.data.deletion.scheduled_for)}. To keep it, open Account
          and choose Cancel deletion.
        </Notice>
      ) : null}

      {missing.length > 0 && !home.loading ? (
        <Notice tone="accent">
          Complete your business profile ({missing.join(', ')}) on the website to run AI funding matches. The app
          shows your matches once the profile is ready.
        </Notice>
      ) : null}

      <View style={styles.grid}>
        <QuickLink href="/funding" title="Find funding" body="Browse the programme catalogue" />
        <QuickLink href="/funding/matches" title="My matches" body="AI matches from your business profile" />
        <QuickLink href="/funding/saved" title="Saved" body="Programmes you are tracking" />
        <QuickLink href="/plan" title="Business plan" body="Six sections, saved as you type" />
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <Title>Upcoming deadlines</Title>
          <Caption>next 60 days</Caption>
        </View>
        {home.loading ? (
          <Body muted>Loading…</Body>
        ) : upcoming.length === 0 ? (
          <Body muted>No saved programme closes in the next 60 days. Most listed programmes have rolling intake.</Body>
        ) : (
          upcoming.map(({ s, days }) => (
            <Link key={s.id} href={{ pathname: '/funding/[id]', params: { id: s.grant_id } }} asChild>
              <Pressable style={StyleSheet.flatten([styles.deadline, { borderTopColor: t.border }])} accessibilityRole="button">
                <View style={styles.grow}>
                  <Body numberOfLines={1}>{s.grant?.name ?? 'Programme'}</Body>
                  <Caption>{formatDeadline(s.grant?.deadline ?? null)}</Caption>
                </View>
                <Badge tone={(days as number) <= 14 ? 'danger' : 'neutral'}>{days === 0 ? 'Today' : `${days} days`}</Badge>
              </Pressable>
            </Link>
          ))
        )}
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Title>Your plan</Title>
          {home.data ? (
            <Badge tone={home.data.subscription.subscribed ? 'primary' : 'neutral'}>
              {home.data.subscription.subscribed ? home.data.subscription.plan_name ?? 'Paid' : 'Free'}
            </Badge>
          ) : null}
        </View>
        <Caption>Funding information is decision support, not an eligibility decision.</Caption>
      </Card>
    </Screen>
  );
}

function QuickLink({ href, title, body }: { href: '/funding' | '/funding/matches' | '/funding/saved' | '/plan'; title: string; body: string }) {
  const t = useTheme();
  return (
    <Link href={href} asChild>
      {/* Link's Slot needs a single style object, not an array or a function. */}
      <Pressable accessibilityRole="button" style={StyleSheet.flatten([styles.tile, { backgroundColor: t.surface, borderColor: t.border }])}>
        <Title>{title}</Title>
        <Caption>{body}</Caption>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  tile: { width: '47%', flexGrow: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, padding: Spacing.lg, gap: Spacing.xs, minHeight: 96 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  deadline: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingTop: Spacing.md, marginTop: Spacing.xs, borderTopWidth: StyleSheet.hairlineWidth },
  grow: { flex: 1 },
});
