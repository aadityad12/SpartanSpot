import { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import type { Garage } from '../../mock/garages';
import { IconButton } from '../ui';
import { Badge } from '../kit';

function PulseDot() {
  const opacity = useState(() => new Animated.Value(1))[0];

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return <Animated.View style={[styles.dot, { opacity }]} />;
}

export function GarageHeader({
  garage,
  saved,
  onBack,
  onToggleSaved,
}: {
  garage: Garage;
  saved: boolean;
  onBack: () => void;
  onToggleSaved: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <IconButton name="arrow-left" label="Go back" onPress={onBack} />
        <View style={styles.titleBlock}>
          <Text accessibilityRole="header" style={styles.title}>{garage.name}</Text>
          <Text style={styles.address}>{garage.address}</Text>
        </View>
        <IconButton
          name="bookmark"
          label={saved ? `Unsave ${garage.name}` : `Save ${garage.name}`}
          active={saved}
          onPress={onToggleSaved}
        />
      </View>
      <View style={styles.statusRow}>
        {garage.cameraMonitored ? (
          <View style={styles.live}>
            <PulseDot />
            <Text style={styles.statusText}>Camera monitored · updated 12 s ago</Text>
          </View>
        ) : (
          <Text style={styles.statusText}>Estimated from entry counts</Text>
        )}
        <Badge label="Sample data" tone="warning" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleBlock: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.7, color: colors.ink },
  address: { fontSize: 13, color: colors.muted, marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  live: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.available },
  statusText: { fontSize: 12, color: colors.muted },
});
