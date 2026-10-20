import Constants from 'expo-constants';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Body, Button, Caption, Card, Heading, Notice, Title } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { useAuth } from '@/hooks/use-auth';
import { exportMyData, fetchProfile, fetchSubscription } from '@/lib/account';
import { Spacing, useTheme } from '@/theme';

const SITE = 'https://www.indigenousrising.ai';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const t = useTheme();
  const userId = user?.id ?? '';
  const account = useAsync(async () => {
    const [profile, subscription] = await Promise.all([fetchProfile(userId), fetchSubscription()]);
    return { profile, subscription };
  }, [userId]);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportData = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const json = await exportMyData(userId);
      const file = new File(Paths.cache, `indigenous-rising-export-${new Date().toISOString().slice(0, 10)}.json`);
      file.write(json);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export my data' });
      } else {
        setExportError('Sharing is not available on this device.');
      }
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const confirmSignOut = () =>
    Alert.alert('Sign out?', 'You can sign back in any time.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
    ]);

  const requestDeletion = () =>
    Alert.alert(
      'Delete your account',
      'We permanently delete your account and the data attached to it. Email us from this address and we action it, with written confirmation when it is done. Export your data first if you want a copy.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email a deletion request',
          style: 'destructive',
          onPress: () =>
            Linking.openURL(
              `mailto:help@indigenousrising.ai?subject=${encodeURIComponent('Account deletion request')}&body=${encodeURIComponent(
                `Please delete the account for ${user?.email ?? ''}.`,
              )}`,
            ),
        },
      ],
    );

  const sub = account.data?.subscription;
  const version = Constants.expoConfig?.version ?? '';

  return (
    <Screen refreshing={account.refreshing} onRefresh={account.reload}>
      <Heading>Account</Heading>

      <Card>
        <Title>{account.data?.profile?.full_name ?? 'Your profile'}</Title>
        <Body muted>{user?.email}</Body>
        {account.data?.profile?.business_name ? <Body>{account.data.profile.business_name}</Body> : null}
        <LinkRow label="Edit business profile on the website" url={`${SITE}/dashboard/profile`} />
      </Card>

      <Card>
        <View style={styles.rowBetween}>
          <Title>Subscription</Title>
          {sub ? <Badge tone={sub.subscribed ? 'primary' : 'neutral'}>{sub.subscribed ? sub.plan_name ?? 'Paid' : 'Free'}</Badge> : null}
        </View>
        {sub?.subscribed && sub.current_period_end ? (
          <Caption>
            {sub.cancel_at_period_end ? 'Ends' : 'Renews'} {new Date(sub.current_period_end).toLocaleDateString('en-CA', { dateStyle: 'medium' })}
          </Caption>
        ) : (
          <Caption>Free to start. No credit card.</Caption>
        )}
      </Card>

      <Card>
        <Title>Your data</Title>
        <Caption>Stored in Canada. You can take a copy at any time; it includes your profile, business plans and saved funding.</Caption>
        {exportError ? <Notice tone="danger">{exportError}</Notice> : null}
        <Button title="Export my data (JSON)" variant="secondary" onPress={exportData} loading={exporting} />
        <LinkRow label="Your data rights" url={`${SITE}/data-rights`} />
        <LinkRow label="Privacy policy" url={`${SITE}/privacy`} />
        <LinkRow label="Terms of service" url={`${SITE}/terms`} />
      </Card>

      <Card>
        <Title>Help</Title>
        <LinkRow label="Email help@indigenousrising.ai" url="mailto:help@indigenousrising.ai" />
        <LinkRow label="FAQ" url={`${SITE}/faq`} />
      </Card>

      <View style={styles.gapMd}>
        <Button title="Sign out" variant="secondary" onPress={confirmSignOut} />
        <Pressable accessibilityRole="button" onPress={requestDeletion} style={styles.deleteLink}>
          <Body style={{ color: t.danger }}>Delete your account</Body>
        </Pressable>
      </View>

      <Caption style={{ textAlign: 'center' }}>
        Indigenous Rising {version ? `v${version}` : ''}. OCAP® is a registered trademark of the First Nations Information
        Governance Centre; this app is designed around OCAP® principles, not certified by FNIGC.
      </Caption>
    </Screen>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  const t = useTheme();
  const open = () => (url.startsWith('mailto:') ? Linking.openURL(url) : WebBrowser.openBrowserAsync(url));
  return (
    <Pressable accessibilityRole="link" onPress={open} style={[styles.linkRow, { borderTopColor: t.border }]}>
      <Body style={{ color: t.primary }}>{label}</Body>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkRow: { paddingVertical: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, minHeight: 44, justifyContent: 'center' },
  gapMd: { gap: Spacing.md },
  deleteLink: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
});
