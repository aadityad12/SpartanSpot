import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../../demo';
import { garages, getGarage, getSpots, type Spot } from '../../../mock/garages';
import { colors } from '../../../theme';
import { useNow } from '../../reservations/useNow';
import { Banner, Card, ChipRow, SectionHeader, SegmentedControl, SpotGrid, SpotLegend } from '../../kit';
import { HoldsList } from './HoldsList';
import { HoldTools } from './HoldTools';
import {
  currentReservation,
  nextReservation,
  pluralize,
  splitReserved,
  type HoldReason,
} from './holds';
import { LevelSummary } from './LevelSummary';
import { SpotInfoCard } from './SpotInfoCard';

type Mode = 'view' | 'hold';
type Notice = { tone: 'info' | 'success' | 'warning'; title: string; message?: string };

export function SpotMapCard() {
  const { adminHolds, setAdminHold, spotStatus, reservations } = useDemo();
  const now = useNow();
  const [garageId, setGarageId] = useState(garages[0].id);
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState<Mode>('view');
  const [reason, setReason] = useState<HoldReason>('Event');
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [notice, setNotice] = useState<Notice | null>(null);

  const garage = getGarage(garageId) ?? garages[0];
  const spots = getSpots(garage.id, level);
  const selected = spots.find(spot => spot.id === selectedId);
  const heldSpots = spots.filter(spot => adminHolds[spot.id]);

  let available = 0;
  let occupied = 0;
  for (const spot of spots) {
    const status = spotStatus(spot);
    if (status === 'available') available += 1;
    else if (status === 'occupied') occupied += 1;
  }
  const reserved = splitReserved(spots, reservations, adminHolds, now);

  const resetSelection = () => {
    setSelectedId(undefined);
    setNotice(null);
  };

  const changeGarage = (id: string) => {
    setGarageId(id);
    setLevel(1);
    resetSelection();
  };

  const changeLevel = (value: string) => {
    setLevel(Number(value));
    resetSelection();
  };

  const changeMode = (next: Mode) => {
    setMode(next);
    resetSelection();
  };

  const release = (spot: Spot) => {
    setAdminHold(spot.id, null);
    setNotice({ tone: 'success', title: `Released spot ${spot.label}`, message: 'Students can book it again.' });
  };

  const handleSpot = (spot: Spot) => {
    if (mode === 'view') {
      setSelectedId(spot.id);
      return;
    }
    if (adminHolds[spot.id]) {
      release(spot);
      return;
    }
    const status = spotStatus(spot);
    if (status === 'available') {
      setAdminHold(spot.id, reason);
      setNotice({ tone: 'success', title: `Held spot ${spot.label} for ${reason}`, message: 'It now shows as reserved to students.' });
    } else if (status === 'occupied') {
      setNotice({
        tone: 'warning',
        title: `Spot ${spot.label} is occupied`,
        message: 'A vehicle is parked there, so it can only be held after it leaves.',
      });
    } else {
      const booking = currentReservation(spot, reservations, now);
      setNotice({
        tone: 'warning',
        title: `Spot ${spot.label} is already reserved`,
        message: booking
          ? `A student booking (${booking.code}) covers it. Release that reservation below to free the spot.`
          : 'It was pre-assigned by Parking Services in the sample data and cannot be changed here.',
      });
    }
  };

  const holdRow = (row: string) => {
    const targets = spots.filter(spot => spot.row === row && spotStatus(spot) === 'available');
    targets.forEach(spot => setAdminHold(spot.id, reason));
    setNotice({
      tone: 'success',
      title: `Held ${pluralize(targets.length, 'spot')} in row ${row}`,
      message: `Reason: ${reason}.`,
    });
  };

  const releaseAll = () => {
    heldSpots.forEach(spot => setAdminHold(spot.id, null));
    setNotice({ tone: 'success', title: `Released ${pluralize(heldSpots.length, 'hold')} on level ${level}` });
  };

  return (
    <View style={styles.wrap}>
      <Card style={styles.card}>
        <SectionHeader title="Spot map" />
        <ChipRow
          options={garages.map(item => ({ value: item.id, label: item.shortName }))}
          value={garage.id}
          onChange={changeGarage}
        />
        {garage.levels > 1 ? (
          <ChipRow
            options={Array.from({ length: garage.levels }, (_, index) => ({
              value: String(index + 1),
              label: `Level ${index + 1}`,
            }))}
            value={String(level)}
            onChange={changeLevel}
          />
        ) : null}
        <LevelSummary available={available} occupied={occupied} reserved={reserved} />

        <SegmentedControl
          options={[
            { value: 'view', label: 'View' },
            { value: 'hold', label: 'Hold spots' },
          ]}
          value={mode}
          onChange={changeMode}
        />

        {mode === 'hold' ? (
          <HoldTools
            // Remount per garage so the row picker starts on a row that exists there.
            key={garage.id}
            reason={reason}
            onReasonChange={setReason}
            rows={garage.rows}
            holdableInRow={row => spots.filter(spot => spot.row === row && spotStatus(spot) === 'available').length}
            onHoldRow={holdRow}
            heldCount={heldSpots.length}
            onReleaseAll={releaseAll}
          />
        ) : (
          <Text style={styles.hint}>Tap a spot to see its details and who holds it.</Text>
        )}

        {notice ? <Banner {...notice} onClose={() => setNotice(null)} /> : null}

        <SpotGrid
          spots={spots}
          statusOf={spotStatus}
          selectedId={mode === 'view' ? selectedId : undefined}
          onPressSpot={handleSpot}
        />
        <SpotLegend />
        <Text style={styles.note}>Held spots appear gold (reserved) to students and can&apos;t be booked.</Text>
      </Card>

      {mode === 'view' && selected ? (
        <SpotInfoCard
          spot={selected}
          status={spotStatus(selected)}
          holdReason={adminHolds[selected.id]}
          reservation={currentReservation(selected, reservations, now)}
          upcoming={nextReservation(selected, reservations, now)}
        />
      ) : null}

      <HoldsList spots={heldSpots} holds={adminHolds} onRelease={release} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  card: { gap: 12 },
  hint: { fontSize: 13, color: colors.muted },
  note: { fontSize: 12, color: colors.muted },
});
