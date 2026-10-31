import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useDemo } from '../demo';
import type { Spot, SpotStatus } from '../mock/garages';
import { colors, statusColor, statusLight } from '../theme';
import { Icon, IconButton, type IconName } from './ui';

type Tone = 'neutral' | 'available' | 'occupied' | 'reserved' | 'primary' | 'warning';

const toneColors: Record<Tone, { strong: string; light: string }> = {
  neutral: { strong: colors.ink, light: colors.unknownLight },
  available: { strong: colors.available, light: colors.availableLight },
  occupied: { strong: colors.occupied, light: colors.occupiedLight },
  reserved: { strong: colors.reserved, light: colors.reservedLight },
  primary: { strong: colors.primary, light: colors.primaryLight },
  warning: { strong: colors.amber, light: colors.goldLight },
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export function Screen({
  children,
  wide = false,
  scroll = true,
  edges = ['top'],
}: {
  children: ReactNode;
  wide?: boolean;
  scroll?: boolean;
  edges?: Edge[];
}) {
  const body = <View style={[styles.screenInner, { maxWidth: wide ? 1100 : 560 }]}>{children}</View>;
  return (
    <SafeAreaView edges={edges} style={styles.screen}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.screenContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.screenContent}>{body}</View>
      )}
    </SafeAreaView>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.flex}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
        <Text accessibilityRole="header" style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { signOut } = useDemo();
  return (
    <PageHeader
      eyebrow="Parking Services"
      title={title}
      subtitle={subtitle}
      right={(
        <IconButton
          name="log-out"
          label="Sign out"
          onPress={() => {
            signOut();
            router.replace('/sign-in');
          }}
        />
      )}
    />
  );
}

