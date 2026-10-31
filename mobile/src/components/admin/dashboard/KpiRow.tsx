import { StyleSheet, View } from 'react-native';
import { StatTile } from '../../kit';
import { useNow } from '../../reservations/useNow';
import { CAMERAS_ONLINE, CAMERAS_TOTAL, violationsToday, type GarageStat } from './stats';

export function KpiRow({ campus }: { campus: Omit<GarageStat, 'garage'> }) {
  const now = useNow();
  return (
    <View style={styles.row}>
      <StatTile label="Total spaces" value={campus.total} sublabel="Across 4 locations" icon="grid" />
      <StatTile
        label="Occupied"
        value={campus.occupied}
        sublabel={`${campus.percent}% full`}
        tone="occupied"
        icon="x-circle"
      />
      <StatTile label="Available" value={campus.available} sublabel="Open right now" tone="available" icon="check-circle" />
      <StatTile label="Reserved" value={campus.reserved} sublabel="Held for later" tone="reserved" icon="bookmark" />
      <StatTile
        label="Violations today"
        value={violationsToday(now)}
        sublabel="Flagged by lookup"
        tone="warning"
        icon="alert-triangle"
      />
      <StatTile
        label="Cameras online"
        value={`${CAMERAS_ONLINE}/${CAMERAS_TOTAL}`}
        sublabel="1 needs attention"
        tone="primary"
        icon="video"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
