import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, EmptyState, Icon, typography } from '../../components/ui';
import { BackToAccount } from '../../components/permits/BackToAccount';
import { useParking } from '../../store';
import { colors } from '../../theme';

export default function ActivityScreen() {
  const { session, clearSession } = useParking();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(interval); }, []);
  const minutes = session ? Math.max(0, Math.floor((now - Date.parse(session.startedAt)) / 60000)) : 0;
  return <SafeAreaView edges={['top']} style={{ flex: 1 }}><ScrollView contentContainerStyle={styles.content}><BackToAccount /><Text style={typography.eyebrow}>ONE LESS THING TO REMEMBER</Text><Text style={[typography.title, { marginTop: 13 }]}>Right where you left it.</Text><Text style={[typography.subtitle, { marginTop: 10, marginBottom: 30 }]}>A simple reminder of where you parked.</Text>{session ? <View style={styles.card}><View style={styles.icon}><Icon name="truck" color={colors.primary} size={30} /></View><Text style={typography.eyebrow}>{session.demo ? 'DEMO PARKING REMINDER' : 'PARKING REMINDER'}</Text><Text style={typography.title}>{session.lotName}</Text><Text style={styles.note}>{session.note || 'No level or space noted.'}</Text><View style={styles.time}><Icon name="clock" color={colors.primary} /><Text style={styles.elapsed}>{minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`} since parking</Text></View><Text style={styles.disclaimer}>Saved {new Date(session.startedAt).toLocaleString()}.{ '\n' }This is a personal reminder, not a reservation or payment.</Text><Button title="I’ve left this spot" onPress={clearSession} icon="check" /></View> : <><EmptyState icon="truck" title="A spot for your parking spot" description="Open a lot and choose “I parked here” to remember your garage, level, or space number. No location tracking needed." /><Button title="Find a place to park" onPress={() => router.navigate('/')} icon="arrow-right" /></>}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  content: { padding: 24, maxWidth: 560, width: '100%', alignSelf: 'center' },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 24, gap: 18 },
  icon: { height: 65, width: 65, backgroundColor: colors.primaryLight, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  note: { color: colors.muted, fontSize: 15, lineHeight: 24 },
  time: { flexDirection: 'row', gap: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 },
  elapsed: { fontWeight: '600', color: colors.primary, fontSize: 14 },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 19 },
});
