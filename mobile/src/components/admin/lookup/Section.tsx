import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';
import { colors } from '../../../theme';
import { Card } from '../../kit';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card style={styles.card}>
      <Text accessibilityRole="header" style={styles.title}>{title.toUpperCase()}</Text>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8 },
  title: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
});
