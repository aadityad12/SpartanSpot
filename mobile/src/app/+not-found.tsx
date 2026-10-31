import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState } from '../components/ui';

export default function NotFound() {
  return <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}><EmptyState icon="compass" title="Let’s get you back on campus" description="That page could not be found." /><Button title="Find parking" onPress={() => router.replace('/')} /></SafeAreaView>;
}
