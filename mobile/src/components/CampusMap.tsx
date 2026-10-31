import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';
import type { ParkingLot } from '../data';
import { campusGeometry } from '../maps/campusGeometry';
import { areaForCoordinate, projectCoordinate, type CampusArea, type Coordinate } from '../maps/geography';
import { colors } from '../theme';
import { SegmentedControl } from './kit';
import { Icon } from './ui';

const landmarks: { name: string; location: Coordinate }[] = [
  { name: 'MLK LIBRARY', location: { longitude: -121.8849970, latitude: 37.3354776 } },
  { name: 'TOWER HALL', location: { longitude: -121.8833217, latitude: 37.3352318 } },
  { name: 'ENGINEERING', location: { longitude: -121.8813840, latitude: 37.3368104 } },
  { name: 'STUDENT UNION', location: { longitude: -121.8803890, latitude: 37.3366208 } },
  { name: 'REC & AQUATICS', location: { longitude: -121.8799187, latitude: 37.3343688 } },
];

export function CampusMap({ lots, selected, onSelect, stale }: { lots: ParkingLot[]; selected: string; onSelect: (id: string) => void; stale: boolean }) {
  const [area, setArea] = useState<CampusArea>('main');
  const [pixelWidth, setPixelWidth] = useState(340);
  const map = campusGeometry[area];
  const located = lots.filter(lot => lot.location && areaForCoordinate(lot.location) === area);
  const unlocated = lots.filter(lot => !lot.location || !areaForCoordinate(lot.location));
  const fontSize = 10 * map.width / pixelWidth;

  return <View style={styles.wrap}>
    <SegmentedControl
      options={[{ value: 'main', label: 'Main Campus' }, { value: 'south', label: 'South Campus' }]}
      value={area}
      onChange={value => setArea(value as CampusArea)}
    />
    <View style={[styles.map, { aspectRatio: map.width / map.height }]} onLayout={event => setPixelWidth(event.nativeEvent.layout.width || 340)}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${map.width} ${map.height}`} preserveAspectRatio="xMidYMid meet" accessibilityLabel={`SJSU ${area === 'main' ? 'Main' : 'South'} Campus streets and buildings. North is toward the upper right.`}>
        <Rect width={map.width} height={map.height} fill="#EBEEF1" />
        <Path d={map.paths.land} fill="#D8E3C8" />
        <Path d={map.paths.roads} fill="none" stroke="#D5DAE0" strokeWidth={18} strokeLinejoin="round" />
        <Path d={map.paths.roads} fill="none" stroke="#FAFBFC" strokeWidth={13} strokeLinejoin="round" />
        <Path d={map.paths.walkways} fill="none" stroke="#FAFBFC" strokeWidth={5} strokeLinejoin="round" />
        <Path d={map.paths.buildings} fill="#D6DCE3" stroke="#C6CDD6" strokeWidth={1.5} />
        <Path d={map.paths.garages} fill="#C6D7E6" stroke="#7896AE" strokeWidth={2} />
        {area === 'main' ? landmarks.map(landmark => {
          const point = projectCoordinate(landmark.location, area);
          return <SvgText key={landmark.name} x={point.x * map.width} y={point.y * map.height} fontSize={fontSize} fill="#506070" textAnchor="middle" fontWeight="600">{landmark.name}</SvgText>;
        }) : null}
        {map.labels.map(label => <SvgText key={label.name} transform={`translate(${label.x},${label.y}) rotate(${label.angle})`} textAnchor="middle" dy={-7} fill="#626F7B" fontSize={fontSize}>{label.name}</SvgText>)}
      </Svg>
      {located.map(lot => {
        const point = projectCoordinate(lot.location!, area);
        const active = selected === lot.id;
        return <View key={lot.id} pointerEvents="box-none" style={[styles.anchor, { left: `${point.x * 100}%`, top: `${point.y * 100}%`, zIndex: active ? 2 : 1 }]}>
          <View style={styles.locationDot} />
          <Pressable accessibilityRole="button" accessibilityLabel={`Select ${lot.name}, ${stale ? 'availability unknown' : `${lot.available} open spots`}`} accessibilityState={{ selected: active }} onPress={() => onSelect(lot.id)} style={[styles.pin, lot.id === 'west' && styles.westPin, lot.id === 'south' && styles.southPin, active && styles.selectedPin]}>
            <Text style={[styles.pinName, active && styles.selectedText]}>{lot.name.replace(' Garage', '')}</Text>
            <Text style={[styles.pinCount, active && styles.selectedText]}>{stale ? '—' : lot.available} <Text style={styles.open}>open</Text></Text>
          </Pressable>
        </View>;
      })}
      <View style={styles.compass} pointerEvents="none"><Icon name="navigation-2" size={14} color={colors.primary} /><Text style={styles.north}>N</Text></View>
    </View>
    {area === 'south' ? <Text style={styles.note}>10th & Alma · Eight blocks south of Main Campus. Shuttle service follows the SJSU schedule.</Text> : null}
    {unlocated.length > 0 ? <Text style={styles.note}>{unlocated.length} {unlocated.length === 1 ? 'lot has' : 'lots have'} no location on these campus maps. Availability is listed below.</Text> : null}
    {located.length === 0 ? <Text style={styles.note}>No matching parking in this campus area.</Text> : null}
    <View style={styles.sources}>
      <Link href="https://www.openstreetmap.org/copyright" style={styles.source}>© OpenStreetMap contributors</Link>
      <Link href="https://www.sjsu.edu/parking/maps/garages.php" style={styles.source}>SJSU parking map ↗</Link>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  map: { width: '100%', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' },
  // Keep callouts inside a real parent rectangle so native hit testing reaches them.
  // The geographic dot remains exactly at the percentage coordinate (52, 52).
  anchor: { position: 'absolute', width: 104, height: 60, marginLeft: -52, marginTop: -52 },
  locationDot: { position: 'absolute', width: 9, height: 9, left: 47.5, top: 47.5, borderRadius: 5, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.white },
  pin: { position: 'absolute', bottom: 16, left: 10, width: 84, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingVertical: 5, backgroundColor: colors.white, borderRadius: 11, borderWidth: 1, borderColor: colors.border, boxShadow: '0px 3px 8px #102C4417' },
  westPin: { left: 0 },
  southPin: { left: 20 },
  selectedPin: { backgroundColor: colors.primary, borderColor: colors.primary, boxShadow: '0px 4px 12px #173B5840' },
  pinName: { fontSize: 11, fontWeight: '600', color: colors.primary },
  pinCount: { fontWeight: '700', color: colors.ink, fontSize: 12 },
  open: { fontWeight: '400', fontSize: 10 },
  selectedText: { color: colors.white },
  compass: { position: 'absolute', left: 10, top: 10, alignItems: 'center', backgroundColor: '#FFFFFFDD', padding: 8, borderRadius: 10, gap: 2, transform: [{ rotate: '30deg' }] },
  north: { fontSize: 9, fontWeight: '700', color: colors.primary, transform: [{ rotate: '-30deg' }] },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  sources: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  source: { color: colors.muted, fontSize: 10 },
});
