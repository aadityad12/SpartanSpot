export type Plan = {
  id: 'daily' | 'monthly' | 'semester' | 'annual';
  name: string;
  price: number;
  period: string;
  description: string;
  perks: string[];
  popular?: boolean;
};
export type Permit = {
  id: string;
  planId: Plan['id'];
  name: string;
  validFrom: string;
  validUntil: string;
  plates: string[];
  status: 'active' | 'unpaid' | 'expired';
  confirmation: string;
};
export type Payment = {
  id: string;
  date: string;
  description: string;
  amount: number;
  method: string;
};

// All prices are sample pricing, not the real SJSU rate card.
export const plans: Plan[] = [
  {
    id: 'daily',
    name: 'Daily',
    price: 9,
    period: 'per day',
    description: 'Park for a single day, good for occasional visits.',
    perks: ['Valid until 11 PM', 'Any student garage'],
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 60,
    period: 'per month',
    description: 'Flexible month-to-month parking for commuters.',
    perks: ['Unlimited entries', 'Any student garage', 'Cancel anytime'],
  },
  {
    id: 'semester',
    name: 'Semester',
    price: 250,
    period: 'per semester',
    description: 'Best value for a full term of classes.',
    perks: ['Unlimited entries', 'Any student garage', 'Up to 2 vehicles'],
    popular: true,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 450,
    period: 'per year',
    description: 'Lowest cost per month if you are here all year.',
    perks: ['Unlimited entries', 'Any student garage', 'Up to 2 vehicles', 'Summer included'],
  },
];

export const initialPermit: Permit = {
  id: 'permit-fall-2026',
  planId: 'semester',
  name: 'Fall 2026 Semester Permit',
  validFrom: '2026-08-19',
  validUntil: '2026-12-18',
  plates: ['8ABC123'],
  status: 'active',
  confirmation: 'PRM-4821-FALL',
};

export const paymentHistory: Payment[] = [
  { id: 'pay-1', date: '2026-08-12', description: 'Fall 2026 Semester Permit', amount: 250, method: 'Visa •••• 4242' },
  { id: 'pay-2', date: '2026-04-10', description: 'Spring 2026 Semester Permit', amount: 250, method: 'Visa •••• 4242' },
  { id: 'pay-3', date: '2026-02-03', description: 'Daily Permit', amount: 9, method: 'Apple Pay' },
  { id: 'pay-4', date: '2025-09-02', description: 'Monthly Permit (September)', amount: 60, method: 'MySJSU account' },
];

export const paymentMethods: { id: string; label: string; detail: string; icon: string }[] = [
  { id: 'visa', label: 'Visa •••• 4242', detail: 'Expires 08/28', icon: 'credit-card' },
  { id: 'apple-pay', label: 'Apple Pay', detail: 'Pay with your device wallet', icon: 'smartphone' },
  { id: 'mysjsu', label: 'Charge to MySJSU account', detail: 'Added to your student account balance', icon: 'user' },
];
