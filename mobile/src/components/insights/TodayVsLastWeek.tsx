import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { hourlyOccupancy } from '../../mock/trends';
import { colors } from '../../theme';
import { BarChart, Card, SegmentedControl } from '../kit';
import { HOURS, WEEKDAY_NAMES, WEEKDAY_SHORT, hourTick } from './time';

const dayOptions = [1, 2, 3, 4, 5].map(day => ({ value: String(day), label: WEEKDAY_SHORT[day] }));

export function TodayVsLastWeek({ garageId, now }: { garageId: string; now: number }) {
  const today = new Date(now);
  const [picked, setPicked] = useState<string | null>(null);
  // Weekends have no Mon-Fri chip, so fall back to Monday until the student picks a day.
  const todayChip = today.getDay() >= 1 && today.getDay() <= 5 ? String(today.getDay()) : '1';
  const day = picked ?? todayChip;
  const weekday = Number(day);

  const data = useMemo(() => {
    const thisWeek = hourlyOccupancy(garageId, weekday, 0);
    const lastWeek = hourlyOccupancy(garageId, weekday, -1);
    // Only label every second hour; the bars are too narrow for all 16 labels.
    return thisWeek.map((point, index) => ({
      label: index % 2 === 0 ? hourTick(point.hour) : '',
      value: point.percent,
      compare: lastWeek[index].percent,
    }));
  }, [garageId, weekday]);

  const currentIndex = HOURS.indexOf(today.getHours());
  const showingToday = weekday === today.getDay() && currentIndex >= 0;

  return (
    <Card style={styles.card}>
      <SegmentedControl options={dayOptions} value={day} onChange={setPicked} />
      <Text style={styles.caption}>
        {WEEKDAY_NAMES[weekday]}, percent full by hour{showingToday ? ' · current hour in gold' : ''}
      </Text>
      <BarChart
        data={data}
        max={100}
        height={170}
        highlightIndex={showingToday ? currentIndex : undefined}
        valueLabel="This week"
        compareLabel="Last week (same day)"
      />
      <Text style={styles.note}>Sample data</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  caption: { fontSize: 12, color: colors.muted },
  note: { fontSize: 11, color: colors.muted },
});
