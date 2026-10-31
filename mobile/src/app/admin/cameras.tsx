import { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { CameraList } from '../../components/admin/cameras/CameraList';
import { DetectionLog } from '../../components/admin/cameras/DetectionLog';
import { HealthStrip } from '../../components/admin/cameras/HealthStrip';
import { LiveView } from '../../components/admin/cameras/LiveView';
import { PipelineCard } from '../../components/admin/cameras/PipelineCard';
import { AdminHeader, Screen } from '../../components/kit';
import { cameras, getCamera } from '../../mock/cameras';

// South L1 has the most open stalls, so the first view shows both green and red boxes.
const defaultCameraId = 'S-L1-01';

export default function AdminCamerasScreen() {
  const { width } = useWindowDimensions();
  const [selectedId, setSelectedId] = useState(defaultCameraId);
  const camera = getCamera(selectedId) ?? cameras[0];
  const wide = width >= 900;

  const list = <CameraList cameras={cameras} selectedId={camera.id} onSelect={setSelectedId} />;
  const live = <LiveView camera={camera} />;
  const log = <DetectionLog cameraId={camera.id} />;
  const pipeline = <PipelineCard />;

  return (
    <Screen wide>
      <AdminHeader title="Camera detection" subtitle="Live spot detection from garage cameras" />
      <HealthStrip />
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.sidebar}>
            {list}
            {log}
          </View>
          <View style={styles.main}>
            {live}
            {pipeline}
          </View>
        </View>
      ) : (
        <>
          {list}
          {live}
          {log}
          {pipeline}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  sidebar: { flex: 4, gap: 16 },
  main: { flex: 6, gap: 16 },
});
