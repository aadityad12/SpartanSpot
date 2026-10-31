import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampusMap } from '../../components/CampusMap';
import { Button, EmptyState, Icon, IconButton, typography } from '../../components/ui';
import { availability } from '../../data';
import { useParking } from '../../store';
import { colors } from '../../theme';

export default function LotScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { feed, favorites, toggleFavorite, park, stale, session } = useParking();
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const lot = feed.lots.find(item => item.id === id);
  const close = () => { if (router.canGoBack()) router.back(); else router.replace('/'); };
  if (!lot) return <SafeAreaView style={styles.screen}><View style={styles.content}><IconButton name="arrow-left" label="Go back" onPress={close} /><EmptyState icon="map-pin" title="This lot isn’t in the current feed" description="Return to parking to find an available location." /></View></SafeAreaView>;
  const status = availability(lot, stale);
  const saveSession = () => {
    park({ lotId: lot.id, lotName: lot.name, startedAt: new Date().toISOString(), note: note.trim(), demo: feed.mode === 'demo' });
    router.replace('/activity');
  };
  const directions = async () => {
    if (!lot.destination) return;
    try {
      await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lot.destination)}`);
    } catch {
      setMessage('Could not open your map app. Please try again.');
    }
  };
  return <SafeAreaView style={styles.screen}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><View style={styles.header}><IconButton name="arrow-left" label="Go back" onPress={close} /><Text style={typography.eyebrow}>A PLACE TO LAND</Text><IconButton name="bookmark" label={favorites.includes(lot.id) ? 'Unsave lot' : 'Save lot'} active={favorites.includes(lot.id)} onPress={() => toggleFavorite(lot.id)} /></View><Text style={[typography.title, { marginTop: 25 }]}>{lot.name}</Text><Text style={[typography.subtitle, { marginTop: 7, marginBottom: 24 }]}>{lot.subtitle}</Text><CampusMap lots={[lot]} selected={lot.id} onSelect={() => {}} stale={stale} /><View style={styles.stats}><View><Text style={[styles.count, { color: status.color }]}>{stale ? '—' : lot.available}<Text style={styles.ofTotal}> / {lot.total}</Text></Text><Text style={typography.subtitle}>{status.label}</Text></View><View style={styles.walk}><Icon name="map-pin" color={colors.green} /><Text style={styles.walkText}>{lot.walkMinutes === null ? 'Camera monitored' : `${lot.walkMinutes} min walk`}</Text></View></View><View style={styles.tags}>{lot.tags.map(tag => <View key={tag} style={styles.tag}><Icon name={tag === 'EV charging' ? 'zap' : tag === 'Covered' ? 'home' : 'check-circle'} color={colors.green} size={13} /><Text style={styles.tagText}>{tag}</Text></View>)}</View><View style={styles.info}><Icon name="credit-card" color={colors.green} /><View style={{ flex: 1 }}><Text style={styles.infoTitle}>{lot.permit}</Text><Text style={styles.infoText}>A valid campus permit may be required. Always check posted signs for parking rules and rates.</Text></View></View>{lot.destination && <Button title="Get directions" icon="navigation" onPress={() => void directions()} />}{!lot.destination && <Text style={styles.infoText}>{feed.mode === 'demo' ? 'Demo location. Counts, walking times, and the campus diagram are illustrative, not real parking guidance.' : 'Configure PARKING_DESTINATION on the server to enable directions. The campus diagram is illustrative.'}</Text>}<View style={styles.reminder}><Text style={typography.section}>Make it easy to find your way back.</Text><Text style={typography.subtitle}>Add a level or space number. We’ll keep it on this device.</Text><TextInput accessibilityLabel="Parking level or space number" placeholder="e.g. Level 2, space B24" placeholderTextColor={colors.muted} value={note} maxLength={120} onChangeText={setNote} style={styles.input} /><Button title={session ? 'Replace my parking reminder' : 'I parked here'} icon="check-circle" onPress={saveSession} /><Text style={styles.infoText}>{session ? `This replaces your reminder for ${session.lotName}. ` : ''}This does not reserve a space or pay for parking.</Text></View>{message && <Text accessibilityLiveRegion="polite" style={styles.infoText}>{message}</Text>}</ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 36 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 24 },
  count: { fontSize: 43, fontWeight: '700', letterSpacing: -1.5 },
  ofTotal: { color: colors.muted, fontSize: 18, fontWeight: '400' },
  walk: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  walkText: { color: colors.green, fontWeight: '600', fontSize: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 22 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, backgroundColor: colors.lightGreen, borderRadius: 10 },
  tagText: { color: colors.green, fontSize: 10 },
  info: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20, marginBottom: 20 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  infoText: { fontSize: 11, lineHeight: 18, color: colors.muted, marginVertical: 8 },
  reminder: { marginTop: 24, gap: 13 },
  input: { padding: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, borderRadius: 13, fontSize: 14, color: colors.ink },
});
