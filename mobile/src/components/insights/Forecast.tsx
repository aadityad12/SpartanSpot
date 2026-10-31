import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { forecastNext7Days, quietestWindow } from '../../mock/trends';
import { colors } from '../../theme';
import { BarChart, Card } from '../kit';
import { Icon } from '../ui';
import { WEEKDAY_SHORT } from './time';

export function Forecast({ garageId, now }: { garageId: string; now: number }) {
  const hour = new Date(now).getHours();
  const weekday = new Date(now).getDay();
  const days = useMemo(() => forecastNext7Days(garageId, new Date(now)), [garageId, now]);

  const data = days.map((day, index) => ({
    label: index === 0 ? 'Today' : WEEKDAY_SHORT[new Date(`${day.date}T00:00:00`).getDay()],
    value: day.peakPercent,
  }));
  // Past the afternoon there is no daytime window left, so say so instead of showing a stale one.
  const quiet = quietestWindow(garageId, weekday, hour + 1);

  return (
    <Card style={styles.card}>
      <Text style={styles.caption}>Predicted peak occupancy for each day</Text>
      <BarChart data={data} max={100} height={160} highlightIndex={0} valueSuffix="%" />
      <View style={styles.callout}>
        <Icon name="clock" size={18} color={colors.primary} />
        <Text style={styles.calloutText}>
          {quiet ? `Quietest window today: ${quiet}` : 'No quiet window left today'}
        </Text>
      </View>
      <Text style={styles.note}>Predictions are generated from sample occupancy history.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  caption: { fontSize: 12, color: colors.muted },
  callout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },
  calloutText: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.primary },
  note: { fontSize: 11, color: colors.muted },
});
