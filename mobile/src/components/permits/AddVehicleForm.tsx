import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { Vehicle } from '../../mock/people';
import { colors } from '../../theme';
import { Banner, Card } from '../kit';
import { Button } from '../ui';

type Draft = Omit<Vehicle, 'id'>;

const PLATE_PATTERN = /^[A-Z0-9]{2,8}$/;
const STATE_PATTERN = /^[A-Z]{2}$/;

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  maxLength,
  autoCapitalize = 'words',
  flex,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'words' | 'characters';
  flex?: number;
}) {
  return (
    <View style={[styles.field, flex ? { flex } : null]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

export function AddVehicleForm({
  existingPlates,
  onAdd,
}: {
  existingPlates: string[];
  onAdd: (vehicle: Draft) => void;
}) {
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState('');
  const [state, setState] = useState('CA');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<string | null>(null);

  const reset = () => {
    setPlate('');
    setState('CA');
    setMake('');
    setModel('');
    setColor('');
    setError(null);
  };

  const submit = () => {
    const cleanPlate = plate.trim().toUpperCase();
    const cleanState = state.trim().toUpperCase();
    if (!PLATE_PATTERN.test(cleanPlate)) {
      setError('Enter a plate with 2 to 8 letters or digits, no spaces or symbols.');
      return;
    }
    if (!STATE_PATTERN.test(cleanState)) {
      setError('Enter the two-letter state code, such as CA.');
      return;
    }
    if (existingPlates.includes(cleanPlate)) {
      setError(`${cleanPlate} is already on your account.`);
      return;
    }
    if (!make.trim() || !model.trim() || !color.trim()) {
      setError('Add the make, model and color so Parking Services can match the vehicle.');
      return;
    }
    onAdd({
      plate: cleanPlate,
      state: cleanState,
      make: make.trim(),
      model: model.trim(),
      color: color.trim(),
      primary: false,
    });
    setAdded(cleanPlate);
    reset();
    setOpen(false);
  };

  return (
    <View style={styles.wrap}>
      {added ? (
        <Banner tone="success" title={`Vehicle ${added} added`} onClose={() => setAdded(null)} />
      ) : null}

      {open ? (
        <Card style={styles.form}>
          <Field
            label="License plate"
            value={plate}
            onChangeText={value => setPlate(value.toUpperCase())}
            placeholder="7ABC123"
            maxLength={8}
            autoCapitalize="characters"
          />
          <Field
            label="State"
            value={state}
            onChangeText={value => setState(value.toUpperCase())}
            placeholder="CA"
            maxLength={2}
            autoCapitalize="characters"
          />
          <View style={styles.pair}>
            <Field label="Make" value={make} onChangeText={setMake} placeholder="Honda" flex={1} />
            <Field label="Model" value={model} onChangeText={setModel} placeholder="Civic" flex={1} />
          </View>
          <Field label="Color" value={color} onChangeText={setColor} placeholder="Blue" />
          {error ? <Banner tone="error" title={error} /> : null}
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                title="Cancel"
                secondary
                onPress={() => {
                  reset();
                  setOpen(false);
                }}
              />
            </View>
            <View style={styles.action}>
              <Button title="Save vehicle" icon="check" onPress={submit} />
            </View>
          </View>
        </Card>
      ) : (
        <Button
          title="Add vehicle"
          icon="plus"
          secondary
          onPress={() => {
            setAdded(null);
            setOpen(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  form: { gap: 12 },
  field: { gap: 6 },
  pair: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 12, fontWeight: '700', color: colors.ink },
  input: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    fontSize: 15,
    color: colors.ink,
  },
  actions: { flexDirection: 'row', gap: 10 },
  action: { flex: 1 },
});
