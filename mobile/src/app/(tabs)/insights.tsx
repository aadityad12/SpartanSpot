import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BestTimes } from '../../components/insights/BestTimes';
import { EventCard } from '../../components/insights/EventCard';
import { Forecast } from '../../components/insights/Forecast';
import { Heatmap } from '../../components/insights/Heatmap';
import { RightNowCard } from '../../components/insights/RightNowCard';
import { ScheduleModal } from '../../components/insights/ScheduleModal';
import { TodayVsLastWeek } from '../../components/insights/TodayVsLastWeek';
import { ChipRow, PageHeader, Screen, SectionHeader } from '../../components/kit';
import { useNow } from '../../components/reservations/useNow';
import { campusEvents } from '../../mock/events';
import { garages } from '../../mock/garages';
import { defaultSchedule, type ClassMeeting } from '../../mock/schedule';
import { colors } from '../../theme';

const garageOptions = garages.map(garage => ({ value: garage.id, label: garage.shortName }));

export default function InsightsScreen() {
  const now = useNow(60000);
  const [garageId, setGarageId] = useState('south');
  const [schedule, setSchedule] = useState<ClassMeeting[]>(defaultSchedule);
  const [editing, setEditing] = useState(false);

  return (
    <Screen>
      <PageHeader
        eyebrow="Insights"
        title="Park smarter"
        subtitle="Trends, predictions and events for your commute"
      />
      <ChipRow options={garageOptions} value={garageId} onChange={setGarageId} />

      <RightNowCard garageId={garageId} now={now} />

      <SectionHeader title="Today vs. last week" />
      <TodayVsLastWeek garageId={garageId} now={now} />

      <SectionHeader title="A week at a glance" />
      <Heatmap garageId={garageId} />

      <SectionHeader title="Best times for your schedule" />
      <BestTimes garageId={garageId} schedule={schedule} onEdit={() => setEditing(true)} />

      <SectionHeader title="Forecast: next 7 days" />
      <Forecast garageId={garageId} now={now} />

      <SectionHeader title="Campus events" />
      <View style={styles.events}>
        {campusEvents.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </View>

      <Text style={styles.footer}>Predictions are generated from sample occupancy history.</Text>

      <ScheduleModal
        visible={editing}
        schedule={schedule}
        onChange={setSchedule}
        onClose={() => setEditing(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  events: { gap: 12 },
  footer: { fontSize: 12, lineHeight: 18, color: colors.muted, textAlign: 'center' },
});
