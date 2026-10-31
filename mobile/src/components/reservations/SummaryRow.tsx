import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';

export function SummaryRow({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.value}>
        {value ? <Text style={styles.valueText}>{value}</Text> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { fontSize: 13, color: colors.muted, paddingTop: 1 },
  value: { flex: 1, alignItems: 'flex-end' },
  valueText: { fontSize: 14, fontWeight: '600', color: colors.ink, textAlign: 'right' },
});
