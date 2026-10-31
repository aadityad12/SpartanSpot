// SJSU navy and gold palette, matching the web mockup's CSS variables.
export const colors = {
  background: '#F6F7F9',
  white: '#FFFFFF',
  ink: '#21313F',
  muted: '#7D8792',
  border: '#E5E8EC',
  primary: '#173B58', // SJSU navy: brand, primary buttons, selected states
  primaryDeep: '#102C44',
  primaryLight: '#E8EEF4',
  gold: '#E5A823', // SJSU gold: accents
  goldLight: '#FDF3DD',
  available: '#2F8F5B', // green = available
  availableLight: '#E3F3EA',
  occupied: '#C94A3F', // red = occupied
  occupiedLight: '#FBE7E5',
  reserved: '#D99A1E', // gold = reserved
  reservedLight: '#FCF1D9',
  unknown: '#A3ACB5',
  unknownLight: '#EEF0F2',
  amber: '#B4822D', // warnings
  red: '#B3261E', // errors / destructive
};

export const statusColor = {
  available: colors.available,
  occupied: colors.occupied,
  reserved: colors.reserved,
  unknown: colors.unknown,
} as const;

export const statusLight = {
  available: colors.availableLight,
  occupied: colors.occupiedLight,
  reserved: colors.reservedLight,
  unknown: colors.unknownLight,
} as const;
