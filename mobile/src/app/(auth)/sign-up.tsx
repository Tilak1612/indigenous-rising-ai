import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Caption, Field, Heading, Notice } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { Spacing, useTheme } from '@/theme';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async () => {
    setError(null);
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Fill in your name, email and a password.');
      return;
    }
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.');
      return;
    }
    setBusy(true);
    const { error: err, needsConfirmation } = await signUp(email.trim(), password, fullName.trim());
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (needsConfirmation) setConfirmSent(true);
    // Otherwise a session exists and the Gate redirects into the app.
  };

  if (confirmSent) {
    return (
      <ScrollView style={{ backgroundColor: t.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xxl }]}>
        <Heading>Check your email</Heading>
        <Body>
          We sent a confirmation link to {email.trim()}. Open it to activate your account, then come back here and sign in.
        </Body>
        <Button title="Back to sign in" variant="secondary" onPress={() => router.replace('/(auth)/sign-in')} />
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView
        style={{ backgroundColor: t.background }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled">
        <Heading>Create your free account</Heading>
        <Body muted>Find funding, build your plan and keep your data. No credit card required.</Body>

        {error ? <Notice tone="danger">{error}</Notice> : null}

        <Field label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" textContentType="name" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          onSubmitEditing={submit}
        />
        <Button title="Create account" onPress={submit} loading={busy} />

        <Caption style={{ textAlign: 'center' }}>
          By creating an account you agree to the Terms of Service and Privacy Policy at indigenousrising.ai.
        </Caption>
        <View style={styles.links}>
          <Link href="/(auth)/sign-in" style={{ color: t.primary }}>
            Already have an account? Sign in
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  links: { alignItems: 'center', marginTop: Spacing.sm },
});
