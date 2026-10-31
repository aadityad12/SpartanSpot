import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../../theme';
import { Card, Chip } from '../../kit';
import { formatMoney } from '../../reservations/format';
import { Button } from '../../ui';
import { citationTypes, type CitationType } from './citations';

export function CitationForm({
  plate,
  onSubmit,
  onCancel,
}: {
  plate: string;
  onSubmit: (type: CitationType, notes: string) => void;
  onCancel: () => void;
}) {
  const [type, setType] = useState<CitationType | null>(null);
  const [notes, setNotes] = useState('');

  return (
    <Card style={styles.card}>
      <Text style={styles.heading}>Issue citation to {plate}</Text>
      <View style={styles.chips}>
        {citationTypes.map(item => (
          <Chip
            key={item.label}
            label={`${item.label} ${formatMoney(item.amount)}`}
            selected={type?.label === item.label}
            onPress={() => setType(item)}
          />
        ))}
      </View>
      <TextInput
        accessibilityLabel="Citation notes"
        value={notes}
        onChangeText={setNotes}
        placeholder="Notes (optional), e.g. location or what you observed"
        placeholderTextColor={colors.muted}
        multiline
        style={styles.notes}
      />
      <View style={styles.buttons}>
        <View style={styles.flex}>
          <Button title="Cancel" secondary onPress={onCancel} />
        </View>
        <View style={styles.flex}>
          <Button
            title="Submit citation"
            icon="send"
            disabled={!type}
            onPress={() => {
              if (type) onSubmit(type, notes.trim());
            }}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12, backgroundColor: colors.background },
  heading: { fontSize: 15, fontWeight: '700', color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notes: {
    minHeight: 72,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    fontSize: 14,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  buttons: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
