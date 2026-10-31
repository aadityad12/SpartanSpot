import { StyleSheet, Text, View } from 'react-native';
import type { Spot, SpotStatus } from '../../../mock/garages';
import type { Reservation } from '../../../mock/reservations';
import { colors } from '../../../theme';
import { reservationWindow } from '../../reservations/format';
import { Badge, Card } from '../../kit';
import { featureLabel } from './holds';

const statusBadge = {
  available: { label: 'Available', tone: 'available', icon: 'check-circle' },
  occupied: { label: 'Occupied', tone: 'occupied', icon: 'x-circle' },
  reserved: { label: 'Reserved', tone: 'reserved', icon: 'bookmark' },
  unknown: { label: 'Unknown', tone: 'neutral', icon: 'help-circle' },
} as const;

// Shown in View mode: who holds a reserved spot, or what is booked for it later.
export function SpotInfoCard({
  spot,
  status,
  holdReason,
  reservation,
  upcoming,
}: {
  spot: Spot;
  status: SpotStatus;
  holdReason?: string;
  reservation?: Reservation;
  upcoming?: Reservation;
}) {
  const badge = statusBadge[status];
  const features = spot.features.map(feature => featureLabel[feature]);

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.title}>Spot {spot.label}</Text>
        <Badge label={badge.label} tone={badge.tone} icon={badge.icon} />
      </View>
      <Text style={styles.meta}>
        Level {spot.level} · {features.length ? features.join(', ') : 'Standard spot'}
      </Text>

      {holdReason ? (
        <Text style={styles.body}>Held by Parking Services: {holdReason}.</Text>
      ) : null}
      {!holdReason && reservation ? (
        <View style={styles.block}>
          <Text style={styles.body}>
            Reserved by {reservation.holder} · {reservation.code}
          </Text>
          <Text style={styles.meta}>Plate {reservation.plate} · {reservationWindow(reservation)}</Text>
        </View>
      ) : null}
      {!holdReason && !reservation && status === 'reserved' ? (
        <Text style={styles.body}>Held by Parking Services: pre-assigned reserved spot (sample data).</Text>
      ) : null}
      {status === 'occupied' ? (
        <Text style={styles.body}>A vehicle is parked here right now.</Text>
      ) : null}
      {!reservation && upcoming ? (
        <Text style={styles.meta}>
          Booked later: {upcoming.holder} · {upcoming.code} · {reservationWindow(upcoming)}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 12, color: colors.muted },
  body: { fontSize: 14, color: colors.ink },
  block: { gap: 2 },
});
