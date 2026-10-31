import { StyleSheet, View } from 'react-native';
import { Banner, SectionHeader } from '../../kit';
import type { GarageStat } from './stats';

// The busiest garage is computed; the other two alerts are sample notices.
export function AlertsCard({ stats }: { stats: GarageStat[] }) {
  const busiest = [...stats].sort((first, second) => second.percent - first.percent)[0];

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Alerts" />
      {busiest && busiest.percent >= 80 ? (
        <Banner tone="warning" title={`${busiest.garage.name} at ${busiest.percent}%`} message="Few spaces left. Consider directing drivers elsewhere." />
      ) : null}
      <Banner tone="error" title="Camera W-4 offline" message="West Garage level 4 is not being monitored." />
      <Banner tone="info" title="Football game Saturday" message="Expect heavy demand at South Garage." />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
});
