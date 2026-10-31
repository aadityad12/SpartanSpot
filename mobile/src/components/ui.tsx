import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { spartanPinPath } from '../brand';
import { colors } from '../theme';

export type IconName = React.ComponentProps<typeof Feather>['name'];
export function Icon({ name, size = 20, color = colors.ink }: { name: IconName; size?: number; color?: string }) {
  return <Feather name={name} size={size} color={color ?? undefined} />;
}
export function Emblem({ size = 30, color = colors.primary }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="SpartanSpot"><Path fill={color} fillRule="evenodd" d={spartanPinPath} /></Svg>;
}
export function IconButton({ name, onPress, label, active, style }: { name: IconName; onPress: () => void; label: string; active?: boolean; style?: StyleProp<ViewStyle> }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.iconButton, active && { backgroundColor: colors.primaryLight }, pressed && { opacity: 0.6 }, style]}><Icon name={name} color={active ? colors.primary : colors.ink} /></Pressable>;
}
export function Button({ title, onPress, icon, secondary = false, disabled = false }: { title: string; onPress: () => void; icon?: IconName; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, (pressed || disabled) && { opacity: 0.55 }]}><Text style={[styles.buttonText, secondary && { color: colors.primary }]}>{title}</Text>{icon && <Icon name={icon} color={secondary ? colors.primary : colors.white} size={18} />}</Pressable>;
}
export function EmptyState({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return <View style={styles.empty}><View style={styles.emptyIcon}><Icon name={icon} size={28} color={colors.primary} /></View><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyDescription}>{description}</Text></View>;
}
export const typography = StyleSheet.create({
  eyebrow: { fontSize: 10, letterSpacing: 1.8, fontWeight: '700', color: colors.muted },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -1.2, color: colors.ink },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 21 },
  section: { fontSize: 19, fontWeight: '700', letterSpacing: -0.5, color: colors.ink },
});
const styles = StyleSheet.create({
  iconButton: { height: 44, width: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.white, borderRadius: 15, borderWidth: 1, borderColor: colors.border },
  button: { minHeight: 52, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  secondary: { backgroundColor: colors.primaryLight },
  buttonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  empty: { padding: 32, alignItems: 'center', gap: 12 },
  emptyIcon: { width: 64, height: 64, backgroundColor: colors.primaryLight, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  emptyDescription: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 21 },
});
