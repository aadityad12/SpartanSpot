import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../../demo';
import { colors } from '../../../theme';
import { Card, SectionHeader } from '../../kit';
import { timeLabel } from '../../reservations/format';
import { useNow } from '../../reservations/useNow';
import { Icon } from '../../ui';
import { buildActivity } from './activity';

const toneColor = { ok: colors.available, alert: colors.occupied, info: colors.primary } as const;

export function ActivityFeed() {
  const { reservations } = useDemo();
  const now = useNow();
  const events = useMemo(() => buildActivity(reservations, now), [reservations, now]);

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Live activity" />
      <Card padded={false}>
        {events.map((event, index) => (
          <View key={event.id} style={[styles.row, index > 0 && styles.divider]}>
            <Icon name={event.icon} size={16} color={toneColor[event.tone]} />
            <Text style={styles.text}>{event.text}</Text>
            <Text style={styles.time}>{timeLabel(new Date(event.at))}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  text: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.ink },
  time: { fontSize: 11, color: colors.muted },
});
