import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getGarage } from '../../mock/garages';
import type { Reservation } from '../../mock/reservations';
import { colors } from '../../theme';
import { Card } from '../kit';
import { Icon } from '../ui';
import { countdownText, liveStatus, reservationWindow, spotLine } from './format';
import { StatusBadge } from './StatusBadge';

export function ReservationCard({
  reservation,
  now,
  onPress,
}: {
  reservation: Reservation;
  now: number;
  onPress: () => void;
}) {
  const garage = getGarage(reservation.garageId);
  const status = liveStatus(reservation, now);
  const past = status === 'completed' || status === 'cancelled';
  const countdown = countdownText(reservation, now);
  const name = garage?.name ?? 'Unknown garage';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${spotLine(reservation.spotId)}, ${reservationWindow(reservation)}, ${status}`}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={[styles.card, past && styles.past]}>
        <View style={styles.top}>
          <Text style={styles.name}>{name}</Text>
          <StatusBadge status={status} />
        </View>
        <Text style={styles.spot}>{spotLine(reservation.spotId)}</Text>
        <View style={styles.line}>
          <Icon name="calendar" size={14} color={colors.muted} />
          <Text style={styles.window}>{reservationWindow(reservation)}</Text>
        </View>
        {countdown ? (
          <View style={styles.countdown}>
            <Icon name="clock" size={14} color={colors.primary} />
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  past: { opacity: 0.65, backgroundColor: colors.background },
  pressed: { opacity: 0.7 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink },
  spot: { fontSize: 14, fontWeight: '600', color: colors.ink },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  window: { fontSize: 13, color: colors.muted },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  countdownText: { fontSize: 12, fontWeight: '700', color: colors.primary },
});
