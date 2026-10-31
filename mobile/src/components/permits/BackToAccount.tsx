import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { IconButton } from '../ui';

// Saved garages, Where I parked and Server connection are opened from Account, not the tab bar.
export function BackToAccount() {
  return (
    <View style={styles.wrap}>
      <IconButton name="arrow-left" label="Back to account" onPress={() => router.navigate('/account')} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', marginBottom: 18 },
});
