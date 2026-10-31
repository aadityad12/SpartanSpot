import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PaymentStep } from '../../components/reservations/PaymentStep';
import { ReviewStep } from '../../components/reservations/ReviewStep';
import { SpotStep } from '../../components/reservations/SpotStep';
import { StepIndicator, stepLabels } from '../../components/reservations/StepIndicator';
import { TimeStep } from '../../components/reservations/TimeStep';
import {
  RESERVATION_FEE,
  buildWindow,
  startOptions,
} from '../../components/reservations/format';
import { useNow } from '../../components/reservations/useNow';
import { Screen } from '../../components/kit';
import { Button, EmptyState, IconButton } from '../../components/ui';
import { useDemo } from '../../demo';
import { getGarage, getSpot, type Spot } from '../../mock/garages';
import { paymentMethods } from '../../mock/permits';
import { colors } from '../../theme';

const LAST_STEP = stepLabels.length - 1;

function leave() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function ReserveScreen() {
  const { lotId, spot: spotParam } = useLocalSearchParams<{ lotId: string; spot?: string }>();
  const { rules, vehicles, createReservation, spotStatus } = useDemo();
  const now = useNow();
  const garage = getGarage(lotId);

  // A spot passed from the garage screen is preselected, along with its level.
  const preset = spotParam ? getSpot(spotParam) : undefined;
  const presetSpot = preset && preset.garageId === lotId ? preset : undefined;
  const presetStatus = presetSpot ? spotStatus(presetSpot) : 'available';

  const [step, setStep] = useState(0);
  const [level, setLevel] = useState(presetSpot?.level ?? 1);
  const [spotId, setSpotId] = useState<string | null>(presetStatus === 'available' ? presetSpot?.id ?? null : null);
  const [dayOffset, setDayOffset] = useState(0);
  const [startPick, setStartPick] = useState<number | null>(null);
  const [hoursPick, setHoursPick] = useState(2);
  const [methodPick, setMethodPick] = useState<string | null>(null);
  const [vehiclePick, setVehiclePick] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived instead of reset in effects, so changing the day or rules can't leave a stale pick.
  const starts = startOptions(now, dayOffset);
  const startMinutes = startPick !== null && starts.includes(startPick) ? startPick : null;
  const hours = Math.min(hoursPick, Math.max(1, Math.floor(rules.maxHours)));
  const window = startMinutes === null ? null : buildWindow(now, dayOffset, startMinutes, hours);
  const spot = spotId ? getSpot(spotId) : undefined;
  const methodId = methodPick ?? paymentMethods[0].id;
  const method = paymentMethods.find(item => item.id === methodId) ?? paymentMethods[0];
  const vehicle = vehicles.find(item => item.id === vehiclePick)
    ?? vehicles.find(item => item.primary)
    ?? vehicles[0];

  if (!garage) {
    return (
      <Screen edges={['top', 'bottom']}>
        <IconButton name="arrow-left" label="Go back" onPress={leave} />
        <EmptyState
          icon="map-pin"
          title="Garage not found"
          description="That garage isn't in the sample data. Pick one from Find parking."
        />
        <Button title="Back to Find parking" icon="search" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const selectSpot = (picked: Spot | null) => setSpotId(picked ? picked.id : null);

  const canContinue = [
    spot !== undefined,
    window !== null,
    vehicle !== undefined,
  ][step] ?? false;

  const goBack = () => {
    setError(null);
    if (step === 0) leave();
    else setStep(step - 1);
  };

  const confirm = () => {
    if (!spot || !window || !vehicle) return;
    const result = createReservation({
      garageId: garage.id,
      spotId: spot.id,
      start: window.start.toISOString(),
      end: window.end.toISOString(),
      plate: vehicle.plate,
      fee: RESERVATION_FEE,
    });
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    router.replace({ pathname: '/reservation/[id]', params: { id: result.reservation.id, new: '1' } });
  };

  // Spot problems send the student back to the map; limit and overlap problems to the time step.
  const errorOnSpot = error !== null && /right now|could not be found/.test(error);
  const fix = () => {
    if (errorOnSpot) setSpotId(null);
    setError(null);
    setStep(errorOnSpot ? 0 : 1);
  };

  const initialSpotError = presetSpot && presetStatus !== 'available'
    ? `Spot ${presetSpot.label} is ${presetStatus} right now. Pick a green spot.`
    : null;

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={styles.top}>
        <IconButton name="arrow-left" label={step === 0 ? 'Leave reservation' : 'Previous step'} onPress={goBack} />
        <View style={styles.flex}>
          <Text style={styles.eyebrow}>RESERVE</Text>
          <Text accessibilityRole="header" style={styles.title}>{garage.name}</Text>
        </View>
      </View>

      <StepIndicator step={step} />

      {step === 0 ? (
        <SpotStep
          garage={garage}
          level={level}
          onLevelChange={next => {
            setLevel(next);
            setSpotId(null);
          }}
          selectedId={spotId}
          onSelect={selectSpot}
          initialError={initialSpotError}
        />
      ) : null}

      {step === 1 ? (
        <TimeStep
          now={now}
          rules={rules}
          dayOffset={dayOffset}
          onDayChange={setDayOffset}
          starts={starts}
          startMinutes={startMinutes}
          onStartChange={setStartPick}
          hours={hours}
          onHoursChange={setHoursPick}
          window={window}
        />
      ) : null}

      {step === 2 ? (
        <PaymentStep
          methodId={methodId}
          onMethodChange={setMethodPick}
          vehicles={vehicles}
          vehicleId={vehicle?.id ?? null}
          onVehicleChange={setVehiclePick}
        />
      ) : null}

      {step === LAST_STEP && spot && window && vehicle ? (
        <ReviewStep
          garage={garage}
          spot={spot}
          window={window}
          vehicle={vehicle}
          methodLabel={method.label}
          error={error}
          fixLabel={errorOnSpot ? 'Back to spot' : 'Back to time'}
          onFix={fix}
          onConfirm={confirm}
        />
      ) : null}

      {step < LAST_STEP ? (
        <Button title="Continue" icon="arrow-right" disabled={!canContinue} onPress={() => setStep(step + 1)} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.8, color: colors.muted },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.6, color: colors.ink },
});
