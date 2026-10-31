import { StyleSheet, Text, View } from 'react-native';
import type { StudentProfile } from '../../mock/people';
import { colors } from '../../theme';
import { Card } from '../kit';
import { Icon } from '../ui';

function Detail({ icon, text }: { icon: 'hash' | 'mail' | 'book-open'; text: string }) {
  return (
    <View style={styles.detail}>
      <Icon name={icon} size={14} color={colors.muted} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

export function ProfileCard({ student }: { student: StudentProfile }) {
  return (
    <Card style={styles.card}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.avatar}>
        <Text style={styles.avatarText}>{student.initials}</Text>
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{student.name}</Text>
        <Detail icon="hash" text={`SJSU ID ${student.sjsuId}`} />
        <Detail icon="mail" text={student.email} />
        <Detail icon="book-open" text={student.major} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.gold, fontSize: 22, fontWeight: '700' },
  text: { flex: 1, gap: 4 },
  name: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, color: colors.ink, marginBottom: 2 },
  detail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { flex: 1, fontSize: 13, color: colors.muted },
});
