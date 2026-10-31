import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors } from '../../theme';
import { Icon } from '../ui';

// A selectable card used for both radio groups (payment method) and checkbox groups (vehicles).
export function OptionCard({
  kind,
  label,
  checked,
  disabled = false,
  onPress,
  children,
}: {
  kind: 'radio' | 'checkbox';
  label: string;
  checked: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.option, checked && styles.optionOn, disabled && styles.optionDisabled]}
    >
      <View style={styles.content}>{children}</View>
      <View style={[styles.mark, kind === 'radio' ? styles.round : styles.square, checked && styles.markOn]}>
        {checked ? <Icon name="check" size={12} color={colors.white} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionOn: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  optionDisabled: { opacity: 0.45 },
  content: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mark: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  round: { borderRadius: 11 },
  square: { borderRadius: 6 },
  markOn: { borderColor: colors.primary, backgroundColor: colors.primary },
});
