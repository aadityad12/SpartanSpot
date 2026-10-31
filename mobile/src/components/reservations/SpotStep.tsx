import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../demo';
import { garageSummary, getSpots, type Garage, type Spot, type SpotFeature, type SpotStatus } from '../../mock/garages';
import { colors } from '../../theme';
import { Badge, Banner, Card, Chip, ChipRow, SectionHeader, SpotGrid, SpotLegend } from '../kit';
import type { IconName } from '../ui';

const filterOptions: { feature: SpotFeature; label: string; icon: IconName }[] = [
  { feature: 'elevator', label: 'Near elevator', icon: 'chevrons-up' },
  { feature: 'accessible', label: 'Accessible', icon: 'user' },
  { feature: 'ev', label: 'EV charging', icon: 'zap' },
];

const featureLabel: Record<SpotFeature, string> = {
  elevator: 'Near elevator',
  accessible: 'Accessible',
  ev: 'EV charging',
  compact: 'Compact',
};

export function SpotStep({
  garage,
  level,
  onLevelChange,
  selectedId,
  onSelect,
  initialError,
}: {
  garage: Garage;
  level: number;
  onLevelChange: (level: number) => void;
  selectedId: string | null;
  onSelect: (spot: Spot | null) => void;
  initialError?: string | null;
}) {
  const { spotStatus } = useDemo();
  const [filters, setFilters] = useState<SpotFeature[]>([]);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const summary = useMemo(() => garageSummary(garage.id, spotStatus), [garage.id, spotStatus]);
  const spots = useMemo(() => getSpots(garage.id, level), [garage.id, level]);
  const selected = selectedId ? spots.find(spot => spot.id === selectedId) : undefined;

  const matches = (spot: Spot) => filters.every(feature => spot.features.includes(feature));

  // Free spots that lack a requested feature show as gray so matching ones stand out.
  const statusOf = (spot: Spot): SpotStatus => {
    const status = spotStatus(spot);
    return status === 'available' && !matches(spot) ? 'unknown' : status;
  };

  const press = (spot: Spot) => {
    const status = spotStatus(spot);
    if (status !== 'available') {
      setError(`Spot ${spot.label} is ${status} right now. Pick a green spot.`);
      onSelect(null);
      return;
    }
    if (!matches(spot)) return;
    setError(null);
    onSelect(spot);
  };

  const toggle = (feature: SpotFeature) => {
    setFilters(current => (current.includes(feature) ? current.filter(item => item !== feature) : [...current, feature]));
  };

  return (
    <View style={styles.wrap}>
      <ChipRow
        options={summary.byLevel.map(item => ({
          value: String(item.level),
          label: `L${item.level} · ${item.available} open`,
        }))}
        value={String(level)}
        onChange={value => {
          setError(null);
          onLevelChange(Number(value));
        }}
      />

      <View style={styles.filters}>
        {filterOptions.map(option => (
          <Chip
            key={option.feature}
            label={option.label}
            icon={option.icon}
            selected={filters.includes(option.feature)}
            onPress={() => toggle(option.feature)}
          />
        ))}
      </View>

      {error ? <Banner tone="error" title="Spot not available" message={error} onClose={() => setError(null)} /> : null}

      <Card style={styles.mapCard}>
        <SectionHeader title={`Level ${level} · pick a green spot`} />
        <SpotGrid spots={spots} statusOf={statusOf} selectedId={selectedId ?? undefined} onPressSpot={press} />
        <SpotLegend />
        {filters.length > 0 ? (
          <Text style={styles.note}>Gray spots are free but don&apos;t have the features you filtered for.</Text>
        ) : null}
      </Card>

      {selected ? (
        <Card style={styles.detail}>
          <Text style={styles.detailTitle}>Spot {selected.label}</Text>
          <Text style={styles.detailLine}>
            Level {selected.level} of {garage.levels}, floor {selected.level}
          </Text>
          <Text style={styles.detailLine}>
            {selected.features.includes('elevator')
              ? 'Right next to the elevator and stairs.'
              : 'A short walk from the elevator and stairs.'}
          </Text>
          <View style={styles.badges}>
            {selected.features.length > 0 ? (
              selected.features.map(feature => <Badge key={feature} label={featureLabel[feature]} tone="primary" />)
            ) : (
              <Badge label="Standard spot" tone="neutral" />
            )}
          </View>
        </Card>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mapCard: { gap: 12 },
  note: { fontSize: 12, color: colors.muted },
  detail: { gap: 6 },
  detailTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  detailLine: { fontSize: 13, color: colors.muted },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
});
