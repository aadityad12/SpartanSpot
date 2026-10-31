import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { Card, SectionHeader } from '../../kit';
import { Icon, type IconName } from '../../ui';

const steps: { icon: IconName; title: string; detail: string }[] = [
  { icon: 'video', title: 'Camera', detail: 'Streams frames of each level' },
  { icon: 'cpu', title: 'Computer vision', detail: 'YOLO marks cars and empty stalls' },
  { icon: 'database', title: 'Database', detail: 'Stores each spot status change' },
  { icon: 'smartphone', title: 'App', detail: 'Students and staff see live spots' },
];

export function PipelineCard() {
  return (
    <View style={styles.wrap}>
      <SectionHeader title="How detection works" />
      <Card>
        <View style={styles.steps}>
          {steps.map((step, index) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.iconWrap}>
                <Icon name={step.icon} size={18} color={colors.primary} />
              </View>
              <Text style={styles.number}>{index + 1}</Text>
              <Text style={styles.title}>{step.title}</Text>
              <Text style={styles.detail}>{step.detail}</Text>
              {index < steps.length - 1 ? (
                <View style={styles.arrow}>
                  <Icon name="chevron-right" size={16} color={colors.muted} />
                </View>
              ) : null}
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  steps: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  step: { flexBasis: '25%', minWidth: 120, flexGrow: 1, alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  title: { fontSize: 13, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  detail: { fontSize: 11, lineHeight: 15, color: colors.muted, textAlign: 'center' },
  arrow: { position: 'absolute', right: -8, top: 12 },
});
