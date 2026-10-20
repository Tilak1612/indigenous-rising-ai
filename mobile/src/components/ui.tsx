import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { FontSize, Radius, Spacing, useTheme } from '@/theme';

// The small set of primitives every screen is built from. Each takes the
// brand palette from the theme so light and dark mode stay consistent.

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }, style]}>
      {children}
    </View>
  );
}

export function Heading({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return (
    <Text accessibilityRole="header" style={[styles.heading, { color: t.text }, style]}>
      {children}
    </Text>
  );
}

export function Title({
  children,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  const t = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[styles.title, { color: t.text }, style]}>
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  const t = useTheme();
  return (
    <Text numberOfLines={numberOfLines} style={[styles.body, { color: muted ? t.textSecondary : t.text }, style]}>
      {children}
    </Text>
  );
}

export function Caption({ children, style }: { children: ReactNode; style?: TextStyle }) {
  const t = useTheme();
  return <Text style={[styles.caption, { color: t.textSecondary }, style]}>{children}</Text>;
}

type Tone = 'neutral' | 'primary' | 'accent' | 'danger' | 'success';

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  const t = useTheme();
  const bg = {
    neutral: t.surfaceMuted,
    primary: t.primary,
    accent: t.accent,
    danger: t.danger,
    success: t.success,
  }[tone];
  const fg = tone === 'neutral' ? t.text : t.onPrimary;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{children}</Text>
    </View>
  );
}

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({ title, variant = 'primary', loading, disabled, style, ...rest }: ButtonProps) {
  const t = useTheme();
  const bg = { primary: t.primary, secondary: t.surface, danger: t.danger, ghost: 'transparent' }[variant];
  const fg = { primary: t.onPrimary, secondary: t.text, danger: t.onPrimary, ghost: t.primary }[variant];
  const border = variant === 'secondary' ? t.border : bg;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1 },
        style,
      ]}
      {...rest}>
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  error?: string | null;
}

export function Field({ label, error, style, ...rest }: FieldProps) {
  const t = useTheme();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: t.textSecondary }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.textSecondary}
        style={[
          styles.input,
          { color: t.text, backgroundColor: t.surface, borderColor: error ? t.danger : t.border },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: t.danger }]}>{error}</Text> : null}
    </View>
  );
}

export function Notice({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  const t = useTheme();
  const border = { neutral: t.border, primary: t.primary, accent: t.accent, danger: t.danger, success: t.success }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: t.surfaceMuted, borderLeftColor: border }]}>
      <Text style={[styles.body, { color: t.text }]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Title style={{ textAlign: 'center' }}>{title}</Title>
      <Body muted style={{ textAlign: 'center', marginTop: Spacing.sm }}>
        {body}
      </Body>
      {action ? <View style={{ marginTop: Spacing.lg }}>{action}</View> : null}
    </View>
  );
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={styles.empty}>
      <ActivityIndicator color={t.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  heading: { fontSize: FontSize.xxl, fontWeight: '700', letterSpacing: -0.3 },
  title: { fontSize: FontSize.lg, fontWeight: '600' },
  body: { fontSize: FontSize.md, lineHeight: 22 },
  caption: { fontSize: FontSize.xs, lineHeight: 16 },
  badge: { alignSelf: 'flex-start', borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: 3 },
  badgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  button: {
    minHeight: 48,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  buttonText: { fontSize: FontSize.md, fontWeight: '600' },
  field: { gap: Spacing.xs },
  label: { fontSize: FontSize.sm, fontWeight: '500' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSize.md,
  },
  error: { fontSize: FontSize.sm },
  notice: { borderLeftWidth: 3, borderRadius: Radius.sm, padding: Spacing.md },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
});
