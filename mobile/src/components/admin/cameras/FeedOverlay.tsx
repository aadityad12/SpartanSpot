import { Platform } from 'react-native';
import { G, Rect, Text as SvgText } from 'react-native-svg';
import type { SpotStatus } from '../../../mock/garages';
import { colors } from '../../../theme';
import type { Stall } from './scene';

export const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const CAR_COLORS = [
  { body: '#d5d9de', roof: '#eceff2' },
  { body: '#8f98a2', roof: '#aab2bb' },
  { body: '#1f2a38', roof: '#2f3d50' },
  { body: '#101215', roof: '#1e2227' },
  { body: '#7b2323', roof: '#963131' },
  { body: '#2f5273', roof: '#406a91' },
  { body: '#e4dcc6', roof: '#f3eddc' },
  { body: '#46584a', roof: '#5b7060' },
];

// Draws one car top-down, nose toward the aisle: windshield, roof, rear window and headlights.
export function Car({ stall, variant }: { stall: Stall; variant: number }) {
  const palette = CAR_COLORS[variant % CAR_COLORS.length];
  const { row, mid } = stall;
  const span = row.bottom - row.top;
  const width = mid.width * 0.72;
  const height = span * 0.8;
  const top = row.top + span * 0.1;
  const left = mid.x - width / 2;

  // `t` runs from the aisle end of the car (0) to the back (1).
  const part = (from: number, to: number) => {
    const start = row.aisleAtBottom ? top + height * (1 - to) : top + height * from;
    return { y: start, height: height * (to - from) };
  };
  const windshield = part(0.17, 0.35);
  const roof = part(0.37, 0.68);
  const rearGlass = part(0.7, 0.82);
  const lights = part(0.015, 0.075);
  const inset = width * 0.12;

  return (
    <G>
      <Rect x={left - 2} y={top + 2} width={width + 4} height={height + 2} rx={width * 0.16} fill="#000" fillOpacity={0.4} />
      <Rect x={left} y={top} width={width} height={height} rx={width * 0.15} fill={palette.body} />
      <Rect x={left + inset * 0.8} y={windshield.y} width={width - inset * 1.6} height={windshield.height} rx={2} fill="#17222c" fillOpacity={0.92} />
      <Rect x={left + inset} y={roof.y} width={width - inset * 2} height={roof.height} rx={3} fill={palette.roof} />
      <Rect x={left + inset * 1.1} y={rearGlass.y} width={width - inset * 2.2} height={rearGlass.height} rx={2} fill="#17222c" fillOpacity={0.85} />
      <Rect x={left + width * 0.08} y={lights.y} width={width * 0.2} height={lights.height} rx={1.5} fill="#fff4c2" fillOpacity={0.9} />
      <Rect x={left + width * 0.72} y={lights.y} width={width * 0.2} height={lights.height} rx={1.5} fill="#fff4c2" fillOpacity={0.9} />
    </G>
  );
}

const boxColor: Record<Exclude<SpotStatus, 'unknown'>, string> = {
  available: '#34d27b',
  occupied: '#ff4d42',
  reserved: colors.gold,
};

const tagWord = { available: 'empty', occupied: 'car', reserved: 'reserved' } as const;

// A detector-style bounding box with a "class confidence" tag. Reserved spots show no
// confidence because the status comes from the app, not from the model.
export function DetectionBox({
  stall,
  status,
  confidence,
}: {
  stall: Stall;
  status: SpotStatus;
  confidence: number;
}) {
  if (status === 'unknown') return null;
  const color = boxColor[status];
  const { box } = stall;
  const { x, y, width, height } = box;
  const text = status === 'reserved' ? tagWord[status] : `${tagWord[status]} ${confidence.toFixed(2)}`;
  const tagWidth = text.length * 4.7 + 6;
  const tagX = Math.max(1, Math.min(x + width / 2 - tagWidth / 2, 639 - tagWidth));
  const tagY = y - 10.5;

  return (
    <G>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        fill={color}
        fillOpacity={status === 'occupied' ? 0.1 : 0.14}
        stroke={color}
        strokeWidth={2}
        strokeDasharray={status === 'reserved' ? '6 3' : undefined}
      />
      <Rect x={tagX} y={tagY} width={tagWidth} height={10.5} rx={2} fill={color} />
      <SvgText
        x={tagX + tagWidth / 2}
        y={tagY + 7.6}
        fontSize={7.4}
        fontWeight="bold"
        fontFamily={MONO}
        fill={status === 'reserved' ? '#241a05' : '#06140c'}
        textAnchor="middle"
      >
        {text}
      </SvgText>
    </G>
  );
}
