import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../demo';
import type { Permit } from '../../mock/permits';
import { colors } from '../../theme';
import { Badge, LicensePlate } from '../kit';
import { Icon } from '../ui';
import { validRange } from './format';

const statusBadge = {
  active: { label: 'Active', tone: 'available', icon: 'check-circle' },
  unpaid: { label: 'Unpaid', tone: 'warning', icon: 'alert-triangle' },
  expired: { label: 'Expired', tone: 'occupied', icon: 'x-circle' },
} as const;

export function PermitCard({ permit, compact = false }: { permit: Permit | null; compact?: boolean }) {
  const { vehicles } = useDemo();

  if (!permit) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Icon name="credit-card" size={24} color={colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Choose a plan</Text>
        <Text style={styles.emptyText}>You have no parking permit yet. Pick a plan below to get your digital permit.</Text>
      </View>
    );
  }

  const badge = statusBadge[permit.status];

  return (
    <View
      accessible
      accessibilityLabel={`${permit.name}. ${badge.label}. Valid ${validRange(permit.validFrom, permit.validUntil)}. Confirmation ${permit.confirmation}.`}
      style={styles.shadow}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.stripe} />
        <View style={[styles.body, compact && styles.bodyCompact]}>
          <View style={styles.top}>
            <Text style={styles.brand}>SJSU PARKING</Text>
            <Badge label={badge.label} tone={badge.tone} icon={badge.icon} />
          </View>

          <Text style={[styles.name, compact && styles.nameCompact]}>{permit.name}</Text>
          <Text style={styles.valid}>Valid {validRange(permit.validFrom, permit.validUntil)}</Text>

          <View style={styles.plates}>
            {permit.plates.map(plate => (
              <LicensePlate
                key={plate}
                plate={plate}
                state={vehicles.find(vehicle => vehicle.plate === plate)?.state}
                size="sm"
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLabel}>CONFIRMATION</Text>
            <Text style={styles.footerValue}>{permit.confirmation}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 22,
    shadowColor: colors.primaryDeep,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: { borderRadius: 22, overflow: 'hidden' },
  stripe: { height: 8, backgroundColor: colors.gold },
  body: { padding: 20, gap: 8 },
  bodyCompact: { padding: 16, gap: 6 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.gold },
  name: { fontSize: 24, fontWeight: '700', letterSpacing: -0.6, color: colors.white, marginTop: 8 },
  nameCompact: { fontSize: 19, marginTop: 4 },
  valid: { fontSize: 13, color: 'rgba(255,255,255,0.78)' },
  plates: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: 'rgba(255,255,255,0.65)' },
  footerValue: { fontSize: 14, fontWeight: '700', letterSpacing: 1, color: colors.white },

  empty: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  emptyText: { fontSize: 13, lineHeight: 20, textAlign: 'center', color: colors.muted },
});
