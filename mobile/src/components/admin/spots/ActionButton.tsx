import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../../theme';

// Compact text button for inline actions; the shared Button is sized for full-width calls to action.
export function ActionButton({
  label,
  onPress,
  tone = 'primary',
  accessibilityLabel,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'danger' | 'quiet';
  accessibilityLabel?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === 'primary' && styles.primary,
        tone === 'danger' && styles.danger,
        tone === 'quiet' && styles.quiet,
        (pressed || disabled) && styles.dim,
      ]}
    >
      <Text
        style={[
          styles.text,
          tone === 'primary' && { color: colors.white },
          tone === 'danger' && { color: colors.red },
          tone === 'quiet' && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  danger: { backgroundColor: colors.occupiedLight, borderColor: colors.red },
  quiet: { backgroundColor: colors.white, borderColor: colors.border },
  dim: { opacity: 0.5 },
  text: { fontSize: 13, fontWeight: '700' },
});
