import { useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { AdminHeader, Screen } from '../../components/kit';
import { FIRST_CITATION_NUMBER } from '../../components/admin/lookup/citations';
import { PlateResult, type Violation } from '../../components/admin/lookup/PlateResult';
import { PlateSearch } from '../../components/admin/lookup/PlateSearch';
import { findPlate } from '../../mock/plates';

const MAX_RECENT = 5;

export default function AdminLookupScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [searched, setSearched] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  // Citations live here, not in the result, so they survive searching another plate and coming back.
  const [citations, setCitations] = useState<Record<string, Violation[]>>({});

  const issuedCount = Object.values(citations).reduce((sum, list) => sum + list.length, 0);

  const search = (input: string) => {
    const plate = input.replace(/[^a-z0-9]/gi, '').toUpperCase();
    if (!plate) return;
    setSearched(plate);
    setRecent(current => [plate, ...current.filter(item => item !== plate)].slice(0, MAX_RECENT));
  };

  const issue = (plate: string, violation: Violation) => {
    setCitations(current => ({ ...current, [plate]: [violation, ...(current[plate] ?? [])] }));
  };

  return (
    <Screen wide>
      <AdminHeader title="Permit check" subtitle="Validate a vehicle by its license plate." />
      <PlateSearch recent={recent} onSearch={search} />
      {searched ? (
        <PlateResult
          key={searched}
          plate={searched}
          record={findPlate(searched)}
          wide={wide}
          extraViolations={citations[searched] ?? []}
          nextCitationNumber={FIRST_CITATION_NUMBER + issuedCount}
          onIssue={violation => issue(searched, violation)}
        />
      ) : null}
    </Screen>
  );
}
