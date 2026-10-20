import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Body, Caption, Card, Title } from '@/components/ui';
import { daysUntil, formatAmount, formatDeadline, humanize, type Grant } from '@/lib/funding';
import { Spacing, useTheme } from '@/theme';

interface Props {
  grant: Grant;
  saved?: boolean;
  onToggleSave?: (grant: Grant, next: boolean) => void;
}

/**
 * One funding programme, as a scannable card: name, funder, amount, deadline,
 * type. Everything shown comes from the catalogue row itself; nothing is
 * inferred, and no eligibility is implied.
 */
export function GrantCard({ grant, saved, onToggleSave }: Props) {
  const t = useTheme();
  const days = daysUntil(grant.deadline);
  const closingSoon = days !== null && days >= 0 && days <= 30;
  return (
    <Link href={{ pathname: '/funding/[id]', params: { id: grant.id } }} asChild>
      <Pressable accessibilityRole="button" accessibilityLabel={`${grant.name}, ${grant.funder ?? ''}`}>
        <Card>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Title numberOfLines={2}>{grant.name}</Title>
              <Caption>{grant.funder ?? 'Funder not listed'}</Caption>
            </View>
            {onToggleSave ? (
              <Pressable
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Remove from saved' : 'Save this programme'}
                onPress={() => onToggleSave(grant, !saved)}
                style={[styles.save, { borderColor: saved ? t.primary : t.border, backgroundColor: saved ? t.primary : 'transparent' }]}>
                <Body style={{ color: saved ? t.onPrimary : t.primary, fontWeight: '600' }}>{saved ? 'Saved' : 'Save'}</Body>
              </Pressable>
            ) : null}
          </View>
          <Body>{formatAmount(grant.amount_min, grant.amount_max)}</Body>
          <View style={styles.badges}>
            {grant.funding_type ? <Badge>{humanize(grant.funding_type)}</Badge> : null}
            {grant.is_repayable === false ? <Badge tone="success">Non-repayable</Badge> : null}
            <Badge tone={closingSoon ? 'danger' : 'neutral'}>
              {closingSoon ? `Closes in ${days} day${days === 1 ? '' : 's'}` : formatDeadline(grant.deadline, grant.is_recurring)}
            </Badge>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  grow: { flex: 1, gap: 2 },
  save: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 6, minHeight: 36, justifyContent: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
