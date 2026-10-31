import { StyleSheet, View } from 'react-native';
import type { DailyReport } from '../../../mock/reports';
import { StatTile } from '../../kit';
import { hourLabel, money } from './format';

export function ReportKpis({ report }: { report: DailyReport }) {
  const { totals } = report;
  return (
    <View style={styles.row}>
      <StatTile label="Cars parked" value={totals.carsParked.toLocaleString('en-US')} sublabel="Entries all day" icon="truck" />
      <StatTile label="Unique plates" value={totals.uniquePlates.toLocaleString('en-US')} sublabel="Distinct vehicles" icon="hash" tone="primary" />
      <StatTile
        label="Peak occupancy"
        value={`${totals.peakOccupancyPercent}%`}
        sublabel={`At ${hourLabel(totals.peakHour)}`}
        icon="trending-up"
        tone="occupied"
      />
      <StatTile label="Reservations" value={totals.reservations} sublabel="Made through the app" icon="bookmark" tone="reserved" />
      <StatTile label="Violations" value={totals.violations} sublabel="Cited, warned or pending" icon="alert-triangle" tone="warning" />
      <StatTile
        label="Revenue"
        value={money(totals.revenue.total)}
        sublabel={`${money(totals.revenue.permits)} permits · ${money(totals.revenue.reservations)} reservations`}
        icon="dollar-sign"
        tone="available"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
