import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { colors } from '../../theme';
import { Card } from '../kit';
import { Button } from '../ui';

export function ParkedHereCard({
  replacesLotName,
  onParked,
}: {
  replacesLotName?: string;
  onParked: (note: string) => void;
}) {
  const [note, setNote] = useState('');
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Make it easy to find your way back</Text>
      <Text style={styles.subtitle}>Add a level or space number. We keep it on this device.</Text>
      <TextInput
        accessibilityLabel="Parking level or space number"
        placeholder="e.g. Level 2, space B24"
        placeholderTextColor={colors.muted}
        value={note}
        maxLength={120}
        onChangeText={setNote}
        style={styles.input}
      />
      <Button
        title={replacesLotName ? 'Replace my parking reminder' : 'I parked here'}
        icon="check-circle"
        onPress={() => onParked(note.trim())}
      />
      <Text style={styles.fine}>
        {replacesLotName ? `This replaces your reminder for ${replacesLotName}. ` : ''}
        This does not reserve a space or pay for parking.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  title: { fontSize: 16, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 13, lineHeight: 19, color: colors.muted },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 13,
    fontSize: 14,
    color: colors.ink,
  },
  fine: { fontSize: 11, lineHeight: 17, color: colors.muted },
});
