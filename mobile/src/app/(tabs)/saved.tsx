import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LotCard } from '../../components/LotCard';
import { BackToAccount } from '../../components/permits/BackToAccount';
import { EmptyState, typography } from '../../components/ui';
import { useLots } from '../../useLots';
import { useParking } from '../../store';

export default function SavedScreen() {
  const { favorites } = useParking();
  const lots = useLots().filter(lot => favorites.includes(lot.id));
  return <SafeAreaView edges={['top']} style={{ flex: 1 }}><ScrollView contentContainerStyle={{ padding: 24, maxWidth: 560, width: '100%', alignSelf: 'center' }}><BackToAccount /><Text style={typography.eyebrow}>YOUR CAMPUS SHORTLIST</Text><Text style={[typography.title, { marginTop: 13 }]}>Familiar places.{ '\n' }Faster mornings.</Text><Text style={[typography.subtitle, { marginTop: 10, marginBottom: 25 }]}>Your go-to parking, all in one place.</Text>{lots.map(lot => <LotCard key={lot.id} lot={lot} />)}{!lots.length && <View style={{ marginTop: 40 }}><EmptyState icon="bookmark" title="Keep your favorites close" description="Tap the bookmark on any parking lot to save it here. Saved lots stay on this device between visits." /></View>}</ScrollView></SafeAreaView>;
}
