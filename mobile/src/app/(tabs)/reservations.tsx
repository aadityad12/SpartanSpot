import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GaragePickerModal } from '../../components/reservations/GaragePickerModal';
import { LimitsCard } from '../../components/reservations/LimitsCard';
import { ReservationCard } from '../../components/reservations/ReservationCard';
import { liveStatus } from '../../components/reservations/format';
import { useNow } from '../../components/reservations/useNow';
import { PageHeader, Screen, SectionHeader } from '../../components/kit';
import { Button, EmptyState } from '../../components/ui';
import { useDemo } from '../../demo';

export default function ReservationsScreen() {
  const { reservations, rules, usage } = useDemo();
  const now = useNow();
  const [picking, setPicking] = useState(false);

  const { current, past } = useMemo(() => {
    const mine = reservations.map(reservation => ({ reservation, status: liveStatus(reservation, now) }));
    const byStart = (first: { reservation: { start: string } }, second: { reservation: { start: string } }) =>
      Date.parse(first.reservation.start) - Date.parse(second.reservation.start);
    return {
      current: mine
        .filter(item => item.status === 'active' || item.status === 'upcoming')
        // Active reservations first, then upcoming ones soonest-first.
        .sort((first, second) => (first.status === second.status ? byStart(first, second) : first.status === 'active' ? -1 : 1))
        .map(item => item.reservation),
      past: mine
        .filter(item => item.status === 'completed' || item.status === 'cancelled')
        .sort((first, second) => byStart(second, first))
        .map(item => item.reservation),
    };
  }, [reservations, now]);

  const open = (id: string) => router.push({ pathname: '/reservation/[id]', params: { id } });
  const pick = (garageId: string) => {
    setPicking(false);
    router.push({ pathname: '/reserve/[lotId]', params: { lotId: garageId } });
  };

  return (
    <Screen>
      <PageHeader
        eyebrow="Reservations"
        title="Your reserved spots"
        right={<Button title="New" icon="plus" onPress={() => setPicking(true)} />}
      />

      <LimitsCard usage={usage(new Date(now))} rules={rules} />

      <SectionHeader title="Active and upcoming" />
      {current.length > 0 ? (
        <View style={styles.list}>
          {current.map(reservation => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              now={now}
              onPress={() => open(reservation.id)}
            />
          ))}
        </View>
      ) : (
        <View>
          <EmptyState
            icon="bookmark"
            title="No reserved spots yet"
            description="Reserve a green spot ahead of time and it will be held for you."
          />
          <Button title="Reserve a spot" icon="arrow-right" onPress={() => setPicking(true)} />
        </View>
      )}

      {past.length > 0 ? (
        <>
          <SectionHeader title="Past" />
          <View style={styles.list}>
            {past.map(reservation => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                now={now}
                onPress={() => open(reservation.id)}
              />
            ))}
          </View>
        </>
      ) : null}

      <GaragePickerModal visible={picking} onClose={() => setPicking(false)} onPick={pick} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
