import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { BarChart, Card, SectionHeader } from '../../kit';

const FIRST_HOUR = 7;
const LAST_HOUR = 21;

// Typical weekday shape, 7 AM to 9 PM, as a percentage of campus spaces.
const CURVE = [24, 38, 52, 66, 76, 82, 86, 88, 87, 83, 76, 66, 54, 44, 36];

function hourTick(hour: number): string {
  return `${hour % 12 || 12}${hour < 12 ? 'a' : 'p'}`;
}

// Scales the typical curve so the current hour matches the live number from the garages.
export function OccupancyCard({ currentPercent }: { currentPercent: number }) {
  const nowHour = new Date().getHours();
  const endHour = Math.min(LAST_HOUR, Math.max(FIRST_HOUR, nowHour));
  const scale = currentPercent / CURVE[endHour - FIRST_HOUR];
  const data = CURVE.slice(0, endHour - FIRST_HOUR + 1).map((value, index) => ({
    label: hourTick(FIRST_HOUR + index),
    value: Math.min(99, Math.round(value * scale)),
  }));

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Occupancy today" />
      <Card>
        <Text style={styles.caption}>Percent of campus spaces occupied, 7 AM to now</Text>
        <BarChart data={data} max={100} height={170} highlightIndex={data.length - 1} />
        <Text style={styles.note}>Sample data</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  caption: { fontSize: 12, color: colors.muted, marginBottom: 10 },
  note: { fontSize: 11, color: colors.muted, marginTop: 8 },
});
