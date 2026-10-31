import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DemoProvider } from '../demo';
import { ParkingProvider } from '../store';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ParkingProvider>
        <DemoProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="lot/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="reserve/[lotId]" />
            <Stack.Screen name="reservation/[id]" />
            <Stack.Screen name="checkout/[planId]" />
          </Stack>
        </DemoProvider>
      </ParkingProvider>
    </SafeAreaProvider>
  );
}
