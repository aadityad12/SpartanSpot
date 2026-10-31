import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../../theme';
import { Card, ListRow, SectionHeader } from '../../kit';

export function QuickActions() {
  return (
    <View style={styles.wrap}>
      <SectionHeader title="Quick actions" />
      <Card style={styles.card}>
        <ListRow icon="search" title="Check a plate" subtitle="Look up permit status" onPress={() => router.push('/admin/lookup')} />
        <View style={styles.divider} />
        <ListRow icon="layout" title="Reserve spots" subtitle="Hold spaces for events" onPress={() => router.push('/admin/spots')} />
        <View style={styles.divider} />
        <ListRow icon="file-text" title="Today's report" subtitle="Usage and violations" onPress={() => router.push('/admin/reports')} />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { paddingVertical: 4 },
  divider: { height: 1, backgroundColor: colors.border },
});
