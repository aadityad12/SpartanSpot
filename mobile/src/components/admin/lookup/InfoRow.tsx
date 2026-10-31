import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';

export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 6 },
  label: { fontSize: 13, color: colors.muted },
  value: { flexShrink: 1, fontSize: 14, fontWeight: '600', color: colors.ink, textAlign: 'right' },
});
