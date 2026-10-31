import { useMemo } from 'react';
import type { ParkingLot } from './data';
import { useDemo } from './demo';
import { garageSummary } from './mock/garages';
import { useParking } from './store';

// The lots the Find and Saved tabs show. In sample mode the counts are recomputed from the shared
// spot status, so a student booking or an admin hold lowers "open spots" here as it does on the
// garage details and the admin dashboard. Live API data is shown untouched.
export function useLots(): ParkingLot[] {
  const { feed } = useParking();
  const { spotStatus } = useDemo();
  return useMemo(() => {
    if (feed.mode !== 'demo') return feed.lots;
    return feed.lots.map(lot => {
      const summary = garageSummary(lot.id, spotStatus);
      return { ...lot, available: summary.available, total: summary.total };
    });
  }, [feed, spotStatus]);
}
