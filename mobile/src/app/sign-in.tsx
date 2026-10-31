import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/kit';
import { Emblem, Icon, type IconName } from '../components/ui';
import { useDemo, type Role } from '../demo';
import { colors } from '../theme';

const roles: { role: Role; title: string; description: string; icon: IconName; home: Href }[] = [
  {
    role: 'student',
    title: 'Student',
    description: 'Find open spaces, reserve a spot, manage your permit',
    icon: 'user',
    home: '/',
  },
  {
    role: 'admin',
    title: 'Parking Services',
    description: 'Check plates, manage reserved spots, monitor cameras, reports',
    icon: 'shield',
    home: '/admin',
  },
];

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function SignInScreen() {
  const { role, signIn } = useDemo();
  const params = useLocalSearchParams<{ as?: string; next?: string }>();
  const requested = first(params.as);
  const next = first(params.next);
  const deepLinkRole: Role | null = requested === 'student' || requested === 'admin' ? requested : null;
  const navigated = useRef(false);

  // Demo deep link: ?as=student|admin signs in, then jumps to `next` (same-app paths only).
  useEffect(() => {
    if (deepLinkRole && role !== deepLinkRole) signIn(deepLinkRole);
  }, [deepLinkRole, role, signIn]);

  // Navigate only after the role is committed, so the tab guards don't bounce back here.
  useEffect(() => {
    if (!deepLinkRole || role !== deepLinkRole || navigated.current) return;
    navigated.current = true;
    const fallback = roles.find(item => item.role === deepLinkRole)?.home ?? '/';
    const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? (next as Href) : fallback;
    router.replace(safeNext);
  }, [deepLinkRole, role, next]);

  const choose = (item: (typeof roles)[number]) => {
    signIn(item.role);
    router.replace(item.home);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Emblem size={44} color={colors.gold} />
        </View>
        <Text style={styles.wordmark}>
          Spartan<Text style={styles.wordmarkLight}>Spot</Text>
        </Text>
        <Text style={styles.tagline}>Find your spot. Skip the circling.</Text>
      </View>

      <Text style={styles.prompt}>Continue as</Text>
      {roles.map(item => (
        <Pressable
          key={item.role}
          accessibilityRole="button"
          accessibilityLabel={`Continue as ${item.title}`}
          onPress={() => choose(item)}
          style={({ pressed }) => [styles.roleCard, pressed && styles.pressed]}
        >
          <View style={styles.roleIcon}>
            <Icon name={item.icon} size={24} color={colors.primary} />
          </View>
          <View style={styles.roleText}>
            <Text style={styles.roleTitle}>{item.title}</Text>
            <Text style={styles.roleDescription}>{item.description}</Text>
          </View>
          <Icon name="chevron-right" size={20} color={colors.muted} />
        </Pressable>
      ))}

      <Text style={styles.footer}>Prototype · sample data only</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', gap: 8, paddingTop: 24, paddingBottom: 12 },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: { fontSize: 32, fontWeight: '800', letterSpacing: -1, color: colors.primary },
  wordmarkLight: { fontWeight: '400', color: colors.gold },
  tagline: { fontSize: 15, color: colors.muted },
  prompt: { fontSize: 12, fontWeight: '700', letterSpacing: 1.6, color: colors.muted, marginTop: 8 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.7 },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleText: { flex: 1, gap: 3 },
  roleTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  roleDescription: { fontSize: 13, lineHeight: 19, color: colors.muted },
  footer: { textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 12 },
});
