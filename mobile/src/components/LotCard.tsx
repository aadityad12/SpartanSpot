import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { availability, type ParkingLot } from '../data';
import { useParking } from '../store';
import { colors } from '../theme';
import { Icon } from './ui';

export function LotCard({ lot, recommended = false }: { lot: ParkingLot; recommended?: boolean }) {
  const { favorites, toggleFavorite, stale, feed } = useParking();
  const status = availability(lot, stale);
  const saved = favorites.includes(lot.id);
  return <View style={[styles.card, recommended && styles.recommended]}>
    {recommended && <View style={styles.recommendation}><Icon name="zap" size={11} color={colors.primary} /><Text style={styles.recommendationText}>YOUR BEST BET</Text><Text style={styles.recommendationDetail}>More space. Less searching.</Text></View>}
    <View style={styles.top}>
      <Pressable accessibilityRole="button" accessibilityLabel={`View ${lot.name}`} onPress={() => router.push(`/lot/${lot.id}`)} style={styles.main}>
        <View style={[styles.parkingIcon, recommended && { backgroundColor: '#DCE6F0' }]}><Text style={styles.parkingLetter}>P</Text><View style={styles.miniLine} /></View>
        <View style={{ flex: 1, gap: 5 }}><Text style={styles.name}>{lot.name}</Text><Text style={styles.subtitle}>{lot.subtitle}</Text></View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${lot.name}`} accessibilityState={{ selected: saved }} onPress={() => toggleFavorite(lot.id)} style={styles.save}><Icon name="bookmark" size={19} color={saved ? colors.primary : colors.muted} />{saved && <View style={styles.savedDot} />}</Pressable>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={`View availability for ${lot.name}`} onPress={() => router.push(`/lot/${lot.id}`)} style={styles.bottom}>
      <View style={styles.numberRow}><Text style={[styles.count, { color: status.color }]}>{stale ? '—' : lot.available}</Text><View style={{ gap: 3 }}><Text style={styles.spots}>spots open</Text><Text style={styles.capacity}>of {lot.total} {feed.mode === 'demo' ? 'sample spaces' : 'monitored'}</Text></View></View>
      <View style={styles.walk} accessibilityLabel={lot.walkMinutes === null ? 'Camera feed' : `Approximate ${lot.walkMinutes} minute walk to Student Union`}><Icon name="map-pin" size={13} color={colors.muted} /><Text style={styles.walkText}>{lot.walkMinutes === null ? 'Camera feed' : `~${lot.walkMinutes} min walk`}</Text><Icon name="arrow-up-right" size={18} color={colors.primary} /></View>
    </Pressable>
    <View style={styles.statusRow}><View style={[styles.dot, { backgroundColor: status.color }]} /><Text style={[styles.status, { color: status.color }]}>{status.label}</Text><Text style={styles.permit}>{lot.permit}</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20, marginBottom: 12, padding: 17 },
  recommended: { borderColor: '#CBD8E4', backgroundColor: '#FBFCFE' },
  recommendation: { flexDirection: 'row', gap: 5, alignItems: 'center', marginBottom: 16 },
  recommendationText: { color: colors.primary, fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  recommendationDetail: { color: colors.muted, fontSize: 9, marginLeft: 'auto' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 11 },
  parkingIcon: { height: 42, width: 42, backgroundColor: colors.primaryLight, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  parkingLetter: { color: colors.primary, fontWeight: '800', fontSize: 22 },
  miniLine: { height: 2, width: 18, backgroundColor: colors.gold, borderRadius: 1 },
  name: { fontSize: 16, color: colors.ink, fontWeight: '700', letterSpacing: -0.4 },
  subtitle: { color: colors.muted, fontSize: 10 },
  save: { width: 36, height: 42, alignItems: 'center', justifyContent: 'center' },
  savedDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, position: 'absolute', bottom: 5 },
  bottom: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, alignItems: 'center', justifyContent: 'space-between', marginTop: 18, marginBottom: 16 },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: { fontWeight: '700', fontSize: 32, letterSpacing: -1.5 },
  spots: { color: colors.ink, fontSize: 10, fontWeight: '600' },
  capacity: { color: colors.muted, fontSize: 9 },
  walk: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  walkText: { fontSize: 10, color: colors.muted, marginRight: 3 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  dot: { height: 5, width: 5, borderRadius: 3 },
  status: { fontSize: 9, fontWeight: '600' },
  permit: { marginLeft: 'auto', color: colors.muted, fontSize: 9 },
});
