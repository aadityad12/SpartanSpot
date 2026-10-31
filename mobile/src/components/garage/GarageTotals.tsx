import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { ProgressBar, StatTile } from '../kit';

export type Totals = { total: number; available: number; occupied: number; reserved: number };

export function GarageTotals({ totals }: { totals: Totals }) {
  const full = totals.total > 0 ? Math.round(((totals.total - totals.available) / totals.total) * 100) : 0;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <StatTile
          label="Available"
          value={totals.available}
          tone={totals.available === 0 ? 'occupied' : 'available'}
          icon={totals.available === 0 ? 'x-circle' : 'check-circle'}
        />
        <StatTile label="Occupied" value={totals.occupied} tone="occupied" icon="truck" />
      </View>
      <View style={styles.row}>
        <StatTile label="Reserved" value={totals.reserved} tone="reserved" icon="bookmark" />
        <StatTile label="Total" value={totals.total} icon="grid" />
      </View>
      <View style={styles.fullRow}>
        <ProgressBar value={totals.total - totals.available} max={totals.total} tone={full >= 90 ? 'occupied' : 'primary'} />
        <Text style={styles.fullText}>{full}% full</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fullRow: { gap: 6 },
  fullText: { fontSize: 13, fontWeight: '600', color: colors.ink },
});
