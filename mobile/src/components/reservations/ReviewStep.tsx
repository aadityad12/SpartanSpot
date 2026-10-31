import { StyleSheet, Text, View } from 'react-native';
import type { Garage, Spot } from '../../mock/garages';
import type { Vehicle } from '../../mock/people';
import { colors } from '../../theme';
import { Banner, Card, LicensePlate } from '../kit';
import { Button } from '../ui';
import { RESERVATION_FEE, formatMoney, formatWindow } from './format';
import { SummaryRow } from './SummaryRow';

export function ReviewStep({
  garage,
  spot,
  window,
  vehicle,
  methodLabel,
  error,
  fixLabel,
  onFix,
  onConfirm,
}: {
  garage: Garage;
  spot: Spot;
  window: { start: Date; end: Date };
  vehicle: Vehicle;
  methodLabel: string;
  error: string | null;
  fixLabel: string;
  onFix: () => void;
  onConfirm: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <Card>
        <SummaryRow label="Garage" value={garage.name} />
        <SummaryRow label="Spot" value={`Level ${spot.level} · Spot ${spot.label}`} />
        <SummaryRow label="When" value={formatWindow(window.start, window.end)} />
        <SummaryRow label="Vehicle">
          <LicensePlate plate={vehicle.plate} state={vehicle.state} size="sm" />
        </SummaryRow>
        <SummaryRow label="Payment" value={methodLabel} />
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(RESERVATION_FEE)}</Text>
        </View>
      </Card>

      {error ? (
        <View style={styles.errorBlock}>
          <Banner tone="error" title="Couldn't reserve this spot" message={error} />
          <Button title={fixLabel} secondary icon="arrow-left" onPress={onFix} />
        </View>
      ) : null}

      <Button title={`Confirm & pay ${formatMoney(RESERVATION_FEE)}`} icon="check" onPress={onConfirm} />
      <Text style={styles.note}>Demo only: no payment is processed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.ink },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  errorBlock: { gap: 10 },
  note: { fontSize: 12, color: colors.muted, textAlign: 'center' },
});
