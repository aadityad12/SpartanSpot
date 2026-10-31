import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { ReservationsCard } from '../../components/admin/spots/ReservationsCard';
import { RulesCard } from '../../components/admin/spots/RulesCard';
import { SpotMapCard } from '../../components/admin/spots/SpotMapCard';
import { AdminHeader, Screen } from '../../components/kit';

export default function AdminSpotsScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const right = (
    <>
      <RulesCard />
      <ReservationsCard />
    </>
  );

  return (
    <Screen wide>
      <AdminHeader
        title="Spots & reservations"
        subtitle="Hold spots for events or faculty and tune the limits students see."
      />
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.column}>
            <SpotMapCard />
          </View>
          <View style={styles.column}>{right}</View>
        </View>
      ) : (
        <>
          <SpotMapCard />
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
