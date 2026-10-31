import { StyleSheet, Text, View } from 'react-native';
import { getGarage } from '../../../mock/garages';
import type { Violation, ViolationStatus } from '../../../mock/reports';
import { colors } from '../../../theme';
import { Badge, Card, LicensePlate, SectionHeader } from '../../kit';

const statusBadge: Record<ViolationStatus, { tone: 'occupied' | 'warning' | 'neutral'; icon: 'file-text' | 'alert-triangle' | 'clock' }> = {
  Cited: { tone: 'occupied', icon: 'file-text' },
  Warning: { tone: 'warning', icon: 'alert-triangle' },
  Pending: { tone: 'neutral', icon: 'clock' },
};

export function ViolationsList({ violations }: { violations: Violation[] }) {
  return (
    <View style={styles.wrap}>
      <SectionHeader title={`Violations (${violations.length})`} />
      <Card padded={false}>
        {violations.map((item, index) => {
          const badge = statusBadge[item.status];
          return (
            <View key={`${item.plate}-${item.time}`} style={[styles.row, index > 0 && styles.divider]}>
              <LicensePlate plate={item.plate} state={item.state} size="sm" />
              <View style={styles.info}>
                <Text style={styles.type}>{item.type}</Text>
                <Text style={styles.meta}>
                  {getGarage(item.garageId)?.name ?? item.garageId} · {item.time}
                </Text>
              </View>
              <Badge label={item.status} tone={badge.tone} icon={badge.icon} />
            </View>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  info: { flex: 1, gap: 2 },
  type: { fontSize: 14, fontWeight: '600', color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
});
