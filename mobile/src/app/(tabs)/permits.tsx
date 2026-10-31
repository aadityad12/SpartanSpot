import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AddVehicleForm } from '../../components/permits/AddVehicleForm';
import { PaymentHistory } from '../../components/permits/PaymentHistory';
import { PermitCard } from '../../components/permits/PermitCard';
import { PlanCard } from '../../components/permits/PlanCard';
import { VehicleList } from '../../components/permits/VehicleList';
import { PageHeader, Screen, SectionHeader } from '../../components/kit';
import { useDemo } from '../../demo';
import { plans } from '../../mock/permits';
import { colors } from '../../theme';

export default function PermitsScreen() {
  const { permit, payments, vehicles, addVehicle, removeVehicle } = useDemo();
  const currentPlanId = permit && permit.status !== 'expired' ? permit.planId : null;

  return (
    <Screen>
      <PageHeader eyebrow="Permits" title="Your parking permit" />
      <PermitCard permit={permit} />

      <SectionHeader title="Plans" />
      {plans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          current={plan.id === currentPlanId}
          onChoose={() => router.push({ pathname: '/checkout/[planId]', params: { planId: plan.id } })}
        />
      ))}
      <Text style={styles.note}>Sample pricing — not official SJSU rates.</Text>

      <SectionHeader title="Vehicles" />
      <VehicleList vehicles={vehicles} onRemove={removeVehicle} />
      <AddVehicleForm existingPlates={vehicles.map(vehicle => vehicle.plate)} onAdd={addVehicle} />
      <Text style={styles.note}>Admins verify permits by license plate.</Text>

      <SectionHeader title="Payment history" />
      <PaymentHistory payments={payments} />
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 12, color: colors.muted },
  spacer: { height: 8 },
});
