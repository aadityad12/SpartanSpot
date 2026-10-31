import type { Reservation } from '../../mock/reservations';
import { Badge } from '../kit';

const config = {
  active: { label: 'Active', tone: 'available', icon: 'play-circle' },
  upcoming: { label: 'Upcoming', tone: 'primary', icon: 'clock' },
  completed: { label: 'Completed', tone: 'neutral', icon: 'check' },
  cancelled: { label: 'Cancelled', tone: 'occupied', icon: 'x-circle' },
} as const;

export function StatusBadge({ status }: { status: Reservation['status'] }) {
  const { label, tone, icon } = config[status];
  return <Badge label={label} tone={tone} icon={icon} />;
}
