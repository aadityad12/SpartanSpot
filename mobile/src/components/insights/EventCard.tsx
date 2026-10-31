import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../demo';
import { garageSummary, getGarage } from '../../mock/garages';
import type { CampusEvent } from '../../mock/events';
import { colors } from '../../theme';
import { Badge, Card } from '../kit';
import { formatWindow } from '../reservations/format';
import { Button, Icon } from '../ui';

const impactTone = { High: 'occupied', Moderate: 'warning', Low: 'neutral' } as const;

function atTime(isoDate: string, time: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(' & ');
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}

export function EventCard({ event }: { event: CampusEvent }) {
  const { spotStatus } = useDemo();
  const [expanded, setExpanded] = useState(false);
  const [reminder, setReminder] = useState(false);

  const garageNames = event.affectedGarageIds.map(id => getGarage(id)?.shortName ?? id);
  const openSpaces = event.affectedGarageIds.reduce(
    (sum, id) => sum + garageSummary(id, spotStatus).available,
    0,
  );
  const when = formatWindow(atTime(event.date, event.startTime), atTime(event.date, event.endTime));
  const attendance = event.attendance.toLocaleString('en-US');

  return (
    <Card padded={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${event.title}, ${event.impact} impact. ${expanded ? 'Collapse' : 'Expand'} details`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded(open => !open)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.title}</Text>
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
        </View>
        <Text style={styles.meta}>{event.venue}</Text>
        <Text style={styles.meta}>{when}</Text>
        <View style={styles.badges}>
          <Badge label={`${event.impact} impact`} tone={impactTone[event.impact]} icon="users" />
          <Text style={styles.attendance}>≈ {attendance} attending</Text>
        </View>
        <Text style={styles.meta}>Affects: {garageNames.join(', ')}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <View style={styles.compare}>
            <Text style={styles.compareText}>
              ≈{attendance} attendees vs {openSpaces} open spaces across {joinNames(garageNames)}
            </Text>
            <Text style={styles.compareNote}>Open spaces are live counts from the garage map.</Text>
          </View>
          <Text style={styles.advice}>{event.advice}</Text>
          <Button
            title={reminder ? 'Reminder set (demo)' : 'Set reminder'}
            icon={reminder ? 'check' : 'bell'}
            secondary={!reminder}
            onPress={() => setReminder(set => !set)}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, gap: 4 },
  pressed: { opacity: 0.7 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', lineHeight: 22, color: colors.ink },
  meta: { fontSize: 13, lineHeight: 19, color: colors.muted },
  badges: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginVertical: 4 },
  attendance: { fontSize: 13, fontWeight: '600', color: colors.ink },
  body: { gap: 12, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 },
  compare: { gap: 4, padding: 12, borderRadius: 12, backgroundColor: colors.primaryLight },
  compareText: { fontSize: 14, fontWeight: '700', lineHeight: 20, color: colors.primary },
  compareNote: { fontSize: 11, color: colors.muted },
  advice: { fontSize: 13, lineHeight: 20, color: colors.ink },
});
