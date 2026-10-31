import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useDemo } from '../../../demo';
import { getGarage } from '../../../mock/garages';
import type { PlateRecord } from '../../../mock/plates';
import { colors } from '../../../theme';
import { Badge, Banner, LicensePlate } from '../../kit';
import { fullDate, validRange } from '../../permits/format';
import { formatMoney, liveStatus, spotLine, timeLabel } from '../../reservations/format';
import { useNow } from '../../reservations/useNow';
import { Button, Icon } from '../../ui';
import { CitationForm } from './CitationForm';
import { citationCode, type CitationType } from './citations';
import { InfoRow } from './InfoRow';
import { Section } from './Section';
import { PAYMENT_LABEL, plateState, statusView } from './status';
import { relativeTime } from './time';

function localDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export type Violation = PlateRecord['violations'][number];

export function PlateResult({
  plate,
  record,
  wide,
  extraViolations,
  nextCitationNumber,
  onIssue,
}: {
  plate: string;
  record: PlateRecord | undefined;
  wide: boolean;
  extraViolations: Violation[];
  nextCitationNumber: number;
  onIssue: (violation: Violation) => void;
}) {
  const { reservations } = useDemo();
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [citing, setCiting] = useState(false);
  const [issued, setIssued] = useState<string | null>(null);

  const now = useNow();
  const state = plateState(record);
  const view = statusView(state, record);
  const violations = [...extraViolations, ...(record?.violations ?? [])];
  const reservation = reservations.find(item => item.plate === plate
    && (liveStatus(item, now) === 'upcoming' || liveStatus(item, now) === 'active'));

  const issue = (type: CitationType, notes: string) => {
    const code = citationCode(nextCitationNumber);
    onIssue({
      date: localDate(new Date()),
      type: notes ? `${type.label} (${code}, ${notes})` : `${type.label} (${code})`,
      amount: type.amount,
      status: 'open',
    });
    setIssued(code);
    setCiting(false);
  };

  const vehicle = (
    <Section title="Vehicle">
      <LicensePlate plate={plate} state={record?.state} />
      {record ? (
        <>
          <InfoRow label="Make" value={record.make} />
          <InfoRow label="Model" value={record.model} />
          <InfoRow label="Color" value={record.color} />
        </>
      ) : (
        <Text style={styles.empty}>No vehicle details on file.</Text>
      )}
    </Section>
  );

  const owner = (
    <Section title="Owner">
      {record?.owner ? (
        <>
          <InfoRow label="Name" value={record.owner.name} />
          <InfoRow label="SJSU ID" value={record.owner.sjsuId} />
          <InfoRow label="Role" value={record.owner.role} />
        </>
      ) : (
        <Text style={styles.empty}>No owner on file.</Text>
      )}
    </Section>
  );

  const permit = (
    <Section title="Permit">
      {record?.permit ? (
        <>
          <InfoRow label="Plan" value={record.permit.name} />
          <InfoRow
            label="Valid"
            value={record.permit.validFrom === record.permit.validUntil
              ? fullDate(record.permit.validFrom)
              : validRange(record.permit.validFrom, record.permit.validUntil)}
          />
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment</Text>
            <Badge
              label={PAYMENT_LABEL[record.payment]}
              tone={state === 'valid' ? 'available' : state === 'expired' ? 'warning' : 'occupied'}
              icon={view.icon}
            />
          </View>
          {record.amountDue > 0 ? <InfoRow label="Amount due" value={formatMoney(record.amountDue)} /> : null}
        </>
      ) : (
        <Text style={styles.empty}>No permit on file.</Text>
      )}
    </Section>
  );

  const reservationCard = reservation ? (
    <Section title="Active reservation">
      <InfoRow label="Code" value={reservation.code} />
      <InfoRow label="Garage" value={getGarage(reservation.garageId)?.name ?? reservation.garageId} />
      <InfoRow label="Spot" value={spotLine(reservation.spotId)} />
    </Section>
  ) : null;

  const sightings = (
    <Section title="Recent camera sightings">
      {record && record.sightings.length > 0 ? (
        record.sightings.map(item => (
          <View key={item.at} style={styles.listRow}>
            <Icon name="video" size={14} color={colors.primary} />
            <Text style={styles.listMain}>
              {getGarage(item.garageId)?.name ?? item.garageId}, Level {item.level}
            </Text>
            <Text style={styles.listMeta}>{relativeTime(item.at, now)}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No recent sightings.</Text>
      )}
    </Section>
  );

  const violationList = (
    <Section title="Violation history">
      {violations.length > 0 ? (
        violations.map((item, index) => (
          <View key={`${item.date}-${item.type}-${index}`} style={styles.listRow}>
            <View style={styles.flex}>
              <Text style={styles.listMain}>{item.type}</Text>
              <Text style={styles.listMeta}>{fullDate(item.date)} · {formatMoney(item.amount)}</Text>
            </View>
            <Badge
              label={item.status === 'paid' ? 'Paid' : 'Open'}
              tone={item.status === 'paid' ? 'available' : 'occupied'}
              icon={item.status === 'paid' ? 'check' : 'alert-circle'}
            />
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No violations on record.</Text>
      )}
    </Section>
  );

  const actions = (
    <View style={styles.actions}>
      {verifiedAt ? <Banner tone="success" title={`Verified at ${verifiedAt}`} /> : null}
      {issued ? <Banner tone="success" title={`Citation ${issued} issued (demo)`} /> : null}
      <View style={styles.buttons}>
        <View style={styles.flex}>
          <Button
            title="Mark verified"
            icon="check"
            secondary
            onPress={() => setVerifiedAt(timeLabel(new Date()))}
          />
        </View>
        <View style={styles.flex}>
          <Button title="Issue citation" icon="file-text" onPress={() => setCiting(open => !open)} />
        </View>
      </View>
      {citing ? (
        <CitationForm plate={plate} onSubmit={issue} onCancel={() => setCiting(false)} />
      ) : null}
    </View>
  );

  const left = (
    <>
      {vehicle}
      {owner}
      {permit}
    </>
  );
  const right = (
    <>
      {reservationCard}
      {sightings}
      {violationList}
      {actions}
    </>
  );

  return (
    <View style={styles.result}>
      <View
        accessibilityRole="alert"
        accessibilityLabel={`${view.title}. ${view.detail}`}
        style={[styles.banner, { backgroundColor: view.light, borderColor: view.strong }]}
      >
        <Icon name={view.icon} size={34} color={view.strong} />
        <View style={styles.flex}>
          <Text style={[styles.bannerTitle, { color: view.strong }]}>{view.title}</Text>
          <Text style={styles.bannerDetail}>{view.detail}</Text>
        </View>
      </View>
      {wide ? (
        <View style={styles.columns}>
          <View style={styles.column}>{left}</View>
          <View style={styles.column}>{right}</View>
        </View>
      ) : (
        <View style={styles.column}>
          {left}
          {right}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  result: { gap: 16 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, borderWidth: 2 },
  bannerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  bannerDetail: { fontSize: 14, color: colors.ink, marginTop: 2 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  column: { flex: 1, gap: 16 },
  empty: { fontSize: 13, color: colors.muted },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  paymentLabel: { fontSize: 13, color: colors.muted },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  listMain: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.ink },
  listMeta: { fontSize: 12, color: colors.muted },
  actions: { gap: 12 },
  buttons: { flexDirection: 'row', gap: 10 },
});
