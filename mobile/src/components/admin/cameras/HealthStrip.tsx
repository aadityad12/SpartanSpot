import { StyleSheet, View } from 'react-native';
import { Badge } from '../../kit';

// Sample health indicators for the layers behind the camera feed.
export function HealthStrip() {
  return (
    <View style={styles.row}>
      <Badge label="Detector service · running" tone="available" icon="check-circle" />
      <Badge label="Database sync · 2 s ago" tone="available" icon="database" />
      <Badge label="API · healthy" tone="available" icon="activity" />
      <Badge label="Model · YOLO11n parking-v3" tone="primary" icon="cpu" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
