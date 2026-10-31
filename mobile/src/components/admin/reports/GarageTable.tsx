import { StyleSheet, Text, View } from 'react-native';
import { getGarage } from '../../../mock/garages';
import type { DailyReport } from '../../../mock/reports';
import { colors } from '../../../theme';
import { Card, SectionHeader } from '../../kit';

const columns = [
  { key: 'cars', label: 'Cars' },
  { key: 'peakPercent', label: 'Peak' },
  { key: 'violations', label: 'Viol.' },
  { key: 'reservations', label: 'Res.' },
] as const;

export function GarageTable({ report }: { report: DailyReport }) {
  return (
    <View style={styles.wrap}>
      <SectionHeader title="By garage" />
      <Card padded={false}>
        <View style={[styles.row, styles.head]}>
          <Text style={[styles.name, styles.headText]}>GARAGE</Text>
          {columns.map(column => (
            <Text key={column.key} style={[styles.cell, styles.headText]}>{column.label.toUpperCase()}</Text>
          ))}
        </View>
        {report.byGarage.map(row => (
          <View key={row.garageId} style={[styles.row, styles.divider]}>
            <Text style={[styles.name, styles.nameText]} numberOfLines={1}>
              {getGarage(row.garageId)?.name ?? row.garageId}
            </Text>
            <Text style={styles.cell}>{row.cars}</Text>
            <Text style={styles.cell}>{row.peakPercent}%</Text>
            <Text style={styles.cell}>{row.violations}</Text>
            <Text style={styles.cell}>{row.reservations}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  head: { backgroundColor: colors.primaryLight, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  name: { flex: 1.6 },
  nameText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  cell: { flex: 1, fontSize: 14, color: colors.ink, textAlign: 'right' },
  headText: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: colors.muted },
});
