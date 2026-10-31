import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { paymentMethods } from '../../mock/permits';
import type { Vehicle } from '../../mock/people';
import { colors } from '../../theme';
import { Banner, Card, LicensePlate } from '../kit';
import { Icon, type IconName } from '../ui';
import { RESERVATION_FEE, formatMoney } from './format';

function Radio({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.radio, checked && styles.radioOn]}>
      {checked ? <Icon name="check" size={12} color={colors.white} /> : null}
    </View>
  );
}

function Option({
  label,
  checked,
  onPress,
  children,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={[styles.option, checked && styles.optionOn]}
    >
      {children}
      <Radio checked={checked} />
    </Pressable>
  );
}

export function PaymentStep({
  methodId,
  onMethodChange,
  vehicles,
  vehicleId,
  onVehicleChange,
}: {
  methodId: string;
  onMethodChange: (id: string) => void;
  vehicles: Vehicle[];
  vehicleId: string | null;
  onVehicleChange: (id: string) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Card style={styles.fee}>
        <Text style={styles.feeLabel}>RESERVATION FEE</Text>
        <Text style={styles.feeValue}>{formatMoney(RESERVATION_FEE)}</Text>
        <Text style={styles.note}>Flat fee per reservation (sample pricing).</Text>
      </Card>

      <View style={styles.group}>
        <Text style={styles.label}>Payment method</Text>
        {paymentMethods.map(method => (
          <Option
            key={method.id}
            label={`${method.label}. ${method.detail}`}
            checked={method.id === methodId}
            onPress={() => onMethodChange(method.id)}
          >
            <View style={styles.icon}>
              <Icon name={method.icon as IconName} size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.optionTitle}>{method.label}</Text>
              <Text style={styles.note}>{method.detail}</Text>
            </View>
          </Option>
        ))}
        <Text style={styles.note}>Demo only: no card is charged.</Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.label}>Covered vehicle</Text>
        {vehicles.length === 0 ? (
          <Banner
            tone="warning"
            title="No vehicles on file"
            message="Add a vehicle in Account before reserving a spot."
          />
        ) : (
          vehicles.map(vehicle => (
            <Option
              key={vehicle.id}
              label={`${vehicle.make} ${vehicle.model}, plate ${vehicle.plate}`}
              checked={vehicle.id === vehicleId}
              onPress={() => onVehicleChange(vehicle.id)}
            >
              <View style={styles.flex}>
                <LicensePlate plate={vehicle.plate} state={vehicle.state} size="sm" />
                <Text style={[styles.note, styles.vehicleNote]}>
                  {vehicle.color} {vehicle.make} {vehicle.model}{vehicle.primary ? ' · Primary' : ''}
                </Text>
              </View>
            </Option>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  flex: { flex: 1 },
  group: { gap: 8 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink },
  note: { fontSize: 12, color: colors.muted },
  fee: { gap: 4 },
  feeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  feeValue: { fontSize: 28, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionTitle: { fontSize: 14, fontWeight: '600', color: colors.ink },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary, backgroundColor: colors.primary },
  vehicleNote: { marginTop: 6 },
});
