import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { Banner, Card, SectionHeader } from '../../kit';
import { Button } from '../../ui';

type ExportState = 'idle' | 'generating' | 'done';

const REPORT_EMAIL = 'parking-services@sjsu.edu';

// Keyed by the selected day in the parent, so changing the day resets the export state.
function ExportAction({ fileName }: { fileName: string }) {
  const [state, setState] = useState<ExportState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const start = () => {
    setState('generating');
    timer.current = setTimeout(() => setState('done'), 1000);
  };

  return (
    <View style={styles.action}>
      <Button
        title={state === 'generating' ? 'Generating…' : 'Export PDF'}
        icon={state === 'generating' ? 'loader' : 'download'}
        onPress={start}
        disabled={state === 'generating'}
      />
      {state === 'done' ? (
        <Banner
          tone="success"
          title={`${fileName} exported (demo)`}
          message="No file is written in this demo."
          onClose={() => setState('idle')}
        />
      ) : null}
    </View>
  );
}

export function ExportCard({ fileName }: { fileName: string }) {
  const [emailAuto, setEmailAuto] = useState(false);

  return (
    <View style={styles.wrap}>
      <SectionHeader title="Export" />
      <Card style={styles.card}>
        <ExportAction key={fileName} fileName={fileName} />
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text style={styles.switchLabel}>Email this report automatically at 11:59 PM</Text>
            <Text style={styles.switchHint}>
              {emailAuto ? `Scheduled · sent to ${REPORT_EMAIL} (demo)` : `Sent to ${REPORT_EMAIL}`}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Email this report automatically at 11:59 PM"
            value={emailAuto}
            onValueChange={setEmailAuto}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  card: { gap: 16 },
  action: { gap: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  switchText: { flex: 1, gap: 2 },
  switchLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
  switchHint: { fontSize: 12, color: colors.muted },
});
