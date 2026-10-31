import { StyleSheet, Text, View } from 'react-native';
import type { Rules } from '../../mock/reservations';
import { colors } from '../../theme';
import { Card, ChipRow } from '../kit';
import { dayChipLabel, formatWindow, minutesLabel } from './format';

const DAY_OFFSETS = [0, 1, 2, 3, 4, 5, 6];

export function TimeStep({
  now,
  rules,
  dayOffset,
  onDayChange,
  starts,
  startMinutes,
  onStartChange,
  hours,
  onHoursChange,
  window,
}: {
  now: number;
  rules: Rules;
  dayOffset: number;
  onDayChange: (offset: number) => void;
  starts: number[];
  startMinutes: number | null;
  onStartChange: (minutes: number) => void;
  hours: number;
  onHoursChange: (hours: number) => void;
  window: { start: Date; end: Date } | null;
}) {
  const durations = Array.from({ length: Math.max(1, Math.floor(rules.maxHours)) }, (_, index) => index + 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.group}>
        <Text style={styles.label}>Date</Text>
        <ChipRow
          options={DAY_OFFSETS.map(offset => ({ value: String(offset), label: dayChipLabel(now, offset) }))}
          value={String(dayOffset)}
          onChange={value => onDayChange(Number(value))}
        />
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Start time</Text>
        {starts.length > 0 ? (
          <ChipRow
            options={starts.map(minutes => ({ value: String(minutes), label: minutesLabel(minutes) }))}
            value={startMinutes === null ? '' : String(startMinutes)}
            onChange={value => onStartChange(Number(value))}
          />
        ) : (
          <Text style={styles.note}>No more start times today. Pick tomorrow or later.</Text>
        )}
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Duration (up to {rules.maxHours} h)</Text>
        <ChipRow
          options={durations.map(value => ({ value: String(value), label: `${value} h` }))}
          value={String(hours)}
          onChange={value => onHoursChange(Number(value))}
        />
      </View>

      <Card style={styles.summary}>
        <Text style={styles.summaryLabel}>YOUR WINDOW</Text>
        <Text style={styles.summaryValue}>
          {window ? formatWindow(window.start, window.end) : 'Pick a start time'}
        </Text>
        <Text style={styles.note}>Spot is held {rules.graceMinutes} min past your start time.</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  group: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink },
  note: { fontSize: 13, color: colors.muted },
  summary: { gap: 4 },
  summaryLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  summaryValue: { fontSize: 17, fontWeight: '700', color: colors.ink },
});
