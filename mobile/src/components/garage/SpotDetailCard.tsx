import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import type { Garage, Spot, SpotFeature, SpotStatus } from '../../mock/garages';
import { Badge, Card } from '../kit';
import { Button } from '../ui';

const featureLabel: Record<SpotFeature, string> = {
  elevator: 'Near elevator',
  accessible: 'Accessible',
  ev: 'EV charging',
  compact: 'Compact',
};

// Deterministic so the same spot always shows the same "last seen" detail.
function detection(spot: Spot) {
  return { camera: Math.ceil(spot.number / 4), minutes: ((spot.number * 7) % 9) + 1 };
}

export function SpotDetailCard({
  garage,
  spot,
  status,
  holdReason,
  onReserve,
}: {
  garage: Garage;
  spot: Spot;
  status: SpotStatus;
  holdReason?: string;
  onReserve: () => void;
}) {
  const features = spot.features.map(feature => featureLabel[feature]);
  const summary = [`Spot ${spot.label}`, `Level ${spot.level}`, ...features].join(' · ');
  const seen = detection(spot);

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.summary}>{summary}</Text>
        {status === 'available' ? <Badge label="Available" tone="available" icon="check-circle" /> : null}
        {status === 'occupied' ? <Badge label="Occupied" tone="occupied" icon="x-circle" /> : null}
        {status === 'reserved' ? <Badge label="Reserved" tone="reserved" icon="bookmark" /> : null}
      </View>

      {status === 'available' ? (
        <Button
          title="Reserve this spot"
          icon="arrow-right"
          onPress={onReserve}
        />
      ) : null}

      {status === 'occupied' ? (
        <>
          <Text style={styles.body}>
            {garage.cameraMonitored
              ? `Occupied — detected by camera ${seen.camera} ${seen.minutes} min ago`
              : 'Occupied — estimated from entry counts'}
          </Text>
          <Text style={styles.note}>
            Occupied spaces can&apos;t be reserved. Pick a green spot, or check another level.
          </Text>
        </>
      ) : null}

      {status === 'reserved' ? (
        <>
          <Text style={styles.body}>
            {holdReason ? 'Reserved — Held by Parking Services' : 'Reserved — Reserved by a student'}
          </Text>
          <Text style={styles.note}>
            {holdReason
              ? `Reason: ${holdReason}. Held spaces can't be reserved.`
              : "Someone has already reserved this spot for the current time, so it can't be reserved again."}
          </Text>
        </>
      ) : null}

      {status === 'unknown' ? (
        <Text style={styles.note}>The camera can&apos;t tell whether this spot is free, so it can&apos;t be reserved.</Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  top: { gap: 8 },
  summary: { fontSize: 15, fontWeight: '700', color: colors.ink },
  body: { fontSize: 14, color: colors.ink },
  note: { fontSize: 13, lineHeight: 19, color: colors.muted },
});
