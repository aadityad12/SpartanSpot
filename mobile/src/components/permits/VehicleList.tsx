import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Vehicle } from '../../mock/people';
import { colors } from '../../theme';
import { Badge, Card, LicensePlate } from '../kit';
import { Icon } from '../ui';

function VehicleRow({
  vehicle,
  removable,
  onRemove,
}: {
  vehicle: Vehicle;
  removable: boolean;
  onRemove: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <View style={styles.info}>
          <LicensePlate plate={vehicle.plate} state={vehicle.state} size="sm" />
          <Text style={styles.detail}>{vehicle.color} {vehicle.make} {vehicle.model}</Text>
          {vehicle.primary ? <Badge label="Primary" tone="primary" icon="star" /> : null}
        </View>
        {removable && !confirming ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove vehicle ${vehicle.plate}`}
            hitSlop={8}
            onPress={() => setConfirming(true)}
            style={styles.iconButton}
          >
            <Icon name="trash-2" size={18} color={colors.red} />
          </Pressable>
        ) : null}
      </View>

      {confirming ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmText}>Remove {vehicle.plate}?</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Keep vehicle"
            onPress={() => setConfirming(false)}
            style={styles.keep}
          >
            <Text style={styles.keepText}>Keep</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Confirm remove ${vehicle.plate}`}
            onPress={onRemove}
            style={styles.remove}
          >
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function VehicleList({
  vehicles,
  onRemove,
}: {
  vehicles: Vehicle[];
  onRemove: (id: string) => void;
}) {
  // A student needs at least one plate on file to buy a permit or reserve a spot.
  const removable = vehicles.length > 1;
  return (
    <Card style={styles.card}>
      {vehicles.map(vehicle => (
        <VehicleRow
          key={vehicle.id}
          vehicle={vehicle}
          removable={removable}
          onRemove={() => onRemove(vehicle.id)}
        />
      ))}
      {!removable && vehicles.length === 1 ? (
        <Text style={styles.note}>Your last vehicle cannot be removed. Add another one first.</Text>
      ) : null}
      {vehicles.length === 0 ? <Text style={styles.note}>No vehicles on file yet.</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 4 },
  row: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  main: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  detail: { fontSize: 13, color: colors.ink },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.occupiedLight,
  },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confirmText: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.red },
  keep: { paddingHorizontal: 14, height: 34, borderRadius: 10, justifyContent: 'center', backgroundColor: colors.primaryLight },
  keepText: { fontSize: 13, fontWeight: '600', color: colors.primary },
  remove: { paddingHorizontal: 14, height: 34, borderRadius: 10, justifyContent: 'center', backgroundColor: colors.red },
  removeText: { fontSize: 13, fontWeight: '700', color: colors.white },
  note: { fontSize: 12, lineHeight: 18, color: colors.muted, paddingTop: 6 },
});
