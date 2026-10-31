import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { samplePlates } from '../../../mock/plates';
import { colors } from '../../../theme';
import { Card, Chip } from '../../kit';
import { Button, Icon } from '../../ui';

export function PlateSearch({
  recent,
  onSearch,
}: {
  recent: string[];
  onSearch: (plate: string) => void;
}) {
  const [text, setText] = useState('');

  const submit = () => {
    if (text.trim()) onSearch(text);
  };
  const pick = (plate: string) => {
    setText(plate);
    onSearch(plate);
  };

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>LICENSE PLATE</Text>
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="License plate number"
          value={text}
          onChangeText={value => setText(value.replace(/[^a-z0-9]/gi, '').toUpperCase())}
          onSubmitEditing={submit}
          placeholder="7ABC123"
          placeholderTextColor={colors.border}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="search"
          style={styles.plateInput}
        />
        <View style={styles.button}>
          <Button title="Check permit" icon="search" onPress={submit} disabled={!text.trim()} />
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Try a sample plate</Text>
        <View style={styles.chips}>
          {samplePlates.map(item => (
            <Chip
              key={item.plate}
              label={`${item.plate} · ${item.hint}`}
              onPress={() => pick(item.plate)}
            />
          ))}
        </View>
      </View>

      {recent.length > 0 ? (
        <View style={styles.group}>
          <Text style={styles.groupLabel}>Recent searches</Text>
          <View style={styles.chips}>
            {recent.map(plate => (
              <Chip key={plate} label={plate} icon="clock" onPress={() => pick(plate)} />
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.note}>
        <Icon name="info" size={14} color={colors.muted} />
        <Text style={styles.noteText}>Manual entry. Automatic plate reading from cameras is planned.</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  inputRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  plateInput: {
    flexGrow: 1,
    flexBasis: 240,
    height: 64,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: colors.ink,
    borderRadius: 12,
    backgroundColor: colors.white,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 4,
    color: colors.ink,
    fontFamily: 'Courier',
  },
  button: { flexGrow: 1, flexBasis: 160 },
  group: { gap: 8 },
  groupLabel: { fontSize: 12, fontWeight: '600', color: colors.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteText: { flex: 1, fontSize: 12, color: colors.muted },
});
