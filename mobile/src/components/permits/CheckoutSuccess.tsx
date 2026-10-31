import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { Permit } from '../../mock/permits';
import { colors } from '../../theme';
import { Button, Icon } from '../ui';
import { PermitCard } from './PermitCard';

export function CheckoutSuccess({ permit, onDone }: { permit: Permit; onDone: () => void }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.check}>
        <Icon name="check" size={34} color={colors.white} />
      </View>
      <Text accessibilityRole="header" style={styles.title}>Permit active</Text>
      <Text style={styles.confirmation}>Confirmation {permit.confirmation}</Text>
      <Text style={styles.note}>Demo payment: no card was charged.</Text>

      <View style={styles.card}>
        <PermitCard permit={permit} compact />
      </View>

      <View style={styles.actions}>
        <Button title="View permit" icon="credit-card" onPress={() => router.replace('/permits')} />
        <Button title="Done" secondary onPress={onDone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8, paddingTop: 12 },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.available,
    marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  confirmation: { fontSize: 15, fontWeight: '700', letterSpacing: 0.5, color: colors.primary },
  note: { fontSize: 12, color: colors.muted },
  card: { width: '100%', marginTop: 12 },
  actions: { width: '100%', gap: 10, marginTop: 16 },
});
