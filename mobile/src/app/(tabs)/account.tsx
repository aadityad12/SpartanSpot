import { router } from 'expo-router';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { ProfileCard } from '../../components/permits/ProfileCard';
import { Card, ListRow, PageHeader, Screen, SectionHeader } from '../../components/kit';
import { Icon } from '../../components/ui';
import { useDemo } from '../../demo';
import { colors } from '../../theme';

const notificationRows = [
  { key: 'almostFull', title: 'Garage almost full alerts', subtitle: 'When a saved garage is nearly full', icon: 'bell' },
  { key: 'reminders', title: 'Reservation reminders', subtitle: 'Before a reservation starts or ends', icon: 'clock' },
  { key: 'events', title: 'Campus event alerts', subtitle: 'Games and events that fill garages', icon: 'calendar' },
] as const;

type NotificationKey = (typeof notificationRows)[number]['key'];

function Group({ children }: { children: ReactNode }) {
  return <Card style={styles.group}>{children}</Card>;
}

export default function AccountScreen() {
  const { student, signOut } = useDemo();
  // Local to the demo: the toggles show the settings UI but do not schedule anything.
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    almostFull: true,
    reminders: true,
    events: false,
  });
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <Screen>
      <PageHeader eyebrow="Student" title="Account" />
      <ProfileCard student={student} />

      <SectionHeader title="My parking" />
      <Group>
        <ListRow icon="map-pin" title="Where I parked" subtitle="Your saved parking reminder" onPress={() => router.push('/activity')} />
        <ListRow icon="bookmark" title="Saved garages" subtitle="Your go-to places" onPress={() => router.push('/saved')} />
        <ListRow icon="calendar" title="Reservations" subtitle="Upcoming and past spots" onPress={() => router.push('/reservations')} />
      </Group>

      <SectionHeader title="Notifications" />
      <Group>
        {notificationRows.map(row => (
          <ListRow
            key={row.key}
            icon={row.icon}
            title={row.title}
            subtitle={row.subtitle}
            right={(
              <Switch
                accessibilityLabel={row.title}
                value={notifications[row.key]}
                onValueChange={value => setNotifications(current => ({ ...current, [row.key]: value }))}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            )}
          />
        ))}
      </Group>

      <SectionHeader title="App" />
      <Group>
        <ListRow icon="server" title="Server connection" subtitle="Connect to a parking API" onPress={() => router.push('/settings')} />
        <ListRow
          icon="info"
          title="About SpartanSpot"
          right={<Icon name={aboutOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />}
          onPress={() => setAboutOpen(open => !open)}
        />
        {aboutOpen ? (
          <Text style={styles.about}>
            Cameras watch each garage and computer vision marks every space as available or occupied.
            Those results are stored in a database, and this app reads them to show live availability,
            let you reserve a spot, and help you plan your arrival. SpartanSpot is a CMPE 131 project
            prototype, so everything you see here is sample data.
          </Text>
        ) : null}
      </Group>

      <SectionHeader title="Account" />
      <Group>
        <ListRow
          icon="shield"
          title="Switch to Parking Services view"
          subtitle="Sign in as an administrator"
          onPress={() => {
            signOut();
            router.replace('/sign-in?as=admin');
          }}
        />
      </Group>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={() => {
          signOut();
          router.replace('/sign-in');
        }}
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <Icon name="log-out" size={18} color={colors.red} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
      <View style={styles.spacer} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { paddingVertical: 4 },
  about: { fontSize: 13, lineHeight: 21, color: colors.muted, paddingBottom: 12 },
  signOut: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.occupiedLight,
  },
  signOutText: { fontSize: 14, fontWeight: '700', color: colors.red },
  pressed: { opacity: 0.6 },
  spacer: { height: 8 },
});
