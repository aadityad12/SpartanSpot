import { StyleSheet, Text, View } from 'react-native';
import { getGarage } from '../../mock/garages';
import { clampHour, currentVsTypical } from '../../mock/trends';
import { colors } from '../../theme';
import { Badge, Card, ProgressBar } from '../kit';
import { minutesLabel } from '../reservations/format';
import { WEEKDAY_NAMES } from './time';

// Within this many points of the usual level still counts as typical.
const TYPICAL_BAND = 3;

export function RightNowCard({ garageId, now }: { garageId: string; now: number }) {
  const garage = getGarage(garageId);
  const date = new Date(now);
  const { now: current, typical } = currentVsTypical(garageId, date);
  const diff = current - typical;
  const hourText = minutesLabel(clampHour(date.getHours()) * 60);
  const when = `${WEEKDAY_NAMES[date.getDay()]} ${hourText}`;

  const verdict = diff > TYPICAL_BAND
    ? { label: 'Busier', tone: 'occupied' as const, icon: 'trending-up' as const, text: `${diff}% busier than usual` }
    : diff < -TYPICAL_BAND
      ? { label: 'Quieter', tone: 'available' as const, icon: 'trending-down' as const, text: `${-diff}% quieter than usual` }
      : { label: 'Typical', tone: 'neutral' as const, icon: 'minus' as const, text: 'about as busy as usual' };
  const barTone = current >= 85 ? 'occupied' : current >= 65 ? 'warning' : 'available';

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>RIGHT NOW</Text>
        <Badge label={verdict.label} tone={verdict.tone} icon={verdict.icon} />
      </View>
      <Text style={styles.sentence}>
        {garage?.name ?? 'This garage'} is {current}% full, {verdict.text} for {when}
      </Text>
      <ProgressBar value={current} max={100} tone={barTone} />
      <Text style={styles.note}>Sample data · typical = average of the last three weeks</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, color: colors.muted },
  sentence: { fontSize: 17, lineHeight: 24, fontWeight: '700', color: colors.ink },
  note: { fontSize: 11, color: colors.muted },
});
