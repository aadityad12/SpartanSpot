import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { Chip, ChipRow } from '../../kit';
import { ActionButton } from './ActionButton';
import { HOLD_REASONS, pluralize, type HoldReason } from './holds';

// Controls shown in Hold mode: pick a reason, then hold single spots, a whole row, or release everything.
export function HoldTools({
  reason,
  onReasonChange,
  rows,
  holdableInRow,
  onHoldRow,
  heldCount,
  onReleaseAll,
}: {
  reason: HoldReason;
  onReasonChange: (reason: HoldReason) => void;
  rows: string[];
  holdableInRow: (row: string) => number;
  onHoldRow: (row: string) => void;
  heldCount: number;
  onReleaseAll: () => void;
}) {
  const [row, setRow] = useState(rows[0] ?? 'A');
  const [confirming, setConfirming] = useState(false);
  // The garage can change under us, so fall back to its first row if the chosen letter no longer exists.
  const activeRow = rows.includes(row) ? row : (rows[0] ?? 'A');
  const rowCount = holdableInRow(activeRow);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Reason for the hold</Text>
      <View style={styles.reasons}>
        {HOLD_REASONS.map(item => (
          <Chip key={item} label={item} selected={item === reason} onPress={() => onReasonChange(item)} />
        ))}
      </View>

      <Text style={styles.label}>Hold whole row</Text>
      <ChipRow options={rows} value={activeRow} onChange={setRow} />
      <View style={styles.actions}>
        <ActionButton
          label={`Hold row ${activeRow}`}
          accessibilityLabel={`Hold row ${activeRow} as ${reason}`}
          disabled={rowCount === 0}
          onPress={() => onHoldRow(activeRow)}
        />
        <Text style={styles.hint}>
          {rowCount === 0
            ? `No available spots left in row ${activeRow}`
            : `${pluralize(rowCount, 'available spot')} will be held as ${reason}`}
        </Text>
      </View>

      {confirming ? (
        <View style={styles.actions}>
          <Text style={styles.confirm}>Release {pluralize(heldCount, 'hold')} on this level?</Text>
          <ActionButton
            label="Confirm"
            tone="danger"
            accessibilityLabel="Confirm release all holds on this level"
            onPress={() => {
              onReleaseAll();
              setConfirming(false);
            }}
          />
          <ActionButton label="Cancel" tone="quiet" onPress={() => setConfirming(false)} />
        </View>
      ) : (
        <View style={styles.actions}>
          <ActionButton
            label="Release all on this level"
            tone="quiet"
            disabled={heldCount === 0}
            onPress={() => setConfirming(true)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: colors.muted, textTransform: 'uppercase' },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  hint: { flex: 1, minWidth: 160, fontSize: 12, color: colors.muted },
  confirm: { fontSize: 13, fontWeight: '600', color: colors.red },
});
