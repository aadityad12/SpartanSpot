import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/ui';
import { useDemo } from '../../demo';
import { colors } from '../../theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Dashboard', icon: 'grid' },
  { name: 'lookup', title: 'Lookup', icon: 'search' },
  { name: 'spots', title: 'Spots', icon: 'layout' },
  { name: 'cameras', title: 'Cameras', icon: 'video' },
  { name: 'reports', title: 'Reports', icon: 'file-text' },
];

export default function AdminLayout() {
  const { role } = useDemo();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);

  if (role !== 'admin') return <Redirect href="/sign-in" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // A navy bar makes it obvious this is the Parking Services view.
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: '#B9C8D8',
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopColor: colors.primaryDeep,
          height: 69 + bottom,
          paddingTop: 11,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontSize: 9, fontWeight: '600', marginTop: 5 },
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
    </Tabs>
  );
}
