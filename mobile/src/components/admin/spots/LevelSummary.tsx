import { StyleSheet, View } from 'react-native';
import { StatTile } from '../../kit';
import type { ReservedSplit } from './holds';

export function LevelSummary({
  available,
  occupied,
  reserved,
}: {
  available: number;
  occupied: number;
  reserved: ReservedSplit;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <StatTile label="Available" value={available} tone="available" icon="check-circle" />
      </View>
      <View style={styles.cell}>
        <StatTile label="Occupied" value={occupied} tone="occupied" icon="x-circle" />
      </View>
      <View style={styles.cell}>
        <StatTile
          label="Reserved"
          value={reserved.student + reserved.held}
          tone="reserved"
          icon="bookmark"
          sublabel={`${reserved.student} student · ${reserved.held} held`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  cell: { flex: 1 },
});
