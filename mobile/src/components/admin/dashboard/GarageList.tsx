import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { Badge, Card, ProgressBar, SectionHeader } from '../../kit';
import { garageStatus, type GarageStat } from './stats';

export function GarageList({ stats }: { stats: GarageStat[] }) {
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Garages" actionLabel="Manage spots" onAction={() => router.push('/admin/spots')} />
      <Card padded={false}>
        {stats.map((stat, index) => {
          const status = garageStatus(stat.percent);
          return (
            <Pressable
              key={stat.garage.id}
              accessibilityRole="button"
              accessibilityLabel={`${stat.garage.name}, ${stat.occupied} of ${stat.total} occupied, ${status.label}. Open spot management.`}
              onPress={() => router.push('/admin/spots')}
              style={({ pressed }) => [styles.row, index > 0 && styles.divider, pressed && styles.pressed]}
            >
              <View style={styles.top}>
                <Text style={styles.name}>{stat.garage.name}</Text>
                <Badge label={`${status.label} · ${stat.percent}%`} tone={status.tone} icon={status.icon} />
              </View>
              <ProgressBar value={stat.occupied} max={stat.total} tone={status.tone} />
              <Text style={styles.count}>{stat.occupied} / {stat.total} occupied</Text>
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { padding: 16, gap: 10 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  pressed: { opacity: 0.7 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  name: { fontSize: 15, fontWeight: '700', color: colors.ink },
  count: { fontSize: 12, color: colors.muted },
});
