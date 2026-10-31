import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../ui';

export const stepLabels = ['Spot', 'Time', 'Payment', 'Review'] as const;

export function StepIndicator({ step }: { step: number }) {
  return (
    <View accessibilityLabel={`Step ${step + 1} of ${stepLabels.length}: ${stepLabels[step]}`} style={styles.row}>
      {stepLabels.map((label, index) => {
        const done = index < step;
        const current = index === step;
        return (
          <View key={label} style={styles.item}>
            <View style={[styles.dot, (done || current) && styles.dotOn]}>
              {done ? (
                <Icon name="check" size={13} color={colors.white} />
              ) : (
                <Text style={[styles.number, current && { color: colors.white }]}>{index + 1}</Text>
              )}
            </View>
            <Text style={[styles.label, current && styles.labelCurrent]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  item: { flex: 1, alignItems: 'center', gap: 6 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  dotOn: { backgroundColor: colors.primary },
  number: { fontSize: 12, fontWeight: '700', color: colors.muted },
  label: { fontSize: 12, fontWeight: '600', color: colors.muted },
  labelCurrent: { color: colors.ink },
});
