import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Field, Heading, Notice } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { Spacing, useTheme } from '@/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Enter the email you signed up with.');
      return;
    }
    setBusy(true);
    const { error: err } = await resetPassword(email.trim());
    setBusy(false);
    if (err) setError(err.message);
    else setSent(true);
  };

  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}
      keyboardShouldPersistTaps="handled">
      <Heading>Reset your password</Heading>
      {sent ? (
        <>
          <Body>If an account exists for {email.trim()}, a reset link is on its way. The link opens on the website, where you can choose a new password.</Body>
          <Button title="Back to sign in" variant="secondary" onPress={() => router.replace('/(auth)/sign-in')} />
        </>
      ) : (
        <>
          <Body muted>We will email you a link to choose a new password.</Body>
          {error ? <Notice tone="danger">{error}</Notice> : null}
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            onSubmitEditing={submit}
          />
          <Button title="Send reset link" onPress={submit} loading={busy} />
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.xl, gap: Spacing.lg },
});
