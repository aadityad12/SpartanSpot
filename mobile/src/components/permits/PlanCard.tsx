import { StyleSheet, Text, View } from 'react-native';
import type { Plan } from '../../mock/permits';
import { colors } from '../../theme';
import { Badge, Card } from '../kit';
import { Button, Icon } from '../ui';
import { formatMoney } from '../reservations/format';

export function PlanCard({
  plan,
  current,
  onChoose,
}: {
  plan: Plan;
  current: boolean;
  onChoose: () => void;
}) {
  return (
    <Card style={[styles.card, plan.popular && styles.popular]}>
      <View style={styles.top}>
        <Text style={styles.name}>{plan.name}</Text>
        {current ? <Badge label="Current plan" tone="available" icon="check-circle" /> : null}
        {plan.popular ? <Badge label="Most popular" tone="warning" icon="star" /> : null}
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoney(plan.price).replace('.00', '')}</Text>
        <Text style={styles.period}>{plan.period}</Text>
      </View>
      <Text style={styles.description}>{plan.description}</Text>

      <View style={styles.perks}>
        {plan.perks.map(perk => (
          <View key={perk} style={styles.perk}>
            <Icon name="check" size={15} color={colors.available} />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </View>

      {current ? (
        <View accessibilityRole="text" accessibilityLabel={`${plan.name} is your current plan`} style={styles.currentButton}>
          <Text style={styles.currentText}>Current plan</Text>
        </View>
      ) : (
        <Button title="Choose" icon="arrow-right" onPress={onChoose} />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10 },
  popular: { borderColor: colors.gold, borderWidth: 2 },
  top: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  name: { fontSize: 18, fontWeight: '700', color: colors.ink, marginRight: 'auto' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: { fontSize: 32, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  period: { fontSize: 13, color: colors.muted },
  description: { fontSize: 13, lineHeight: 20, color: colors.muted },
  perks: { gap: 6, marginVertical: 4 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  perkText: { fontSize: 13, color: colors.ink },
  currentButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.availableLight,
  },
  currentText: { fontSize: 14, fontWeight: '700', color: colors.available },
});
