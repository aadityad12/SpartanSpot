import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../demo';
import { paymentMethods, type Permit, type Plan } from '../../mock/permits';
import { colors } from '../../theme';
import { Banner, Card, ChipRow, LicensePlate, SectionHeader } from '../kit';
import { formatMoney } from '../reservations/format';
import { Button, Icon, type IconName } from '../ui';
import { OptionCard } from './OptionCard';
import { PROCESSING_FEE, termOptions } from './format';

const MAX_VEHICLES = 2;

function TotalRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <Text style={[styles.totalLabel, strong && styles.totalStrong]}>{label}</Text>
      <Text style={[styles.totalValue, strong && styles.totalStrong]}>{value}</Text>
    </View>
  );
}

export function CheckoutForm({ plan, onPaid }: { plan: Plan; onPaid: (permit: Permit) => void }) {
  const { vehicles, purchasePlan } = useDemo();
  const terms = termOptions(plan.id, Date.now());
  const [term, setTerm] = useState(terms[0].value);
  const [methodId, setMethodId] = useState(paymentMethods[0].id);
  // Start with the primary vehicle ticked so the common case is one tap to pay.
  const [selected, setSelected] = useState<string[]>(() => {
    const primary = vehicles.find(vehicle => vehicle.primary) ?? vehicles[0];
    return primary ? [primary.id] : [];
  });

  const total = plan.price + PROCESSING_FEE;
  // Keep only vehicles that still exist, in the order the student sees them.
  const chosen = vehicles.filter(vehicle => selected.includes(vehicle.id));
  const atLimit = chosen.length >= MAX_VEHICLES;

  const toggle = (id: string) => {
    setSelected(current => {
      if (current.includes(id)) return current.filter(item => item !== id);
      return current.length >= MAX_VEHICLES ? current : [...current, id];
    });
  };

  const pay = () => {
    if (chosen.length === 0) return;
    onPaid(purchasePlan(plan.id, chosen.map(vehicle => vehicle.plate)));
  };

  return (
    <View style={styles.wrap}>
      <Card style={styles.summary}>
        <Text style={styles.eyebrow}>PLAN SUMMARY</Text>
        <Text style={styles.planName}>{plan.name} permit</Text>
        <Text style={styles.price}>{formatMoney(plan.price)} <Text style={styles.period}>{plan.period}</Text></Text>
        <Text style={styles.description}>{plan.description}</Text>
      </Card>

      <View style={styles.group}>
        <SectionHeader title="Term" />
        <ChipRow options={terms} value={term} onChange={setTerm} />
      </View>

      <View style={styles.group}>
        <SectionHeader title="Vehicles to cover" />
        <Text style={styles.note}>Choose 1 or 2 vehicles. Admins verify permits by license plate.</Text>
        {vehicles.length === 0 ? (
          <Banner
            tone="warning"
            title="No vehicles on file"
            message="Add a vehicle on the Permits tab before buying a plan."
          />
        ) : (
          vehicles.map(vehicle => {
            const checked = selected.includes(vehicle.id);
            return (
              <OptionCard
                key={vehicle.id}
                kind="checkbox"
                label={`${vehicle.color} ${vehicle.make} ${vehicle.model}, plate ${vehicle.plate}`}
                checked={checked}
                disabled={!checked && atLimit}
                onPress={() => toggle(vehicle.id)}
              >
                <View style={styles.vehicle}>
                  <LicensePlate plate={vehicle.plate} state={vehicle.state} size="sm" />
                  <Text style={styles.note}>{vehicle.color} {vehicle.make} {vehicle.model}</Text>
                </View>
              </OptionCard>
            );
          })
        )}
        {atLimit && vehicles.length > MAX_VEHICLES ? (
          <Text style={styles.note}>You can cover up to {MAX_VEHICLES} vehicles. Untick one to pick another.</Text>
        ) : null}
        {vehicles.length > 0 && chosen.length === 0 ? (
          <Text style={styles.required}>Select at least one vehicle to continue.</Text>
        ) : null}
      </View>

      <View style={styles.group}>
        <SectionHeader title="Payment method" />
        {paymentMethods.map(method => (
          <OptionCard
            key={method.id}
            kind="radio"
            label={`${method.label}. ${method.detail}`}
            checked={method.id === methodId}
            onPress={() => setMethodId(method.id)}
          >
            <View style={styles.methodIcon}>
              <Icon name={method.icon as IconName} size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.methodTitle}>{method.label}</Text>
              <Text style={styles.note}>{method.detail}</Text>
            </View>
          </OptionCard>
        ))}
      </View>

      <Card style={styles.totals}>
        <TotalRow label={`${plan.name} permit`} value={formatMoney(plan.price)} />
        <TotalRow label="Processing fee" value={formatMoney(PROCESSING_FEE)} />
        <View style={styles.divider} />
        <TotalRow label="Total" value={formatMoney(total)} strong />
      </Card>

      <Button
        title={`Pay ${formatMoney(total)}`}
        icon="lock"
        disabled={chosen.length === 0}
        onPress={pay}
      />
      <Text style={styles.demoNote}>Demo only: no card is charged. Sample pricing, not official SJSU rates.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  flex: { flex: 1 },
  group: { gap: 8 },
  summary: { gap: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  planName: { fontSize: 20, fontWeight: '700', color: colors.ink },
  price: { fontSize: 28, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  period: { fontSize: 13, fontWeight: '400', letterSpacing: 0, color: colors.muted },
  description: { fontSize: 13, lineHeight: 20, color: colors.muted },
  note: { fontSize: 12, color: colors.muted },
  required: { fontSize: 12, fontWeight: '600', color: colors.red },
  vehicle: { flex: 1, gap: 6 },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  methodTitle: { fontSize: 14, fontWeight: '600', color: colors.ink },
  totals: { gap: 8 },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 14, color: colors.muted },
  totalValue: { fontSize: 14, fontWeight: '600', color: colors.ink },
  totalStrong: { fontSize: 17, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.border },
  demoNote: { fontSize: 12, textAlign: 'center', color: colors.muted },
});
