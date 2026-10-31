import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AboutGarage } from '../../components/garage/AboutGarage';
import { GarageHeader } from '../../components/garage/GarageHeader';
import { GarageTotals } from '../../components/garage/GarageTotals';
import { LevelBreakdown } from '../../components/garage/LevelBreakdown';
import { ParkedHereCard } from '../../components/garage/ParkedHereCard';
import { ReserveFooter, reserveFooterHeight } from '../../components/garage/ReserveFooter';
import { SpotDetailCard } from '../../components/garage/SpotDetailCard';
import { Card, ChipRow, Screen, SectionHeader, SpotGrid, SpotLegend } from '../../components/kit';
import { Button, EmptyState, IconButton } from '../../components/ui';
import { useDemo } from '../../demo';
import { garageSummary, getGarage, getSpots, type Spot } from '../../mock/garages';
import { useParking } from '../../store';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function LotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { favorites, toggleFavorite, park, session } = useParking();
  const { spotStatus, adminHolds } = useDemo();
  const [pickedLevel, setPickedLevel] = useState<number | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const garage = getGarage(id);
  const summary = useMemo(() => garageSummary(id, spotStatus), [id, spotStatus]);

  // Default to the level with the most open spaces; ties go to the lower level.
  const bestLevel = useMemo(
    () => summary.byLevel.reduce((best, item) => (item.available > best.available ? item : best), summary.byLevel[0])?.level ?? 1,
    [summary],
  );
  const level = pickedLevel ?? bestLevel;
  const levelSpots = useMemo(() => getSpots(id, level), [id, level]);

  if (!garage) {
    return (
      <Screen>
        <IconButton name="arrow-left" label="Go back" onPress={close} />
        <EmptyState
          icon="map-pin"
          title="Garage not found"
          description="That garage isn't in the sample data. Return to Find parking to pick one."
        />
        <Button title="Back to Find parking" icon="search" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const selectLevel = (next: number) => {
    setPickedLevel(next);
    setSelectedSpot(null);
  };

  const reserve = (spot?: Spot) => {
    router.push({
      pathname: '/reserve/[lotId]',
      params: spot ? { lotId: garage.id, spot: spot.id } : { lotId: garage.id },
    });
  };

  const parked = (note: string) => {
    park({
      lotId: garage.id,
      lotName: garage.name,
      startedAt: new Date().toISOString(),
      note,
      demo: true,
    });
    router.replace('/activity');
  };

  return (
    <View style={styles.root}>
      <Screen>
        <GarageHeader
          garage={garage}
          saved={favorites.includes(garage.id)}
          onBack={close}
          onToggleSaved={() => toggleFavorite(garage.id)}
        />

        <GarageTotals totals={summary} />

        <ChipRow
          options={summary.byLevel.map(item => ({
            value: String(item.level),
            label: `L${item.level} · ${item.available} open`,
          }))}
          value={String(level)}
          onChange={value => selectLevel(Number(value))}
        />

        <Card style={styles.mapCard}>
          <SectionHeader title={`Level ${level} spot map`} />
          <SpotGrid
            spots={levelSpots}
            statusOf={spotStatus}
            selectedId={selectedSpot?.id}
            onPressSpot={setSelectedSpot}
          />
          <SpotLegend />
        </Card>

        {selectedSpot ? (
          <SpotDetailCard
            garage={garage}
            spot={selectedSpot}
            status={spotStatus(selectedSpot)}
            holdReason={adminHolds[selectedSpot.id]}
            onReserve={() => reserve(selectedSpot)}
          />
        ) : null}

        <SectionHeader title="Levels" />
        <LevelBreakdown levels={summary.byLevel} selected={level} onSelect={selectLevel} />

        <SectionHeader title="About this garage" />
        <AboutGarage garage={garage} />

        <ParkedHereCard replacesLotName={session?.lotName} onParked={parked} />

        <View style={{ height: reserveFooterHeight - 32 }} />
      </Screen>
      <ReserveFooter onPress={() => reserve()} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapCard: { gap: 12 },
});
