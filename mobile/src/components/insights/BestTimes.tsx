import { StyleSheet, Text, View } from 'react-native';
import { getGarage } from '../../mock/garages';
import type { ClassMeeting } from '../../mock/schedule';
import { colors } from '../../theme';
import { Badge, Card } from '../kit';
import { minutesLabel } from '../reservations/format';
import { Button, Icon } from '../ui';
import { recommend } from './recommend';
import { toMinutes } from './time';

export function BestTimes({
  garageId,
  schedule,
  onEdit,
}: {
  garageId: string;
  schedule: ClassMeeting[];
  onEdit: () => void;
}) {
  const garage = getGarage(garageId);
  const rows = recommend(schedule, garageId);

  return (
    <Card style={styles.card}>
      {rows.length === 0 ? (
        <Text style={styles.empty}>No classes on your schedule yet. Add one to get arrival times.</Text>
      ) : (
        rows.map((row, index) => (
          <View key={row.key} style={[styles.row, index > 0 && styles.rowDivider]}>
            <Text style={styles.classLine}>
              {row.day} · {row.meeting.course} at {minutesLabel(toMinutes(row.meeting.start))}
            </Text>
            <View style={styles.arriveLine}>
              <Icon name="arrow-right" size={15} color={colors.primary} />
              <Text style={styles.arriveText}>
                Arrive by {minutesLabel(row.arrivalMinutes)} at {garage?.name} (≈ {row.percent}% full)
              </Text>
            </View>
            {row.percent >= 90 ? (
              <View style={styles.badgeRow}>
                <Badge
                  label={
                    row.alternative
                      ? `Very busy: try ${row.alternative.garage.shortName} (≈ ${row.alternative.percent}%)`
                      : 'Very busy at that time'
                  }
                  tone="warning"
                  icon="alert-triangle"
                />
              </View>
            ) : null}
          </View>
        ))
      )}
      <Text style={styles.note}>Arrival = class start minus walk time and a 15 minute buffer. Sample data.</Text>
      <Button title="Edit schedule" icon="edit-2" secondary onPress={onEdit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  empty: { fontSize: 13, lineHeight: 20, color: colors.muted },
  row: { gap: 6 },
  rowDivider: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  classLine: { fontSize: 13, color: colors.muted },
  arriveLine: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  arriveText: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 20, color: colors.ink },
  badgeRow: { flexDirection: 'row' },
  note: { fontSize: 11, color: colors.muted },
});
