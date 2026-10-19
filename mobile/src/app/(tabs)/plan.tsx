import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Badge, Body, Caption, Card, Heading, Loading, Notice, Title } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { loadPlan, PLAN_SECTIONS, savePlan, type PlanAnswers } from '@/lib/plan';
import { FontSize, Radius, Spacing, useTheme } from '@/theme';

const AUTO_SAVE_DELAY_MS = 2000;

type SaveState = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

/**
 * The Business Planning Assistant's six sections. Reads and writes the same
 * business_plans row as the web, with the same 2-second autosave, so a plan is
 * one document wherever it is edited.
 */
export default function PlanScreen() {
  const { user } = useAuth();
  const t = useTheme();
  const userId = user?.id ?? '';
  const [answers, setAnswers] = useState<PlanAnswers>({});
  // Derived, not set in the effect: "loaded for" lags userId until the row is read.
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const loading = loadedFor !== userId;
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const planIdRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<PlanAnswers>({});

  useEffect(() => {
    let active = true;
    loadPlan(userId)
      .then((row) => {
        if (!active) return;
        planIdRef.current = row?.id ?? null;
        const content = row?.content ?? {};
        latestRef.current = content;
        setAnswers(content);
        if (row?.updated_at) setLastSaved(new Date(row.updated_at));
      })
      .catch((e) => active && setLoadError((e as Error).message))
      .finally(() => active && setLoadedFor(userId));
    return () => {
      active = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [userId]);

  const persist = async () => {
    setSaveState('saving');
    try {
      planIdRef.current = await savePlan(userId, planIdRef.current, latestRef.current);
      setLastSaved(new Date());
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const onChange = (sectionId: string, text: string) => {
    const next = { ...latestRef.current, [sectionId]: text };
    latestRef.current = next;
    setAnswers(next);
    setSaveState('dirty');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(persist, AUTO_SAVE_DELAY_MS);
  };

  const completed = PLAN_SECTIONS.filter((s) => (answers[s.id] ?? '').trim().length > 0).length;

  if (loading) {
    return (
      <Screen>
        <Loading />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex} keyboardVerticalOffset={80}>
      <Screen>
        <View style={styles.gap}>
          <Heading>Business plan</Heading>
          <View style={styles.row}>
            <Badge tone={completed === PLAN_SECTIONS.length ? 'success' : 'neutral'}>
              {completed}/{PLAN_SECTIONS.length} sections
            </Badge>
            <Caption>
              {saveState === 'saving'
                ? 'Saving…'
                : saveState === 'dirty'
                  ? 'Unsaved changes'
                  : saveState === 'error'
                    ? 'Save failed — will retry on next edit'
                    : lastSaved
                      ? `Saved ${lastSaved.toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })}`
                      : 'Saved as you type'}
            </Caption>
          </View>
        </View>

        {loadError ? <Notice tone="danger">Could not load your plan: {loadError}</Notice> : null}
        {saveState === 'error' ? <Notice tone="danger">Your latest edits are on this device only until a save succeeds.</Notice> : null}

        {PLAN_SECTIONS.map((section, i) => (
          <Card key={section.id}>
            <Title>
              {i + 1}. {section.title}
            </Title>
            <Caption>{section.description}</Caption>
            <TextInput
              accessibilityLabel={section.title}
              multiline
              textAlignVertical="top"
              value={answers[section.id] ?? ''}
              onChangeText={(text) => onChange(section.id, text)}
              placeholder="Write here…"
              placeholderTextColor={t.textSecondary}
              style={[styles.input, { color: t.text, backgroundColor: t.background, borderColor: t.border }]}
            />
          </Card>
        ))}

        <Body muted>
          Financial figures you enter are your own projections, not verified results. Export the full plan from the website
          when you need a document to share.
        </Body>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  input: { minHeight: 120, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.md, lineHeight: 22 },
});
