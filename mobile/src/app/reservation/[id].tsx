import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MockQr } from '../../components/reservations/MockQr';
import { StatusBadge } from '../../components/reservations/StatusBadge';
import { SummaryRow } from '../../components/reservations/SummaryRow';
import {
  countdownText,
  formatMoney,
  liveStatus,
  reservationWindow,
  spotLine,
} from '../../components/reservations/format';
import { useNow } from '../../components/reservations/useNow';
import { Banner, Card, LicensePlate, Screen } from '../../components/kit';
import { Button, EmptyState, Icon, IconButton } from '../../components/ui';
import { useDemo } from '../../demo';
import { getGarage } from '../../mock/garages';
import { colors } from '../../theme';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/reservations');
}

export default function ReservationDetailsScreen() {
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  const { reservations, cancelReservation } = useDemo();
  const now = useNow();
  const [confirming, setConfirming] = useState(false);

  const reservation = reservations.find(item => item.id === id);

  if (!reservation) {
    return (
      <Screen edges={['top', 'bottom']}>
        <IconButton name="arrow-left" label="Go back" onPress={close} />
        <EmptyState
          icon="bookmark"
          title="Reservation not found"
          description="That reservation doesn't exist, or it was created before the demo restarted."
        />
        <Button title="Back to reservations" icon="list" onPress={() => router.replace('/reservations')} />
      </Screen>
    );
  }

  const garage = getGarage(reservation.garageId);
  const status = liveStatus(reservation, now);
  const countdown = countdownText(reservation, now);
  const cancellable = status === 'active' || status === 'upcoming';

  const cancel = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    cancelReservation(reservation.id);
    setConfirming(false);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <IconButton name="arrow-left" label="Go back" onPress={close} />

      {isNew === '1' && status !== 'cancelled' ? (
        <View style={styles.success}>
          <View style={styles.successIcon}>
            <Icon name="check" size={30} color={colors.white} />
          </View>
          <Text accessibilityRole="header" style={styles.successTitle}>You&apos;re all set!</Text>
          <Text style={styles.successText}>Your spot is reserved. Keep this code handy.</Text>
        </View>
      ) : (
        <Text accessibilityRole="header" style={styles.title}>Reservation details</Text>
      )}

      {status === 'cancelled' ? (
        <Banner tone="info" title="Reservation cancelled" message="This spot has been released for other students." />
      ) : null}

      <Card style={styles.codeCard}>
        <Text style={styles.codeLabel}>RESERVATION CODE</Text>
        <Text selectable style={styles.code}>{reservation.code}</Text>
        <MockQr code={reservation.code} />
        <Text style={styles.note}>Sample QR code for the demo.</Text>
      </Card>

      <Card>
        <View style={styles.statusRow}>
          <StatusBadge status={status} />
          {countdown ? <Text style={styles.countdown}>{countdown}</Text> : null}
        </View>
        <SummaryRow label="Garage" value={garage?.name ?? 'Unknown garage'} />
        {garage ? <SummaryRow label="Address" value={garage.address} /> : null}
        <SummaryRow label="Spot" value={spotLine(reservation.spotId)} />
        <SummaryRow label="When" value={reservationWindow(reservation)} />
        <SummaryRow label="Vehicle">
          <LicensePlate plate={reservation.plate} size="sm" />
        </SummaryRow>
        <SummaryRow label="Fee paid" value={formatMoney(reservation.fee)} />
      </Card>

      <Text style={styles.note}>
        Show this code or your plate to parking staff. Your spot appears as reserved (gold) to other students.
      </Text>

      <View style={styles.actions}>
        {garage ? (
          <Button
            title="View garage"
            icon="map-pin"
            secondary
            onPress={() => router.push({ pathname: '/lot/[id]', params: { id: garage.id } })}
          />
        ) : null}
        {cancellable ? (
          <>
            <Button
              title={confirming ? 'Tap again to confirm' : 'Cancel reservation'}
              icon="x-circle"
              secondary={!confirming}
              onPress={cancel}
            />
            {confirming ? (
              <Button title="Keep reservation" secondary onPress={() => setConfirming(false)} />
            ) : null}
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  success: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.available,
  },
  successTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  successText: { fontSize: 14, color: colors.muted },
  codeCard: { alignItems: 'center', gap: 12 },
  codeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, color: colors.muted },
  code: { fontSize: 34, fontWeight: '800', letterSpacing: 3, color: colors.primary },
  note: { fontSize: 13, lineHeight: 19, color: colors.muted, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6 },
  countdown: { fontSize: 13, fontWeight: '700', color: colors.primary },
  actions: { gap: 10 },
});
