import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../theme';
import { Button } from '../ui';

// Pinned over the scroll view so the main action is always reachable.
export const reserveFooterHeight = 88;

export function ReserveFooter({ onPress }: { onPress: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: 12 + insets.bottom }]}>
      <View style={styles.inner}>
        <Button title="Reserve a spot here" icon="arrow-right" onPress={onPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center' },
});
