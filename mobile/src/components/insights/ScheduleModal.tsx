import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { classDays, type ClassDay, type ClassMeeting } from '../../mock/schedule';
import { colors } from '../../theme';
import { Chip, ChipRow, ListRow } from '../kit';
import { minutesLabel } from '../reservations/format';
import { Button, IconButton } from '../ui';
import { fromMinutes, toMinutes } from './time';

const FIRST_MINUTES = 7 * 60;
const LAST_MINUTES = 21 * 60;

const timeOptions: { value: string; label: string }[] = [];
for (let minutes = FIRST_MINUTES; minutes <= LAST_MINUTES; minutes += 15) {
  timeOptions.push({ value: fromMinutes(minutes), label: minutesLabel(minutes) });
}

export function ScheduleModal({
  visible,
  schedule,
  onChange,
  onClose,
}: {
  visible: boolean;
  schedule: ClassMeeting[];
  onChange: (next: ClassMeeting[]) => void;
  onClose: () => void;
}) {
  const [course, setCourse] = useState('');
  const [days, setDays] = useState<ClassDay[]>([]);
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:15');
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (day: ClassDay) => {
    setDays(current => (current.includes(day) ? current.filter(item => item !== day) : [...current, day]));
  };

  const add = () => {
    const name = course.trim();
    if (!name) return setError('Enter a course name, for example BIOL 65.');
    if (days.length === 0) return setError('Pick at least one day.');
    if (toMinutes(end) <= toMinutes(start)) return setError('The end time must be after the start time.');

    const meeting: ClassMeeting = {
      id: `custom-${Date.now()}`,
      course: name,
      title: name,
      days: classDays.filter(day => days.includes(day)),
      start,
      end,
      building: 'TBA',
    };
    onChange([...schedule, meeting]);
    setCourse('');
    setDays([]);
    setError(null);
  };

  const remove = (id: string) => onChange(schedule.filter(meeting => meeting.id !== id));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close schedule editor" onPress={onClose} style={styles.dismiss} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Edit schedule</Text>
            <IconButton name="x" label="Close" onPress={onClose} />
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {schedule.length === 0 ? <Text style={styles.empty}>No classes yet.</Text> : null}
            {schedule.map(meeting => (
              <ListRow
                key={meeting.id}
                title={meeting.course}
                subtitle={`${meeting.days.join(' ')} · ${minutesLabel(toMinutes(meeting.start))} – ${minutesLabel(toMinutes(meeting.end))} · ${meeting.building}`}
                right={<IconButton name="trash-2" label={`Remove ${meeting.course}`} onPress={() => remove(meeting.id)} />}
              />
            ))}

            <Text style={styles.formTitle}>Add a class</Text>
            <TextInput
              accessibilityLabel="Course"
              value={course}
              onChangeText={setCourse}
              placeholder="Course, e.g. BIOL 65"
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              style={styles.input}
            />
            <Text style={styles.label}>Days</Text>
            <View style={styles.dayRow}>
              {classDays.map(day => (
                <Chip key={day} label={day} selected={days.includes(day)} onPress={() => toggleDay(day)} />
              ))}
            </View>
            <Text style={styles.label}>Starts</Text>
            <ChipRow options={timeOptions} value={start} onChange={setStart} />
            <Text style={styles.label}>Ends</Text>
            <ChipRow options={timeOptions} value={end} onChange={setEnd} />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <View style={styles.actions}>
              <Button title="Add class" icon="plus" onPress={add} />
              <Button title="Done" secondary onPress={onClose} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16, 44, 68, 0.45)' },
  dismiss: { flex: 1 },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
  empty: { fontSize: 13, color: colors.muted, paddingVertical: 8 },
  formTitle: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 16, marginBottom: 8 },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
    fontSize: 15,
    color: colors.ink,
  },
  label: { fontSize: 12, fontWeight: '700', color: colors.muted, marginTop: 12, marginBottom: 6 },
  dayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { fontSize: 13, color: colors.red, marginTop: 10 },
  actions: { gap: 10, marginTop: 16 },
});
