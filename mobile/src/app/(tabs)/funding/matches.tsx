import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Body, Button, Caption, Card, Heading, Notice, Title } from '@/components/ui';
import { formatAmount, formatDeadline, runMatching, type Match, type MatchOutcome } from '@/lib/funding';
import { Spacing, useTheme } from '@/theme';

const PROFILE_URL = 'https://www.indigenousrising.ai/dashboard/profile';

type State = { kind: 'idle' } | { kind: 'loading' } | MatchOutcome;

/**
 * Runs the same match-funding-opportunities function the web dashboard calls.
 * Each run counts against the plan's monthly quota, so it is on demand and
 * never automatic.
 */
export default function MatchesScreen() {
  const [state, setState] = useState<State>({ kind: 'idle' });

  const run = async () => {
    setState({ kind: 'loading' });
    try {
      setState(await runMatching());
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message });
    }
  };

  return (
    <Screen>
      <View style={styles.gap}>
        <Heading>AI funding matches</Heading>
        <Body muted>
          Matches are ranked against the business profile you entered. They are suggestions to review, not a decision on
          eligibility; the funder makes that.
        </Body>
      </View>

      {state.kind === 'idle' ? <Button title="Find my matches" onPress={run} /> : null}
      {state.kind === 'loading' ? <Button title="Matching…" loading onPress={() => undefined} /> : null}

      {state.kind === 'profile-incomplete' ? (
        <Card>
          <Title>Finish your business profile first</Title>
          <Body>Missing: {state.missing.join(', ')}.</Body>
          <Button title="Complete profile on the website" variant="secondary" onPress={() => WebBrowser.openBrowserAsync(PROFILE_URL)} />
        </Card>
      ) : null}

      {state.kind === 'quota-exceeded' ? (
        <Card>
          <Title>Monthly matches used</Title>
          <Body>{state.message}</Body>
          <Caption>Your saved programmes and the catalogue stay available.</Caption>
        </Card>
      ) : null}

      {state.kind === 'rate-limited' ? <Notice tone="accent">{state.message}</Notice> : null}
      {state.kind === 'error' ? (
        <View style={styles.gap}>
          <Notice tone="danger">{state.message}</Notice>
          <Button title="Try again" variant="secondary" onPress={run} />
        </View>
      ) : null}

      {state.kind === 'results' ? (
        <>
          <Caption>
            {state.data.matches.length} match{state.data.matches.length === 1 ? '' : 'es'}
            {state.data.matches_remaining_this_month !== null
              ? ` · ${state.data.matches_remaining_this_month} run${state.data.matches_remaining_this_month === 1 ? '' : 's'} left this month`
              : ''}
          </Caption>
          {state.data.matches.length === 0 ? (
            <Notice>{state.data.message ?? 'No programme in the catalogue matches your profile right now.'}</Notice>
          ) : (
            state.data.matches.map((m) => <MatchCard key={m.grant_id} match={m} />)
          )}
          <Button title="Run again" variant="ghost" onPress={run} />
        </>
      ) : null}
    </Screen>
  );
}

function MatchCard({ match }: { match: Match }) {
  const t = useTheme();
  const tone = match.eligibility === 'yes' ? 'success' : match.eligibility === 'maybe' ? 'accent' : 'danger';
  const label = match.eligibility === 'yes' ? 'Likely eligible' : match.eligibility === 'maybe' ? 'Possibly eligible' : 'Unlikely';
  return (
    <Link href={{ pathname: '/funding/[id]', params: { id: match.grant_id } }} asChild>
      <Pressable accessibilityRole="button">
        <Card>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Title>{match.name}</Title>
              <Caption>{match.funder}</Caption>
            </View>
            <Badge tone={tone}>{label}</Badge>
          </View>
          <Body>{formatAmount(match.amount_min, match.amount_max)}</Body>
          <Caption>{formatDeadline(match.deadline, match.is_recurring)}</Caption>
          {match.explanation ? <Body muted>{match.explanation}</Body> : null}
          {match.criteria?.length ? (
            <View style={styles.gap}>
              {match.criteria.map((c, i) => (
                <View key={i} style={styles.row}>
                  <Body style={{ color: c.met === true ? t.success : c.met === false ? t.danger : t.textSecondary }}>
                    {c.met === true ? '✓' : c.met === false ? '✕' : '?'}
                  </Body>
                  <Body style={styles.grow}>{c.label}{c.detail ? ` — ${c.detail}` : ''}</Body>
                </View>
              ))}
            </View>
          ) : null}
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  gap: { gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  grow: { flex: 1 },
});
