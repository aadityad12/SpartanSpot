import { useWindowDimensions, View, StyleSheet } from 'react-native';
import { ActivityFeed } from '../../components/admin/dashboard/ActivityFeed';
import { AlertsCard } from '../../components/admin/dashboard/AlertsCard';
import { GarageList } from '../../components/admin/dashboard/GarageList';
import { KpiRow } from '../../components/admin/dashboard/KpiRow';
import { OccupancyCard } from '../../components/admin/dashboard/OccupancyCard';
import { QuickActions } from '../../components/admin/dashboard/QuickActions';
import { useGarageStats } from '../../components/admin/dashboard/stats';
import { AdminHeader, Screen } from '../../components/kit';
import { useDemo } from '../../demo';

function greeting(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function AdminDashboardScreen() {
  const { admin } = useDemo();
  const { width } = useWindowDimensions();
  const { stats, campus } = useGarageStats();
  const wide = width >= 900;
  const now = new Date();
  const date = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const left = (
    <>
      <GarageList stats={stats} />
      <OccupancyCard currentPercent={campus.percent} />
    </>
  );
  const right = (
    <>
      <QuickActions />
      <AlertsCard stats={stats} />
      <ActivityFeed />
    </>
  );

  return (
    <Screen wide>
      <AdminHeader title={`${greeting(now.getHours())}, ${admin.name.split(' ')[0]}`} subtitle={date} />
      <KpiRow campus={campus} />
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.column}>{left}</View>
          <View style={styles.column}>{right}</View>
        </View>
      ) : (
        <>
          {left}
          {right}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { flex: 1, gap: 16 },
});
