import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { type ParkingLot } from '../data';
import { colors } from '../theme';
import { Icon } from './ui';

export function CampusMap({ lots, selected, onSelect, stale }: { lots: ParkingLot[]; selected: string; onSelect: (id: string) => void; stale: boolean }) {
  return <View style={styles.map}>
    <Svg width="100%" height="100%" viewBox="0 0 380 310" preserveAspectRatio="xMidYMid slice">
      <Rect width="380" height="310" fill="#EBEEE4" />
      <G fill="#E0E5D8" stroke="#D6DDCF" strokeWidth="1">
        <Rect x="-10" y="15" width="70" height="70" rx="5" /><Rect x="86" y="-20" width="92" height="66" rx="5" />
        <Rect x="290" y="-5" width="100" height="75" rx="5" /><Rect x="-15" y="235" width="65" height="85" rx="5" />
        <Rect x="88" y="247" width="75" height="80" rx="5" /><Rect x="313" y="239" width="80" height="85" rx="5" />
      </G>
      <Path d="M68-15 67 330M-20 104H410M-20 222H400M277-20v350" stroke="#D5DACD" strokeWidth="17" />
      <Path d="M68-15 67 330M-20 104H410M-20 222H400M277-20v350" stroke="#FAFBF5" strokeWidth="12" />
      <Rect x="106" y="127" width="145" height="74" rx="8" fill="#D8E3C8" />
      <Path d="m110 160 136 1M177 130v67" stroke="#ECF0DE" strokeWidth="5" />
      <G fill="#D5DCCD" stroke="#C6CEBE" strokeWidth="1">
        <Rect x="103" y="56" width="54" height="26" rx="3" /><Rect x="171" y="52" width="73" height="30" rx="3" />
        <Rect x="88" y="134" width="17" height="53" rx="3" /><Rect x="299" y="139" width="56" height="60" rx="4" />
        <Rect x="184" y="244" width="66" height="48" rx="3" />
      </G>
      <G fill="#BDD0AA">{[[122, 139], [145, 185], [228, 143], [229, 186], [93, 25], [320, 93], [40, 118], [290, 258], [32, 200], [176, 237]].map(([x, y], index) => <Circle key={index} cx={x} cy={y} r="5" />)}</G>
      <SvgText x="178" y="158" fill="#7E9072" fontSize="10" textAnchor="middle" fontWeight="600" letterSpacing="1.4">TOWER LAWN</SvgText>
      <SvgText x="206" y="72" fill="#87907D" fontSize="7" textAnchor="middle">LIBRARY</SvgText>
      <SvgText x="215" y="270" fill="#87907D" fontSize="7" textAnchor="middle">STUDENT UNION</SvgText>
      <SvgText x="138" y="216" fill="#9DA491" fontSize="7" letterSpacing="1.3">CAMPUS WALK</SvgText>
      <Path d="M122 204h69v-24" fill="none" stroke={colors.green} strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
      <Circle cx="191" cy="180" r="14" fill={colors.green} opacity="0.08" /><Circle cx="191" cy="180" r="7" fill="#FFF" /><Circle cx="191" cy="180" r="4" fill={colors.green} />
    </Svg>
    {lots.map(lot => <Pressable accessibilityRole="button" accessibilityLabel={`Select ${lot.name}`} key={lot.id} onPress={() => onSelect(lot.id)} style={[styles.pin, { left: `${Math.min(85, Math.max(10, lot.mapX))}%`, top: `${Math.min(84, Math.max(12, lot.mapY))}%` }, selected === lot.id && styles.selectedPin]}>
      <Text style={[styles.pinP, selected === lot.id && styles.selectedText]}>P</Text><View style={[styles.pinSeparator, selected === lot.id && { backgroundColor: '#FFFFFF40' }]} /><Text style={[styles.pinCount, selected === lot.id && styles.selectedText]}>{stale ? '—' : lot.available}</Text>
    </Pressable>)}
    <View style={styles.caption}><Icon name="map" size={10} color={colors.muted} /><Text style={styles.captionText}>Illustrative campus map</Text></View>
    <View style={styles.compass}><Icon name="navigation-2" size={14} color={colors.green} /><Text style={styles.north}>N</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  map: { height: 285, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: '#E1E5D9', position: 'relative' },
  pin: { position: 'absolute', flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 10, height: 34, backgroundColor: colors.white, borderRadius: 11, marginLeft: -30, marginTop: -17, borderWidth: 1, borderColor: '#D6DDCF', boxShadow: '0px 3px 8px #243E2517' },
  selectedPin: { backgroundColor: colors.green, borderColor: colors.green, boxShadow: '0px 4px 12px #245C4540' },
  pinP: { fontWeight: '700', color: colors.green, fontSize: 13 },
  pinSeparator: { width: 1, height: 14, backgroundColor: colors.border },
  pinCount: { fontWeight: '700', color: colors.ink, fontSize: 12 },
  selectedText: { color: colors.white },
  caption: { position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFFFFDD', padding: 6, borderRadius: 7 },
  captionText: { fontSize: 8, color: colors.muted },
  compass: { position: 'absolute', right: 12, top: 12, alignItems: 'center', backgroundColor: '#FFFFFFDD', padding: 8, borderRadius: 10, gap: 2 },
  north: { fontSize: 8, fontWeight: '700', color: colors.green },
});
