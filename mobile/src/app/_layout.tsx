import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ParkingProvider } from '../store';
import { colors } from '../theme';

export default function RootLayout() {
  return <SafeAreaProvider><ParkingProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}><Stack.Screen name="(tabs)" /><Stack.Screen name="lot/[id]" options={{ presentation: 'modal' }} /></Stack></ParkingProvider></SafeAreaProvider>;
}
