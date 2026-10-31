import { StyleSheet, Text, View } from 'react-native';
import type { Rules } from '../../mock/reservations';
import { colors } from '../../theme';
import { Card, ProgressBar, SectionHeader } from '../kit';

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  return (
    <View style={styles.meter}>
      <View style={styles.meterTop}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{used} of {limit} used</Text>
      </View>
      <ProgressBar value={used} max={limit} tone={used >= limit ? 'occupied' : 'primary'} />
    </View>
  );
}

export function LimitsCard({ usage, rules }: { usage: { today: number; month: number }; rules: Rules }) {
  return (
    <Card style={styles.card}>
      <SectionHeader title="Your limits" />
      <Meter label="Today" used={usage.today} limit={rules.dailyLimit} />
      <Meter label="This month" used={usage.month} limit={rules.monthlyLimit} />
      <Text style={styles.note}>Limits are set by Parking Services.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  meter: { gap: 6 },
  meterTop: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  value: { fontSize: 14, color: colors.muted },
  note: { fontSize: 12, color: colors.muted },
});
