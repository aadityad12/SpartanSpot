import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Card, ListRow, PageHeader, Placeholder, Screen } from '../../components/kit';
import { Button } from '../../components/ui';
import { useDemo } from '../../demo';
import { colors } from '../../theme';

export default function AccountScreen() {
  const { student, signOut } = useDemo();
  return (
    <Screen>
      <PageHeader eyebrow="Student" title="Account" />
      <Card>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{student.initials}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.name}>{student.name}</Text>
            <Text style={styles.email}>{student.email}</Text>
          </View>
        </View>
        <ListRow icon="book-open" title={student.major} subtitle={`SJSU ID ${student.sjsuId}`} />
      </Card>
      <Placeholder
        title="Account details"
        issue={6}
        description="Vehicles, notification settings and payment methods will be managed here."
      />
      <Button
        title="Sign out"
        icon="log-out"
        secondary
        onPress={() => {
          signOut();
          router.replace('/sign-in');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.gold, fontSize: 18, fontWeight: '700' },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.ink },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
