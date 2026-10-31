import { StyleSheet, Text, View } from 'react-native';
import type { Spot } from '../../../mock/garages';
import { colors } from '../../../theme';
import { Badge, Card, SectionHeader } from '../../kit';
import { ActionButton } from './ActionButton';

export function HoldsList({
  spots,
  holds,
  onRelease,
}: {
  spots: Spot[];
  holds: Record<string, string>;
  onRelease: (spot: Spot) => void;
}) {
  return (
    <Card style={styles.card}>
      <SectionHeader title="Holds on this level" />
      {spots.length === 0 ? (
        <Text style={styles.empty}>No spots are held on this level. Use Hold spots to reserve some.</Text>
      ) : (
        spots.map(spot => (
          <View key={spot.id} style={styles.row}>
            <Text style={styles.label}>Spot {spot.label}</Text>
            <Badge label={holds[spot.id]} tone="reserved" icon="bookmark" />
            <View style={styles.spacer} />
            <ActionButton
              label="Release"
              tone="quiet"
              accessibilityLabel={`Release spot ${spot.label}`}
              onPress={() => onRelease(spot)}
            />
          </View>
        ))
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  empty: { fontSize: 13, color: colors.muted },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  spacer: { flex: 1 },
});