export function Card({
  children,
  style,
  padded = true,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  onPress?: () => void;
}) {
  const cardStyle = [styles.card, padded && styles.cardPadded, style];
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Small indicators
// ---------------------------------------------------------------------------

export function StatTile({
  label,
  value,
  sublabel,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  tone?: Tone;
  icon?: IconName;
}) {
  const palette = toneColors[tone];
  return (
    <View style={styles.statTile}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
        {icon ? (
          <View style={[styles.statIcon, { backgroundColor: palette.light }]}>
            <Icon name={icon} size={14} color={palette.strong} />
          </View>
        ) : null}
      </View>
      <Text style={[styles.statValue, tone !== 'neutral' && { color: palette.strong }]}>{value}</Text>
      {sublabel ? <Text style={styles.statSub}>{sublabel}</Text> : null}
    </View>
  );
}

export function Badge({ label, tone = 'neutral', icon }: { label: string; tone?: Tone; icon?: IconName }) {
  const palette = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.light }]}>
      {icon ? <Icon name={icon} size={11} color={palette.strong} /> : null}
      <Text style={[styles.badgeText, { color: palette.strong }]}>{label}</Text>
    </View>
  );
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon ? <Icon name={icon} size={13} color={selected ? colors.white : colors.muted} /> : null}
      <Text style={[styles.chipText, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

type Option = { value: string; label: string };

export function ChipRow({
  options,
  value,
  onChange,
}: {
  options: (string | Option)[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map(option => {
        const item = typeof option === 'string' ? { value: option, label: option } : option;
        return (
          <Chip
            key={item.value}
            label={item.label}
            selected={item.value === value}
            onPress={() => onChange(item.value)}
          />
        );
      })}
    </ScrollView>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, selected && { color: colors.primary }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressBar({ value, max, tone = 'primary' }: { value: number; max: number; tone?: Tone }) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
      style={styles.progressTrack}
    >
      <View style={[styles.progressFill, { width: `${ratio * 100}%`, backgroundColor: toneColors[tone].strong }]} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

export function BarChart({
  data,
  max,
  height = 140,
  highlightIndex,
  valueSuffix = '',
  compareLabel,
  valueLabel,
}: {
  data: { label: string; value: number; compare?: number }[];
  max?: number;
  height?: number;
  highlightIndex?: number;
  valueSuffix?: string;
  compareLabel?: string;
  valueLabel?: string;
}) {
  const ceiling = max ?? Math.max(1, ...data.flatMap(item => [item.value, item.compare ?? 0]));
  // Leave room above the tallest bar for its value label, and below for the x label.
  const barArea = height - 14;
  const barMax = barArea - 14;
  return (
    <View>
      {compareLabel ? (
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.primary }]} />
            <Text style={styles.legendText}>{valueLabel ?? 'Value'}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: colors.border }]} />
            <Text style={styles.legendText}>{compareLabel}</Text>
          </View>
        </View>
      ) : null}
      <View style={[styles.chartRow, { height }]}>
        {data.map((item, index) => {
          const highlighted = index === highlightIndex;
          const mainHeight = Math.max(2, (item.value / ceiling) * barMax);
          const ghostHeight = item.compare === undefined ? 0 : Math.max(2, (item.compare / ceiling) * barMax);
          return (
            <View
              key={`${item.label}-${index}`}
              accessible
              accessibilityLabel={`${item.label}: ${item.value}${valueSuffix}${
                item.compare === undefined ? '' : `, ${compareLabel ?? 'compare'} ${item.compare}${valueSuffix}`
              }`}
              style={styles.chartColumn}
            >
              <View style={[styles.chartBarArea, { height: barArea }]}>
                <Text
                  style={[
                    styles.chartValue,
                    { bottom: Math.max(mainHeight, ghostHeight) + 2 },
                    highlighted && { color: colors.primary, fontWeight: '700' },
                  ]}
                >
                  {item.value}{valueSuffix}
                </Text>
                {ghostHeight > 0 ? <View style={[styles.chartGhost, { height: ghostHeight }]} /> : null}
                <View
                  style={[
                    styles.chartBar,
                    { height: mainHeight, backgroundColor: highlighted ? colors.gold : colors.primary },
                  ]}
                />
              </View>
              <Text style={[styles.chartLabel, highlighted && { color: colors.ink, fontWeight: '700' }]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Parking-specific
// ---------------------------------------------------------------------------

const spotGap = 4;
const markerWidth = 34;
const rowLetterWidth = 16;

const statusWord: Record<SpotStatus, string> = {
  available: 'available',
  occupied: 'occupied',
  reserved: 'reserved',
  unknown: 'unknown',
};

export function SpotGrid({
  spots,
  statusOf,
  selectedId,
  onPressSpot,
  disabledStatuses = [],
  compact = false,
}: {
  spots: Spot[];
  statusOf: (spot: Spot) => SpotStatus;
  selectedId?: string;
  onPressSpot?: (spot: Spot) => void;
  disabledStatuses?: SpotStatus[];
  compact?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const rows = [...new Set(spots.map(spot => spot.row))];
  const perRow = Math.max(1, ...rows.map(row => spots.filter(spot => spot.row === row).length));
  // Fit one row on a single line when the width allows, otherwise wrap at the minimum size.
  const available = Math.max(0, width - markerWidth - rowLetterWidth - 12);
  const fitted = Math.floor(available / perRow) - spotGap;
  const size = compact ? 22 : Math.min(30, Math.max(26, fitted));

  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
      <View style={styles.gridBody}>
        <View style={[styles.elevatorMarker, { width: markerWidth }]}>
          <Icon name="chevrons-up" size={14} color={colors.primary} />
          <Text style={styles.markerText}>Elevator / Stairs</Text>
        </View>
        <View style={styles.gridRows}>
          {rows.map(row => (
            <View key={row} style={styles.gridRow}>
              <Text style={[styles.rowLetter, { height: size, lineHeight: size }]}>{row}</Text>
              <View style={styles.gridSpots}>
                {spots
                  .filter(spot => spot.row === row)
                  .sort((first, second) => first.number - second.number)
                  .map(spot => {
                    const status = statusOf(spot);
                    const selected = spot.id === selectedId;
                    const disabled = disabledStatuses.includes(status) || !onPressSpot;
                    return (
                      <Pressable
                        key={spot.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Spot ${spot.label}, ${statusWord[status]}${
                          spot.features.length ? `, ${spot.features.join(', ')}` : ''
                        }${selected ? ', selected' : ''}`}
                        accessibilityState={{ selected, disabled }}
                        disabled={disabled}
                        onPress={() => onPressSpot?.(spot)}
                        style={[
                          styles.spot,
                          {
                            width: size,
                            height: size,
                            backgroundColor: statusLight[status],
                            borderColor: statusColor[status],
                            // Border style repeats the status so color is never the only cue.
                            borderStyle: status === 'reserved' ? 'dashed' : status === 'unknown' ? 'dotted' : 'solid',
                          },
                          selected && styles.spotSelected,
                        ]}
                      >
                        <Text style={[styles.spotNumber, { color: statusColor[status], fontSize: compact ? 9 : 10 }]}>
                          {spot.number}
                        </Text>
                        {spot.features.includes('elevator') ? (
                          <View style={styles.spotIcon}>
                            <Icon name="chevrons-up" size={8} color={statusColor[status]} />
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.entrance}>
        <Icon name="arrow-up" size={12} color={colors.primary} />
        <Text style={styles.entranceText}>Entrance</Text>
      </View>
    </View>
  );
}

export function SpotLegend() {
  const items: { status: SpotStatus; label: string }[] = [
    { status: 'available', label: 'Available' },
    { status: 'occupied', label: 'Occupied' },
    { status: 'reserved', label: 'Reserved' },
    { status: 'unknown', label: 'Unknown' },
  ];
  return (
    <View style={styles.legend}>
      {items.map(item => (
        <View key={item.status} style={styles.legendItem}>
          <View
            style={[
              styles.legendBox,
              {
                backgroundColor: statusLight[item.status],
                borderColor: statusColor[item.status],
                borderStyle: item.status === 'reserved' ? 'dashed' : item.status === 'unknown' ? 'dotted' : 'solid',
              },
            ]}
          />
          <Text style={styles.legendText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function LicensePlate({
  plate,
  state = 'CA',
  size = 'md',
}: {
  plate: string;
  state?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const scale = size === 'sm' ? 0.75 : size === 'lg' ? 1.4 : 1;
  const stateNames: Record<string, string> = { CA: 'California', NV: 'Nevada', OR: 'Oregon', WA: 'Washington', AZ: 'Arizona' };
  return (
    <View
      accessible
      accessibilityLabel={`License plate ${plate.split('').join(' ')}, ${stateNames[state] ?? state}`}
      style={[styles.plate, { paddingHorizontal: 14 * scale, paddingVertical: 6 * scale, borderRadius: 8 * scale }]}
    >
      <Text style={[styles.plateState, { fontSize: 9 * scale }]}>{(stateNames[state] ?? state).toUpperCase()}</Text>
      <Text style={[styles.plateNumber, { fontSize: 20 * scale, letterSpacing: 2 * scale }]}>{plate}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Rows, inputs and feedback
// ---------------------------------------------------------------------------

export function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: {
  icon?: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <>
      {icon ? (
        <View style={styles.rowIcon}>
          <Icon name={icon} size={18} color={colors.primary} />
        </View>
      ) : null}
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
      {onPress && !right ? <Icon name="chevron-right" size={18} color={colors.muted} /> : null}
    </>
  );
  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={value <= min}
          onPress={() => onChange(Math.max(min, value - 1))}
          style={[styles.stepperButton, value <= min && styles.disabled]}
        >
          <Icon name="minus" size={16} color={colors.primary} />
        </Pressable>
        <Text accessibilityLabel={`${label}: ${value}`} style={styles.stepperValue}>{value}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={value >= max}
          onPress={() => onChange(Math.min(max, value + 1))}
          style={[styles.stepperButton, value >= max && styles.disabled]}
        >
          <Icon name="plus" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

const bannerTones = {
  info: { icon: 'info', strong: colors.primary, light: colors.primaryLight },
  success: { icon: 'check-circle', strong: colors.available, light: colors.availableLight },
  warning: { icon: 'alert-triangle', strong: colors.amber, light: colors.goldLight },
  error: { icon: 'alert-circle', strong: colors.red, light: colors.occupiedLight },
} as const;

export function Banner({
  tone,
  title,
  message,
  onClose,
}: {
  tone: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  onClose?: () => void;
}) {
  const palette = bannerTones[tone];
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: palette.light, borderColor: palette.strong }]}
    >
      <Icon name={palette.icon} size={18} color={palette.strong} />
      <View style={styles.flex}>
        <Text style={[styles.bannerTitle, { color: palette.strong }]}>{title}</Text>
        {message ? <Text style={styles.bannerMessage}>{message}</Text> : null}
      </View>
      {onClose ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss message" onPress={onClose} hitSlop={10}>
          <Icon name="x" size={16} color={palette.strong} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.35 },

  screen: { flex: 1, backgroundColor: colors.background },
  screenContent: { flexGrow: 1, padding: 20, paddingBottom: 32 },
  screenInner: { width: '100%', alignSelf: 'center', gap: 16 },

  pageHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, color: colors.muted, marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.ink },
  pageSubtitle: { fontSize: 13, lineHeight: 20, color: colors.muted, marginTop: 4 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPadded: { padding: 16 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.4, color: colors.ink },
  sectionAction: { fontSize: 13, fontWeight: '600', color: colors.primary },

  statTile: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 4,
  },
  statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted },
  statIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 28, fontWeight: '700', letterSpacing: -1, color: colors.ink },
  statSub: { fontSize: 12, color: colors.muted },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },

  chipRow: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 36,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.ink },

  segmented: { flexDirection: 'row', backgroundColor: colors.primaryLight, borderRadius: 12, padding: 3 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 34, borderRadius: 9 },
  segmentSelected: { backgroundColor: colors.white },
  segmentText: { fontSize: 13, fontWeight: '600', color: colors.muted },

  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },

  chartLegend: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  chartColumn: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  chartValue: { position: 'absolute', fontSize: 10, color: colors.muted },
  chartBarArea: { width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  chartGhost: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.border,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  chartBar: { width: '62%', borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  chartLabel: { fontSize: 10, color: colors.muted, height: 14 },

  gridBody: { flexDirection: 'row', gap: 8 },
  elevatorMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  markerText: { fontSize: 7, fontWeight: '700', color: colors.primary, textAlign: 'center' },
  gridRows: { flex: 1, gap: 10 },
  gridRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  rowLetter: { width: rowLetterWidth, fontSize: 11, fontWeight: '700', color: colors.muted, textAlign: 'center' },
  gridSpots: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: spotGap },
  spot: {
    borderWidth: 1.5,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotSelected: { borderColor: colors.primary, borderWidth: 3 },
  spotNumber: { fontWeight: '700' },
  spotIcon: { position: 'absolute', top: 1, right: 1 },
  entrance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
  },
  entranceText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.primary },

  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendBox: { width: 14, height: 14, borderRadius: 4, borderWidth: 1.5 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontSize: 12, color: colors.muted },

  plate: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  plateState: { fontWeight: '700', letterSpacing: 1.5, color: colors.primary },
  plateNumber: { fontWeight: '800', color: colors.ink },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.ink },
  rowSubtitle: { fontSize: 12, color: colors.muted, marginTop: 2 },

  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  stepperLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.ink },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: { minWidth: 28, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.ink },

  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 14, borderWidth: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '700' },
  bannerMessage: { fontSize: 13, lineHeight: 19, color: colors.ink, marginTop: 2 },
});
