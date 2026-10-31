export type CitationType = { label: string; amount: number };

export const citationTypes: CitationType[] = [
  { label: 'No valid permit', amount: 55 },
  { label: 'Expired permit', amount: 45 },
  { label: 'Reserved spot violation', amount: 75 },
  { label: 'Accessible spot violation', amount: 280 },
];

export const FIRST_CITATION_NUMBER = 10492;

export function citationCode(number: number): string {
  return `C-${number}`;
}
