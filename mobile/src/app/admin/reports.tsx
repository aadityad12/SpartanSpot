import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ExportCard } from '../../components/admin/reports/ExportCard';
import { parseOffset, periodOptions, reportFileName, weekdayName } from '../../components/admin/reports/format';
import { GarageTable } from '../../components/admin/reports/GarageTable';
import { HourlyChart } from '../../components/admin/reports/HourlyChart';
import { ReportKpis } from '../../components/admin/reports/ReportKpis';
import { ViolationsList } from '../../components/admin/reports/ViolationsList';
import { AdminHeader, Screen, SegmentedControl } from '../../components/kit';
import { useNow } from '../../components/reservations/useNow';
import { dailyReport } from '../../mock/reports';
import { colors } from '../../theme';

function updateNote(now: number, offset: ReturnType<typeof parseOffset>): string {
  if (offset !== 0) return `Final report for ${weekdayName(now, offset)} · closed 11:59 PM`;
  // The report refreshes on the hour, so show the top of the current hour.
  const hour = new Date(now).getHours();
  return `Updates hourly · last updated ${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
}

export default function AdminReportsScreen() {
  const { width } = useWindowDimensions();
  const now = useNow(60000);
  const [period, setPeriod] = useState('0');
  const offset = parseOffset(period);
  const report = dailyReport(offset);
  const wide = width >= 900;

  const exportCard = <ExportCard fileName={reportFileName(now, offset)} />;
  const chart = <HourlyChart report={report} />;
  const garages = <GarageTable report={report} />;
  const violations = <ViolationsList violations={report.violations} />;

  return (
    <Screen wide>
      <AdminHeader title="Daily report" subtitle="End-of-day totals for every garage" />
      <View style={styles.controls}>
        <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} />
        <Text style={styles.note}>{updateNote(now, offset)}</Text>
      </View>
      <ReportKpis report={report} />
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.column}>
            {chart}
            {garages}
          </View>
          <View style={styles.column}>
            {exportCard}
            {violations}
          </View>
        </View>
      ) : (
        <>
          {exportCard}
          {chart}
          {garages}
          {violations}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  controls: { gap: 8 },
  note: { fontSize: 12, color: colors.muted },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { flex: 1, gap: 16 },
});
