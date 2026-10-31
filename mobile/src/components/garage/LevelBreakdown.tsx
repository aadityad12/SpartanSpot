import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import type { LevelSummary } from '../../mock/garages';
import { Card, ProgressBar } from '../kit';

export function LevelBreakdown({
  levels,
  selected,
  onSelect,
}: {
  levels: LevelSummary[];
  selected: number;
  onSelect: (level: number) => void;
}) {
  return (
    <Card style={styles.card}>
      {levels.map(item => {
        const isSelected = item.level === selected;
        return (
          <Pressable
            key={item.level}
            accessibilityRole="button"
            accessibilityLabel={`Level ${item.level}, ${item.available} of ${item.total} open`}
            accessibilityState={{ selected: isSelected }}
            onPress={() => onSelect(item.level)}
            style={[styles.row, isSelected && styles.rowSelected]}
          >
            <View style={styles.labels}>
              <Text style={[styles.level, isSelected && { color: colors.primary }]}>Level {item.level}</Text>
              <Text style={styles.count}>{item.available} / {item.total} open</Text>
            </View>
            <ProgressBar
              value={item.total - item.available}
              max={item.total}
              tone={item.available === 0 ? 'occupied' : 'primary'}
            />
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6, padding: 8 },
  row: { gap: 8, padding: 10, borderRadius: 12 },
  rowSelected: { backgroundColor: colors.primaryLight },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  level: { fontSize: 14, fontWeight: '600', color: colors.ink },
  count: { fontSize: 13, color: colors.muted },
});
