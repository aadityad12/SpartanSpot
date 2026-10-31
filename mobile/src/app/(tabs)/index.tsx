import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampusMap } from '../../components/CampusMap';
import { LotCard } from '../../components/LotCard';
import { Button, Emblem, EmptyState, Icon, IconButton, typography } from '../../components/ui';
import { useParking } from '../../store';
import { colors } from '../../theme';

const filters = ['All parking', 'Available', 'Covered', 'EV charging', 'Accessible'];

export default function DiscoverScreen() {
  const { feed, loading, error, refresh, stale } = useParking();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All parking');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState('south');
  const [sort, setSort] = useState('Most available');
  const [showSort, setShowSort] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const lots = useMemo(() => feed.lots.filter(lot => `${lot.name} ${lot.subtitle} ${lot.permit}`.toLowerCase().includes(query.toLowerCase()))
    .filter(lot => filter === 'All parking' || (filter === 'Available' ? !stale && lot.available > 0 : lot.tags.includes(filter)))
    .sort((first, second) => sort === 'Closest walk' ? (first.walkMinutes ?? Infinity) - (second.walkMinutes ?? Infinity) : second.available - first.available), [feed, query, filter, sort, stale]);
  const available = feed.lots.reduce((total, lot) => total + lot.available, 0);
  const modeLabel = feed.mode === 'demo' ? 'DEMO EXPERIENCE' : stale ? 'FEED UNAVAILABLE' : 'CAMERA CONNECTED';

  return <SafeAreaView edges={['top']} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} tintColor={colors.primary} />}>
      <View style={styles.header}><View style={styles.brand}><View style={styles.logo}><Emblem size={28} /></View><View><Text style={styles.brandName}>spartan<Text style={{ fontWeight: '400' }}>spot</Text><Text style={{ color: colors.gold }}>.</Text></Text><Text style={styles.brandTag}>LESS CIRCLING. MORE CAMPUS.</Text></View></View><IconButton name="bell" label="About parking updates" onPress={() => setShowInfo(true)} /></View>
      <View style={styles.campus}><Icon name="map-pin" size={12} color={colors.primary} /><Text style={styles.campusName}>Main campus</Text><Icon name="chevron-down" size={12} color={colors.primary} /><View style={styles.modePill}><View style={[styles.modeDot, stale && { backgroundColor: colors.amber }]} /><Text style={styles.modeText}>{modeLabel}</Text></View></View>
      <View style={styles.greeting}><Text style={typography.title}>Your spot is out there.</Text><Text style={[typography.subtitle, { marginTop: 6 }]}>Let’s make getting to campus the easy part.</Text></View>
      <LinearGradient colors={[colors.primary, colors.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroCircle} /><View style={styles.heroCircleInner} /><View style={styles.heroTop}><View style={styles.heroBadge}><View style={styles.heroDot} /><Text style={styles.heroEyebrow}>{feed.mode === 'demo' ? 'A LITTLE LESS GUESSWORK' : 'CAMPUS AVAILABILITY'}</Text></View><Icon name="arrow-up-right" color="#C9D6E3" size={21} /></View>
        <View style={styles.heroMain}><Text style={styles.heroNumber}>{stale ? '—' : available}</Text><Text style={styles.heroNumberLabel}>open spots{ '\n' }to get you going.</Text></View>
        <View style={styles.heroFooter}><Text style={styles.heroFooterText}>{feed.mode === 'demo' ? 'Sample availability · Not a live camera feed' : stale ? 'Waiting for fresh camera detections' : `Across ${feed.lots.length} monitored location${feed.lots.length === 1 ? '' : 's'} · Refreshes every 15s`}</Text><Icon name="radio" color="#B9C8D8" size={13} /></View>
      </LinearGradient>
      {error && <Pressable accessibilityRole="button" onPress={() => void refresh()} style={styles.notice}><Icon name="wifi-off" size={15} color={colors.amber} /><Text style={styles.noticeText}>{error} Tap to retry. Old counts are not shown as available.</Text></Pressable>}
      <View style={styles.searchRow}><View style={styles.search}><Icon name="search" size={18} color={colors.muted} /><TextInput accessibilityLabel="Search parking" placeholder="Find a garage or parking lot" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={styles.searchInput} returnKeyType="search" />{query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={10}><Icon name="x" size={16} color={colors.muted} /></Pressable> : null}</View><IconButton name="sliders" label="Sort parking lots" onPress={() => setShowSort(true)} /></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{filters.map(item => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: filter === item }} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>{item === 'All parking' && <Icon name="grid" size={12} color={filter === item ? colors.white : colors.muted} />}{item === 'EV charging' && <Icon name="zap" size={12} color={filter === item ? colors.white : colors.muted} />}<Text style={[styles.filterText, filter === item && { color: colors.white }]}>{item}</Text></Pressable>)}</ScrollView>
      <View style={styles.sectionRow}><Text style={typography.section}>Find your space</Text><View style={styles.viewToggle}>{(['map', 'list'] as const).map(item => <Pressable key={item} accessibilityRole="button" accessibilityLabel={`${item} view`} accessibilityState={{ selected: view === item }} onPress={() => setView(item)} style={[styles.viewOption, view === item && styles.viewActive]}><Icon name={item === 'map' ? 'map' : 'list'} size={12} color={view === item ? colors.primary : colors.muted} /><Text style={[styles.viewText, view === item && { color: colors.primary }]}>{item === 'map' ? 'Map' : 'List'}</Text></Pressable>)}</View></View>
      {view === 'map' && <><CampusMap lots={lots} selected={selected} onSelect={id => { setSelected(id); router.push(`/lot/${id}`); }} stale={stale} /><View style={styles.mapLegend}><View style={styles.legendGroup}><View style={styles.legendDot} /><Text style={styles.legendText}>Available parking</Text></View><Text style={styles.legendText}>Tap a pin to explore</Text></View></>}
      <View style={[styles.sectionRow, { marginTop: view === 'map' ? 19 : 0 }]}><Text style={typography.section}>{query || filter !== 'All parking' ? 'Matching parking' : 'Parking near campus'}<Text style={styles.resultCount}>  {lots.length}</Text></Text><Pressable accessibilityRole="button" accessibilityLabel="Change sort order" onPress={() => setShowSort(true)} style={styles.sort}><Text style={styles.sortText}>{sort}</Text><Icon name="chevron-down" size={12} color={colors.muted} /></Pressable></View>
      {lots.map((lot, index) => <LotCard key={lot.id} lot={lot} recommended={!query && filter === 'All parking' && index === 0 && lot.available > 0 && !stale} />)}
      {!lots.length && <EmptyState icon="search" title={feed.lots.length ? 'No spots match just yet' : 'Waiting for your parking feed'} description={feed.lots.length ? 'Try another search or choose a different parking filter.' : 'Connect your parking server in Settings, then pull down to refresh.'} />}
      <View style={styles.tip}><View style={styles.tipIcon}><Icon name="sun" size={18} color={colors.amber} /></View><View style={{ flex: 1 }}><Text style={styles.tipTitle}>A little planning goes a long way.</Text><Text style={styles.tipText}>Save your go-to lots for a quicker start tomorrow.</Text></View></View>
      <Text style={styles.footer}>BUILT FOR YOUR CAMPUS. MADE FOR YOUR DAY.</Text>
    </ScrollView>
    <Modal visible={showSort} transparent animationType="fade" onRequestClose={() => setShowSort(false)}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.sectionRow}><Text style={typography.section}>Find your kind of spot</Text><IconButton name="x" label="Close sorting" onPress={() => setShowSort(false)} /></View><Text style={typography.subtitle}>Sort parking lots by what matters to you.</Text>{['Most available', 'Closest walk'].map(option => <Pressable accessibilityRole="button" key={option} onPress={() => { setSort(option); setShowSort(false); }} style={styles.sortOption}><Text style={styles.optionText}>{option}</Text><Icon name={sort === option ? 'check-circle' : 'circle'} color={sort === option ? colors.primary : colors.muted} /></Pressable>)}</View></View></Modal>
    <Modal visible={showInfo} transparent animationType="slide" onRequestClose={() => setShowInfo(false)}><View style={styles.modalBackdrop}><View style={styles.modal}><View style={styles.sectionRow}><Text style={typography.section}>In the loop, not in circles.</Text><IconButton name="x" label="Close updates" onPress={() => setShowInfo(false)} /></View><Text style={[typography.subtitle, { marginBottom: 20 }]}>Spartan Spot refreshes connected parking data every 15 seconds while the app is open. Detections older than a minute are treated as unknown.{ '\n\n' }You’re {feed.mode === 'demo' ? 'exploring sample data. Connect your camera server in Settings to see real availability.' : 'using your configured camera server. Availability is an estimate, not a reserved spot.'}{ '\n\n' }Push notifications are not enabled in this version.</Text><Button title="Got it" onPress={() => setShowInfo(false)} /></View></View></Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, paddingTop: 15, paddingBottom: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logo: { width: 40, height: 43, backgroundColor: colors.primaryLight, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  brandName: { fontSize: 24, fontWeight: '800', letterSpacing: -1.1, color: colors.ink },
  brandTag: { fontSize: 6, letterSpacing: 1.4, fontWeight: '600', marginTop: 3, color: colors.muted },
  campus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 24 },
  campusName: { fontSize: 10, color: colors.primary, fontWeight: '600' },
  modePill: { marginLeft: 'auto', flexDirection: 'row', gap: 5, alignItems: 'center', paddingVertical: 5, paddingHorizontal: 7, backgroundColor: colors.availableLight, borderRadius: 6 },
  modeDot: { width: 4, height: 4, backgroundColor: colors.available, borderRadius: 2 },
  modeText: { fontSize: 6, color: colors.available, letterSpacing: 0.7, fontWeight: '700' },
  greeting: { marginTop: 20, marginBottom: 22 },
  hero: { borderRadius: 21, padding: 19, overflow: 'hidden', marginBottom: 22 },
  heroCircle: { position: 'absolute', width: 220, height: 220, borderWidth: 1, borderColor: '#FFFFFF0A', borderRadius: 110, right: -70, top: -15 },
  heroCircleInner: { position: 'absolute', width: 155, height: 155, borderWidth: 1, borderColor: '#FFFFFF0A', borderRadius: 100, right: -35, top: 17 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.gold },
  heroEyebrow: { fontSize: 8, fontWeight: '600', color: '#D3DEEA', letterSpacing: 1.3 },
  heroMain: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingTop: 12, paddingBottom: 16 },
  heroNumber: { fontSize: 59, fontWeight: '600', letterSpacing: -3, color: colors.white, lineHeight: 67 },
  heroNumberLabel: { fontSize: 14, color: '#DCE5EE', lineHeight: 21, letterSpacing: -0.2 },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#FFFFFF20', paddingTop: 12 },
  heroFooterText: { fontSize: 8, color: '#BCCBDA' },
  searchRow: { flexDirection: 'row', gap: 9 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 13, height: 45, flex: 1 },
  searchInput: { flex: 1, fontSize: 11, color: colors.ink, height: 43, outlineWidth: 0 },
  filters: { gap: 7, paddingTop: 12, paddingBottom: 24 },
  filter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 33, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 10 },
  activeFilter: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 9, fontWeight: '500', color: colors.muted },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.primaryLight, borderRadius: 8, padding: 3 },
  viewOption: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: 9, borderRadius: 6 },
  viewActive: { backgroundColor: colors.white },
  viewText: { fontSize: 9, color: colors.muted, fontWeight: '600' },
  mapLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 11 },
  legendGroup: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 5, height: 5, backgroundColor: colors.available, borderRadius: 3 },
  legendText: { fontSize: 8, color: colors.muted },
  resultCount: { fontSize: 11, color: colors.muted, fontWeight: '400' },
  sort: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 8 },
  sortText: { fontSize: 8, color: colors.muted },
  tip: { flexDirection: 'row', gap: 11, alignItems: 'center', backgroundColor: colors.goldLight, borderRadius: 15, padding: 14, marginTop: 6 },
  tipIcon: { backgroundColor: '#F8E4B4', width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 10, fontWeight: '600', color: '#6B531E' },
  tipText: { fontSize: 8, lineHeight: 14, color: '#8A7440', marginTop: 3 },
  footer: { fontSize: 6, letterSpacing: 1.5, color: colors.muted, textAlign: 'center', marginTop: 28, marginBottom: 4 },
  notice: { backgroundColor: colors.goldLight, padding: 12, borderRadius: 12, flexDirection: 'row', gap: 8, marginBottom: 16 },
  noticeText: { flex: 1, fontSize: 11, color: colors.amber, lineHeight: 17 },
  modalBackdrop: { flex: 1, backgroundColor: '#102C4460', justifyContent: 'center', padding: 22 },
  modal: { backgroundColor: colors.background, borderRadius: 24, padding: 22, maxWidth: 480, alignSelf: 'center', width: '100%' },
  sortOption: { paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between' },
  optionText: { color: colors.ink, fontSize: 14 },
});
