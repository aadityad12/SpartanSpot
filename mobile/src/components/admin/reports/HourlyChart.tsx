import { StyleSheet, Text, View } from 'react-native';
import type { DailyReport } from '../../../mock/reports';
import { colors } from '../../../theme';
import { BarChart, Card, SectionHeader } from '../../kit';
import { hourLabel, hourTick } from './format';

export function HourlyChart({ report }: { report: DailyReport }) {
  const data = report.hourly.map(point => ({ label: hourTick(point.hour), value: point.entries }));
  const peakIndex = report.hourly.reduce(
    (best, point, index, all) => (point.entries > all[best].entries ? index : best),
    0,
  );
  const busiest = report.hourly[peakIndex];

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Entries by hour" />
      <Card>
        <Text style={styles.caption}>
          Busiest hour: {hourLabel(busiest.hour)} with {busiest.entries} cars
        </Text>
        <BarChart data={data} height={180} highlightIndex={peakIndex} />
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
