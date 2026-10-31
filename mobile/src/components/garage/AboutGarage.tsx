import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import type { Garage } from '../../mock/garages';
import { Badge, Card } from '../kit';
import { Icon, type IconName } from '../ui';

const amenityIcons: Record<string, IconName> = {
  Covered: 'umbrella',
  'EV charging': 'zap',
  Accessible: 'user-check',
};

export function AboutGarage({ garage }: { garage: Garage }) {
  return (
    <Card style={styles.card}>
      <Text style={styles.description}>{garage.description}</Text>

      <View style={styles.facts}>
        <View style={styles.fact}>
          <Icon name="clock" size={16} color={colors.primary} />
          <Text style={styles.factText}>{garage.hours}</Text>
        </View>
        <View style={styles.fact}>
          <Icon name="map-pin" size={16} color={colors.primary} />
          <Text style={styles.factText}>Approx. {garage.walkMinutes} min to Student Union</Text>
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>PERMITS ACCEPTED</Text>
        <View style={styles.wrapRow}>
          {garage.permits.map(permit => (
            <Badge key={permit} label={permit} tone="primary" />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>AMENITIES</Text>
        <View style={styles.wrapRow}>
          {garage.amenities.map(amenity => (
            <View key={amenity} style={styles.amenity}>
              <Icon name={amenityIcons[amenity] ?? 'check'} size={13} color={colors.primary} />
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  description: { fontSize: 14, lineHeight: 21, color: colors.ink },
  facts: { gap: 8 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  factText: { fontSize: 14, color: colors.ink },
  group: { gap: 8 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  amenityText: { fontSize: 12, fontWeight: '600', color: colors.primary },
});
