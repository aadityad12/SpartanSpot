import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Camera, CameraStatus } from '../../../mock/cameras';
import { getGarage } from '../../../mock/garages';
import { colors } from '../../../theme';
import { Badge, Card, SectionHeader } from '../../kit';
import { Icon } from '../../ui';
import { ageLabel } from './time';

const statusBadge: Record<CameraStatus, { label: string; tone: 'available' | 'warning' | 'occupied'; icon: 'check-circle' | 'alert-triangle' | 'x-circle' }> = {
  online: { label: 'Online', tone: 'available', icon: 'check-circle' },
  degraded: { label: 'Degraded', tone: 'warning', icon: 'alert-triangle' },
  offline: { label: 'Offline', tone: 'occupied', icon: 'x-circle' },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

function CameraCard({ camera, selected, onSelect }: { camera: Camera; selected: boolean; onSelect: () => void }) {
  const badge = statusBadge[camera.status];
  const offline = camera.status === 'offline';
  const garage = getGarage(camera.garageId);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Camera ${camera.id}, ${garage?.name ?? camera.garageId} level ${camera.level}, ${badge.label}`}
      accessibilityState={{ selected }}
      onPress={onSelect}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <Card style={[styles.card, selected && styles.selected]}>
      <View style={styles.top}>
        <View style={styles.icon}>
          <Icon name={offline ? 'video-off' : 'video'} size={18} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.id}>{camera.id}</Text>
          <Text style={styles.where}>{garage?.name ?? camera.garageId} · Level {camera.level}</Text>
        </View>
        <Badge label={badge.label} tone={badge.tone} icon={badge.icon} />
      </View>
      <View style={styles.stats}>
        <Stat label="FPS" value={offline ? '0.0' : camera.fps.toFixed(1)} />
        <Stat label="CONFIDENCE" value={offline ? 'n/a' : `${Math.round(camera.avgConfidence * 100)}%`} />
        <Stat label="LAST FRAME" value={ageLabel(camera.lastFrameSecondsAgo)} />
      </View>
      {selected ? <Text style={styles.viewing}>Viewing live</Text> : null}
      </Card>
    </Pressable>
  );
}

export function CameraList({
  cameras,
  selectedId,
  onSelect,
}: {
  cameras: Camera[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Cameras" />
      {cameras.map(camera => (
        <CameraCard
          key={camera.id}
          camera={camera}
          selected={camera.id === selectedId}
          onSelect={() => onSelect(camera.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  card: { gap: 12 },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  id: { fontSize: 15, fontWeight: '700', color: colors.ink },
  where: { fontSize: 12, color: colors.muted, marginTop: 1 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: colors.muted },
  statValue: { fontSize: 14, fontWeight: '600', color: colors.ink },
  viewing: { fontSize: 11, fontWeight: '700', color: colors.primary },
});
