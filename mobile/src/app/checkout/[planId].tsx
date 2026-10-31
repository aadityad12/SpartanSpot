import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { CheckoutForm } from '../../components/permits/CheckoutForm';
import { CheckoutSuccess } from '../../components/permits/CheckoutSuccess';
import { PageHeader, Screen } from '../../components/kit';
import { Button, EmptyState, IconButton } from '../../components/ui';
import { plans, type Permit } from '../../mock/permits';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/permits');
}

export default function CheckoutScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const [paid, setPaid] = useState<Permit | null>(null);
  const plan = plans.find(item => item.id === planId);

  return (
    <Screen edges={['top', 'bottom']}>
      <View>
        <IconButton name="arrow-left" label="Go back" onPress={close} />
      </View>
      {!plan ? (
        <>
          <EmptyState
            icon="credit-card"
            title="Plan not found"
            description="That parking plan doesn't exist. Pick one from the Permits tab."
          />
          <Button title="Back to permits" icon="list" onPress={() => router.replace('/permits')} />
        </>
      ) : paid ? (
        <CheckoutSuccess permit={paid} onDone={close} />
      ) : (
        <>
          <PageHeader eyebrow="Checkout" title={`${plan.name} permit`} />
          <CheckoutForm key={plan.id} plan={plan} onPaid={setPaid} />
        </>
      )}
    </Screen>
  );
}
