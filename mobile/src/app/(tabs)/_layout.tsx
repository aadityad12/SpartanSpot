import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/ui';
import { colors } from '../../theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Find parking', icon: 'compass' },
  { name: 'saved', title: 'Saved', icon: 'bookmark' },
  { name: 'activity', title: 'My parking', icon: 'truck' },
  { name: 'settings', title: 'Settings', icon: 'sliders' },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: '#9AA39B', tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border, height: 69 + Math.max(insets.bottom, 8), paddingTop: 11, paddingBottom: Math.max(insets.bottom, 8) }, tabBarLabelStyle: { fontSize: 9, fontWeight: '600', marginTop: 5 }, sceneStyle: { backgroundColor: colors.background } }}>{tabs.map(tab => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: tab.title, tabBarIcon: ({ color }) => <Icon name={tab.icon} color={String(color)} size={21} /> }} />)}</Tabs>;
}
