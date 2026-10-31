import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { detectionLog, type DetectionEvent } from '../../../mock/cameras';
import { colors, statusColor } from '../../../theme';
import { Card, SectionHeader, SegmentedControl } from '../../kit';
import { Icon } from '../../ui';
import { clockTime } from './time';

type Scope = 'camera' | 'all';

function Row({ event, showCamera }: { event: DetectionEvent; showCamera: boolean }) {
  return (
    <View style={styles.row}>
      <View style={styles.when}>
        <Text style={styles.time}>{clockTime(Date.parse(event.at))}</Text>
        {showCamera ? <Text style={styles.camera}>{event.cameraId}</Text> : null}
      </View>
      <Text style={styles.spot}>{event.spotLabel}</Text>
      <View style={styles.change}>
        <Text style={[styles.state, { color: statusColor[event.from] }]}>{event.from}</Text>
        <Icon name="arrow-right" size={13} color={colors.muted} />
        <Text style={[styles.state, { color: statusColor[event.to] }]}>{event.to}</Text>
      </View>
      <Text style={styles.confidence}>{event.confidence.toFixed(2)}</Text>
    </View>
  );
}

export function DetectionLog({ cameraId }: { cameraId: string }) {
  const [scope, setScope] = useState<Scope>('camera');
  const events = scope === 'all' ? detectionLog : detectionLog.filter(event => event.cameraId === cameraId);

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Detection log" />
      <SegmentedControl
        options={[
          { value: 'camera', label: cameraId },
          { value: 'all', label: 'All cameras' },
        ]}
        value={scope}
        onChange={setScope}
      />
      <Card padded={false}>
        {events.length === 0 ? (
          <Text style={styles.empty}>No state changes recorded for {cameraId} in the last hour.</Text>
        ) : (
          events.map((event, index) => (
            <View key={`${event.at}-${event.spotLabel}`} style={index > 0 && styles.divider}>
              <Row event={event} showCamera={scope === 'all'} />
            </View>
          ))
        )}
      </Card>
      <Text style={styles.note}>Sample data</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 11 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  when: { width: 78 },
  time: { fontSize: 12, color: colors.ink },
  camera: { fontSize: 10, color: colors.muted, marginTop: 1 },
  spot: { width: 52, fontSize: 13, fontWeight: '700', color: colors.ink },
  change: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  state: { fontSize: 12, fontWeight: '600' },
  confidence: { fontSize: 12, fontWeight: '600', color: colors.muted, width: 34, textAlign: 'right' },
  empty: { padding: 16, fontSize: 13, color: colors.muted },
  note: { fontSize: 11, color: colors.muted },
});
