import { fullDate } from '../../permits/format';
import { formatMoney } from '../../reservations/format';
import type { PlateRecord } from '../../../mock/plates';
import { colors } from '../../../theme';
import type { IconName } from '../../ui';

export type PlateState = 'valid' | 'unpaid' | 'expired' | 'none' | 'norecord';

export function plateState(record: PlateRecord | undefined): PlateState {
  if (!record) return 'norecord';
  if (record.payment === 'paid') return 'valid';
  return record.payment;
}

export type StatusView = {
  title: string;
  detail: string;
  icon: IconName;
  strong: string;
  light: string;
};

// Each state differs in icon and wording as well as color, so status never relies on color alone.
export function statusView(state: PlateState, record: PlateRecord | undefined): StatusView {
  switch (state) {
    case 'valid':
      return {
        title: 'VALID — Permit paid',
        detail: record?.permit ? `${record.permit.name} is active and paid.` : 'Permit is active and paid.',
        icon: 'check-circle',
        strong: colors.available,
        light: colors.availableLight,
      };
    case 'unpaid':
      return {
        title: `UNPAID — ${formatMoney(record?.amountDue ?? 0)} due`,
        detail: 'A permit is on file but payment has not been received.',
        icon: 'x-circle',
        strong: colors.occupied,
        light: colors.occupiedLight,
      };
    case 'expired':
      return {
        title: `EXPIRED — ended ${record?.permit ? fullDate(record.permit.validUntil) : 'earlier'}`,
        detail: 'The permit is no longer valid for parking.',
        icon: 'clock',
        strong: colors.amber,
        light: colors.goldLight,
      };
    case 'none':
      return {
        title: 'NO PERMIT',
        detail: 'This vehicle is registered but has no permit on file.',
        icon: 'slash',
        strong: colors.occupied,
        light: colors.occupiedLight,
      };
    default:
      return {
        title: 'NO RECORD FOUND',
        detail: "Plate isn't registered — treat as visitor without payment.",
        icon: 'help-circle',
        strong: colors.muted,
        light: colors.unknownLight,
      };
  }
}

export const PAYMENT_LABEL: Record<PlateRecord['payment'], string> = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  expired: 'Expired',
  none: 'No permit',
};
