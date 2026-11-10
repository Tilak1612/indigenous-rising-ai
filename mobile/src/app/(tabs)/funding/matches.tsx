import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Body, Button, Caption, Card, Heading, Notice, Title } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { allowAndFindMatches, declineAiMatching, findMatches, resetAiConsent, type MatchingStep } from '@/lib/ai-consent';
import { AI_MATCHING_DISCLOSURE, AI_MATCHING_FIELDS, AI_MATCHING_PROVIDER, formatAmount, formatDeadline, type Match } from '@/lib/funding';
import { openOutgoing, siteUrl } from '@/lib/links';
import { Spacing, useTheme } from '@/theme';

// Opens in the website's native context (no dashboard chrome or upgrade prompts).
const PROFILE_URL = siteUrl('/dashboard/profile');

type State = { kind: 'idle' } | { kind: 'loading' } | MatchingStep;

/**
 * Runs the same match-funding-opportunities function the web dashboard calls,
 * only after the user has allowed AI matching in the app (lib/ai-consent.ts).
 * Each run counts against the plan's monthly quota, so it is on demand and
 * never automatic.
 */
export default function MatchesScreen() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [state, setState] = useState<State>({ kind: 'idle' });

  const step = async (next: () => Promise<MatchingStep>) => {
    setState({ kind: 'loading' });
    try {
      setState(await next());
    } catch (e) {
      setState({ kind: 'error', message: (e as Error).message });
    }
  };
  const run = () => step(() => findMatches(userId));
  const allow = () => step(() => allowAndFindMatches(userId));
  const decline = () => step(() => declineAiMatching(userId));
  const withdraw = async () => {
    await resetAiConsent(userId);
    setState({ kind: 'idle' });
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

      {state.kind === 'consent-required' ? (
        <Card>
          <Title>Allow AI matching?</Title>
          <Body>To rank matches, these six fields from your business profile are sent to {AI_MATCHING_PROVIDER}:</Body>
          {AI_MATCHING_FIELDS.map((f) => (
            <Body key={f}>• {f}</Body>
          ))}
          <Caption>{AI_MATCHING_DISCLOSURE}</Caption>
          <Caption>Nothing is sent unless you allow it. Browsing the catalogue and saved programmes does not use AI.</Caption>
          <Button title="Allow and find matches" onPress={allow} />
          <Button title="Not now" variant="secondary" onPress={decline} />
        </Card>
      ) : null}

      {state.kind === 'declined' ? (
        <Card>
          <Title>AI matching is off</Title>
          <Body>Nothing from your profile was sent. The catalogue and your saved programmes work as usual.</Body>
          <Button title="Review AI matching" variant="secondary" onPress={withdraw} />
        </Card>
      ) : null}

      {state.kind === 'profile-incomplete' ? (
        <Card>
          <Title>Finish your business profile first</Title>
          <Body>Missing: {state.missing.join(', ')}.</Body>
          <Button title="Complete profile on the website" variant="secondary" onPress={() => openOutgoing(PROFILE_URL)} />
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
          <Button title="Stop allowing AI matching" variant="ghost" onPress={withdraw} />
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
