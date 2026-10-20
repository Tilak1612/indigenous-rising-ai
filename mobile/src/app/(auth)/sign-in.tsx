import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Button, Caption, Field, Heading, Notice } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { Spacing, useTheme } from '@/theme';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) setError(err.message);
    // On success the root layout's Gate redirects into the app.
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView
        style={{ backgroundColor: t.background }}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xl }]}
        keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/brand/login-logo.png')} style={styles.logo} contentFit="contain" accessibilityLabel="Indigenous Rising" />
        <Heading>Welcome back</Heading>
        <Body muted>Sign in to your Indigenous Rising account.</Body>

        {error ? <Notice tone="danger">{error}</Notice> : null}

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
          autoComplete="password"
          textContentType="password"
          onSubmitEditing={submit}
        />
        <Button title="Sign in" onPress={submit} loading={busy} />

        <View style={styles.links}>
          <Link href="/(auth)/forgot-password" style={{ color: t.primary }}>
            Forgot your password?
          </Link>
          <Link href="/(auth)/sign-up" style={{ color: t.primary }}>
            Create a free account
          </Link>
        </View>
        <Caption style={{ textAlign: 'center' }}>Free to start. No credit card. Data stored in Canada.</Caption>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  logo: { width: 96, height: 96, alignSelf: 'center', marginBottom: Spacing.md },
  links: { gap: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
});
