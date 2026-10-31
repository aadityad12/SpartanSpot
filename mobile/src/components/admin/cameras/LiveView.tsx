import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useDemo } from '../../../demo';
import { cameraSpots, cameraTitle, type Camera } from '../../../mock/cameras';
import { colors } from '../../../theme';
import { Banner, Card, SectionHeader, SpotLegend } from '../../kit';
import { useNow } from '../../reservations/useNow';
import { CameraFeed } from './CameraFeed';

function summaryText(occupied: number, available: number, reserved: number): string {
  return `Detected ${occupied} occupied · ${available} available · ${reserved} reserved in view`;
}

export function LiveView({ camera }: { camera: Camera }) {
  const { spotStatus } = useDemo();
  const now = useNow(1000);
  const [showBoxes, setShowBoxes] = useState(true);
  const spots = cameraSpots(camera);
  const offline = camera.status === 'offline';

  let occupied = 0;
  let available = 0;
  let reserved = 0;
  for (const spot of spots) {
    const status = spotStatus(spot);
    if (status === 'occupied') occupied += 1;
    else if (status === 'available') available += 1;
    else if (status === 'reserved') reserved += 1;
  }

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Live view" />
      <Card style={styles.card}>
        <Text style={styles.title}>{cameraTitle(camera)}</Text>
        <CameraFeed
          camera={camera}
          spots={spots}
          statusOf={spotStatus}
          showBoxes={showBoxes}
          now={now}
          garageLabel={cameraTitle(camera).toUpperCase().replace(' GARAGE · LEVEL ', ' · L')}
        />

        {offline ? null : (
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Show detection boxes</Text>
            <Switch
              accessibilityLabel="Show detection boxes"
              value={showBoxes}
              onValueChange={setShowBoxes}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
        )}

        {offline ? (
          <Banner
            tone="error"
            title="No detections: camera offline"
            message={`${spots.length} spots on this level are not being monitored. Their last known status is shown on the level map.`}
          />
        ) : (
          <>
            <Text style={styles.summary}>{summaryText(occupied, available, reserved)}</Text>
            {camera.status === 'degraded' ? (
              <Banner
                tone="warning"
                title="Low frame rate"
                message="Frames are arriving slowly, so detections lag and confidence is lower than usual."
              />
            ) : null}
            <SpotLegend />
          </>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { gap: 12 },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  summary: { fontSize: 13, fontWeight: '600', color: colors.ink },
});
