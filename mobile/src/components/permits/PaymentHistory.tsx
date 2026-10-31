import { StyleSheet, Text, View } from 'react-native';
import type { Payment } from '../../mock/permits';
import { colors } from '../../theme';
import { Card } from '../kit';
import { formatMoney } from '../reservations/format';
import { fullDate } from './format';

export function PaymentHistory({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <Card>
        <Text style={styles.empty}>No payments yet.</Text>
      </Card>
    );
  }
  return (
    <Card style={styles.card}>
      {payments.map((payment, index) => (
        <View
          key={payment.id}
          accessible
          accessibilityLabel={`${payment.description}, ${formatMoney(payment.amount)}, ${fullDate(payment.date)}, ${payment.method}`}
          style={[styles.row, index > 0 && styles.divider]}
        >
          <View style={styles.text}>
            <Text style={styles.title}>{payment.description}</Text>
            <Text style={styles.meta}>{fullDate(payment.date)} · {payment.method}</Text>
          </View>
          <Text style={styles.amount}>{formatMoney(payment.amount)}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  text: { flex: 1 },
  title: { fontSize: 14, fontWeight: '600', color: colors.ink },
  meta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700', color: colors.ink },
  empty: { fontSize: 13, color: colors.muted },
});
