import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { hourlyOccupancy } from '../../mock/trends';
import { colors } from '../../theme';
import { Card } from '../kit';
import { HOURS, MONDAY_FIRST, WEEKDAY_NAMES, WEEKDAY_SHORT, hourTick } from './time';
import { minutesLabel } from '../reservations/format';

const LABEL_WIDTH = 34;
const MIN_CELL = 20;
const CELL_HEIGHT = 26;
const LIGHT = [232, 238, 244];
const NAVY = [23, 59, 88];
const legendSteps = [10, 30, 50, 70, 90];

// Light to navy as occupancy runs from quiet to full.
function shade(percent: number): string {
  const ratio = Math.min(1, Math.max(0, (percent - 10) / 85));
  const [red, green, blue] = LIGHT.map((start, index) => Math.round(start + (NAVY[index] - start) * ratio));
  return `rgb(${red}, ${green}, ${blue})`;
}

export function Heatmap({ garageId }: { garageId: string }) {
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<{ weekday: number; hour: number } | null>(null);

  const rows = useMemo(
    () => MONDAY_FIRST.map(weekday => ({ weekday, points: hourlyOccupancy(garageId, weekday, 0) })),
    [garageId],
  );

  // Fill the card when there is room, otherwise keep readable cells and scroll sideways.
  const cell = Math.max(MIN_CELL, Math.floor((width - LABEL_WIDTH) / HOURS.length));
  const selectedPercent = selected
    ? rows.find(row => row.weekday === selected.weekday)?.points.find(point => point.hour === selected.hour)?.percent
    : undefined;

  return (
    <Card style={styles.card}>
      <View onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.row}>
              <View style={{ width: LABEL_WIDTH }} />
              {HOURS.map((hour, index) => (
                <View key={hour} style={[styles.tickCell, { width: cell }]}>
                  {index % 3 === 0 ? <Text style={styles.tick}>{hourTick(hour)}</Text> : null}
                </View>
              ))}
            </View>
            {rows.map(row => (
              <View key={row.weekday} style={styles.row}>
                <Text style={[styles.dayLabel, { width: LABEL_WIDTH }]}>{WEEKDAY_SHORT[row.weekday]}</Text>
                {row.points.map(point => {
                  const isSelected = selected?.weekday === row.weekday && selected.hour === point.hour;
                  return (
                    <Pressable
                      key={point.hour}
                      accessibilityRole="button"
                      accessibilityLabel={`${WEEKDAY_NAMES[row.weekday]} ${minutesLabel(point.hour * 60)}, ${point.percent}% full`}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelected({ weekday: row.weekday, hour: point.hour })}
                      style={{ width: cell, height: CELL_HEIGHT, padding: 1 }}
                    >
                      <View
                        style={[
                          styles.cellFill,
                          { backgroundColor: shade(point.percent) },
                          isSelected && styles.cellSelected,
                        ]}
                      />
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Text style={styles.detail}>
        {selected && selectedPercent !== undefined
          ? `${WEEKDAY_NAMES[selected.weekday]} ${minutesLabel(selected.hour * 60)}: ${selectedPercent}% full`
          : 'Tap a cell to see the exact percent'}
      </Text>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Quieter</Text>
        {legendSteps.map(percent => (
          <View key={percent} style={[styles.legendSwatch, { backgroundColor: shade(percent) }]} />
        ))}
        <Text style={styles.legendText}>Fuller</Text>
      </View>
      <Text style={styles.note}>Sample data</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  tickCell: { height: 16, justifyContent: 'center' },
  // The label is wider than its cell, so let it overflow into the empty cells beside it.
  tick: { width: 30, fontSize: 10, color: colors.muted },
  dayLabel: { fontSize: 11, fontWeight: '600', color: colors.muted },
  cellFill: { flex: 1, borderRadius: 4 },
  cellSelected: { borderWidth: 2, borderColor: colors.gold },
  detail: { fontSize: 13, fontWeight: '600', color: colors.ink },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendSwatch: { width: 22, height: 12, borderRadius: 3 },
  legendText: { fontSize: 11, color: colors.muted, marginHorizontal: 4 },
  note: { fontSize: 11, color: colors.muted },
});
