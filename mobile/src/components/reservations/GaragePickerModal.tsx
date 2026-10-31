import { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../demo';
import { garageSummary, garages } from '../../mock/garages';
import { colors } from '../../theme';
import { ListRow } from '../kit';
import { IconButton } from '../ui';

export function GaragePickerModal({
  visible,
  onClose,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (garageId: string) => void;
}) {
  const { spotStatus } = useDemo();
  const open = useMemo(
    () => garages.map(garage => ({ garage, available: garageSummary(garage.id, spotStatus).available })),
    [spotStatus],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close garage picker" onPress={onClose} style={styles.dismiss} />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>Choose a garage</Text>
            <IconButton name="x" label="Close" onPress={onClose} />
          </View>
          {open.map(({ garage, available }) => (
            <ListRow
              key={garage.id}
              icon="map-pin"
              title={garage.name}
              subtitle={`${available} open now · ${garage.walkMinutes} min walk`}
              onPress={() => onPick(garage.id)}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(16, 44, 68, 0.45)' },
  dismiss: { flex: 1 },
  sheet: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 28,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: colors.ink },
});
