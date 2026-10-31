import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/ui';
import { useDemo } from '../../demo';
import { colors } from '../../theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Find', icon: 'compass' },
  { name: 'reservations', title: 'Reservations', icon: 'calendar' },
  { name: 'insights', title: 'Insights', icon: 'bar-chart-2' },
  { name: 'permits', title: 'Permits', icon: 'credit-card' },
  { name: 'account', title: 'Account', icon: 'user' },
];

// Still routable, but not part of the five-tab bar.
const hiddenTabs = ['saved', 'activity', 'settings'];

export default function TabLayout() {
  const { role } = useDemo();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  if (role !== 'student') return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          height: 69 + bottom,
          paddingTop: 11,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 5 },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Icon name={tab.icon} color={String(color)} size={21} />,
          }}
        />
      ))}
      {hiddenTabs.map(name => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
