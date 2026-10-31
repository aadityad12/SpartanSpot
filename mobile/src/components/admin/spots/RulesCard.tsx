import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useDemo } from '../../../demo';
import { defaultRules, type Rules } from '../../../mock/reservations';
import { colors } from '../../../theme';
import { Banner, Card, SectionHeader, Stepper } from '../../kit';
import { ActionButton } from './ActionButton';
import { pluralize } from './holds';

function sameRules(first: Rules, second: Rules): boolean {
  return first.dailyLimit === second.dailyLimit
    && first.monthlyLimit === second.monthlyLimit
    && first.maxHours === second.maxHours
    && first.graceMinutes === second.graceMinutes
    && first.showReservedSeparately === second.showReservedSeparately;
}

function summary(rules: Rules): string {
  return `Students may make ${pluralize(rules.dailyLimit, 'reservation')} per day and ${rules.monthlyLimit} per month, `
    + `up to ${pluralize(rules.maxHours, 'hour')} each. A spot is held ${rules.graceMinutes} minutes past the start time.`;
}

export function RulesCard() {
  const { rules, updateRules } = useDemo();
  const [draft, setDraft] = useState<Rules>(rules);
  const [saved, setSaved] = useState(false);
  const changed = !sameRules(draft, rules);

  const edit = (patch: Partial<Rules>) => {
    setDraft(current => ({ ...current, ...patch }));
    setSaved(false);
  };

  return (
    <Card style={styles.card}>
      <SectionHeader title="Reservation rules" />
      <Text style={styles.summary}>{summary(rules)}</Text>

      <View style={styles.steppers}>
        <Stepper
          label="Reservations per student per day"
          value={draft.dailyLimit}
          min={1}
          max={5}
          onChange={value => edit({ dailyLimit: value })}
        />
        <Stepper
          label="Monthly reservation limit"
          value={draft.monthlyLimit}
          min={1}
          max={30}
          onChange={value => edit({ monthlyLimit: value })}
        />
        <Stepper
          label="Max length (hours)"
          value={draft.maxHours}
          min={1}
          max={8}
          onChange={value => edit({ maxHours: value })}
        />
        <Stepper
          label="Grace period (minutes)"
          value={draft.graceMinutes}
          min={5}
          max={30}
          // The shared stepper moves in steps of 1, so snap to the 5-minute increments the rule uses.
          onChange={value => {
            const direction = value > draft.graceMinutes ? 1 : -1;
            edit({ graceMinutes: Math.min(30, Math.max(5, draft.graceMinutes + direction * 5)) });
          }}
        />
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show reserved spots separately to students</Text>
          <Switch
            accessibilityLabel="Show reserved spots separately to students"
            value={draft.showReservedSeparately}
            onValueChange={value => edit({ showReservedSeparately: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {saved ? (
        <Banner tone="success" title="Saved. Students see the new limits immediately." />
      ) : null}

      <View style={styles.actions}>
        <ActionButton
          label="Save rules"
          disabled={!changed}
          onPress={() => {
            updateRules(draft);
            setSaved(true);
          }}
        />
        <ActionButton
          label="Reset to defaults"
          tone="quiet"
          disabled={sameRules(draft, defaultRules)}
          onPress={() => {
            setDraft(defaultRules);
            setSaved(false);
          }}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  summary: { fontSize: 13, lineHeight: 19, color: colors.muted },
  steppers: { gap: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switchLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.ink },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
