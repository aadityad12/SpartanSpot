import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../../demo';
import { getGarage, getSpot } from '../../../mock/garages';
import type { Reservation } from '../../../mock/reservations';
import { colors } from '../../../theme';
import { formatWindow, liveStatus } from '../../reservations/format';
import { StatusBadge } from '../../reservations/StatusBadge';
import { useNow } from '../../reservations/useNow';
import { Card, SectionHeader } from '../../kit';
import { EmptyState } from '../../ui';
import { ActionButton } from './ActionButton';

// Below this card width the columns no longer fit, so each reservation becomes a stacked card.
const TABLE_MIN_WIDTH = 460;

function isSameDay(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear()
    && first.getMonth() === second.getMonth()
    && first.getDate() === second.getDate();
}

function describe(reservation: Reservation) {
  const spot = getSpot(reservation.spotId);
  return {
    garage: getGarage(reservation.garageId)?.shortName ?? reservation.garageId,
    spot: spot ? `L${spot.level} · ${spot.label}` : 'Unknown spot',
    window: formatWindow(new Date(reservation.start), new Date(reservation.end)),
  };
}

function ReleaseAction({
  reservation,
  confirming,
  onAsk,
  onCancel,
  onConfirm,
}: {
  reservation: Reservation;
  confirming: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (confirming) {
    return (
      <View style={styles.confirm}>
        <Text style={styles.confirmText}>Release?</Text>
        <ActionButton
          label="Yes"
          tone="danger"
          accessibilityLabel={`Confirm release of reservation ${reservation.code}`}
          onPress={onConfirm}
        />
        <ActionButton label="No" tone="quiet" accessibilityLabel="Keep reservation" onPress={onCancel} />
      </View>
    );
  }
  return (
    <ActionButton
      label="Release"
      tone="quiet"
      accessibilityLabel={`Release reservation ${reservation.code}`}
      onPress={onAsk}
    />
  );
}

export function ReservationsCard() {
  const { reservations, cancelReservation } = useDemo();
  const now = useNow();
  const [width, setWidth] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const tabular = width >= TABLE_MIN_WIDTH;

  const today = new Date(now);
  const rows = reservations
    .filter(item => {
      const status = liveStatus(item, now);
      return status === 'active' || status === 'upcoming' || isSameDay(new Date(item.start), today);
    })
    .sort((first, second) => Date.parse(first.start) - Date.parse(second.start));

  const releasable = (item: Reservation) => {
    const status = liveStatus(item, now);
    return status === 'active' || status === 'upcoming';
  };

  const action = (item: Reservation) => (releasable(item) ? (
    <ReleaseAction
      reservation={item}
      confirming={confirmId === item.id}
      onAsk={() => setConfirmId(item.id)}
      onCancel={() => setConfirmId(null)}
      onConfirm={() => {
        cancelReservation(item.id);
        setConfirmId(null);
      }}
    />
  ) : null);

  return (
    <Card style={styles.card}>
      <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={styles.card}>
        <SectionHeader title="Today's reservations" />
        {rows.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No reservations today"
            description="Student bookings that are active or upcoming appear here."
          />
        ) : null}

        {rows.length > 0 && tabular ? (
          <View>
            <View style={styles.tableRow}>
              <Text style={[styles.head, styles.colCode]}>CODE</Text>
              <Text style={[styles.head, styles.colHolder]}>HOLDER · PLATE</Text>
              <Text style={[styles.head, styles.colSpot]}>SPOT</Text>
              <Text style={[styles.head, styles.colTime]}>TIME</Text>
              <Text style={[styles.head, styles.colStatus]}>STATUS</Text>
            </View>
            {rows.map(item => {
              const info = describe(item);
              return (
                <View key={item.id} style={[styles.tableRow, styles.bodyRow]}>
                  <Text style={[styles.code, styles.colCode]}>{item.code}</Text>
                  <View style={styles.colHolder}>
                    <Text style={styles.value}>{item.holder}</Text>
                    <Text style={styles.sub}>{item.plate}</Text>
                  </View>
                  <View style={styles.colSpot}>
                    <Text style={styles.value}>{info.garage}</Text>
                    <Text style={styles.sub}>{info.spot}</Text>
                  </View>
                  <Text style={[styles.sub, styles.colTime]}>{info.window}</Text>
                  <View style={[styles.colStatus, styles.statusCell]}>
                    <StatusBadge status={liveStatus(item, now)} />
                    {action(item)}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {rows.length > 0 && !tabular ? rows.map(item => {
          const info = describe(item);
          return (
            <View key={item.id} style={styles.stacked}>
              <View style={styles.stackedTop}>
                <Text style={styles.code}>{item.code}</Text>
                <StatusBadge status={liveStatus(item, now)} />
              </View>
              <Text style={styles.value}>{item.holder} · {item.plate}</Text>
              <Text style={styles.sub}>{info.garage} · {info.spot}</Text>
              <Text style={styles.sub}>{info.window}</Text>
              {releasable(item) ? <View style={styles.stackedAction}>{action(item)}</View> : null}
            </View>
          );
        }) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  tableRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bodyRow: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  head: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.muted, paddingBottom: 6 },
  colCode: { flex: 1.1 },
  colHolder: { flex: 1.4 },
  colSpot: { flex: 1.1 },
  colTime: { flex: 1.6 },
  colStatus: { flex: 1.4 },
  statusCell: { gap: 6, alignItems: 'flex-start' },
  code: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5, color: colors.primary },
  value: { fontSize: 13, fontWeight: '600', color: colors.ink },
  sub: { fontSize: 12, color: colors.muted },
  stacked: {
    gap: 3,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  stackedTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stackedAction: { marginTop: 6, alignItems: 'flex-start' },
  confirm: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  confirmText: { fontSize: 12, fontWeight: '600', color: colors.red },
});
