import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../../theme';

const MODULES = 21;
const QUIET = 2;
const FINDER = 7;

// FNV-1a so the same code always draws the same pattern.
function hash(text: string): number {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function finderDark(x: number, y: number): boolean {
  const edge = x === 0 || y === 0 || x === FINDER - 1 || y === FINDER - 1;
  const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
  return edge || core;
}

// Finder squares sit in three corners with a one-module light margin around them.
function inFinderZone(x: number, y: number): { x: number; y: number } | null {
  const corners = [{ x: 0, y: 0 }, { x: MODULES - FINDER, y: 0 }, { x: 0, y: MODULES - FINDER }];
  for (const corner of corners) {
    if (x >= corner.x - 1 && x <= corner.x + FINDER && y >= corner.y - 1 && y <= corner.y + FINDER) {
      return { x: x - corner.x, y: y - corner.y };
    }
  }
  return null;
}

function buildPath(code: string): string {
  let state = hash(code) || 1;
  const next = () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  let path = '';
  for (let y = 0; y < MODULES; y += 1) {
    for (let x = 0; x < MODULES; x += 1) {
      const zone = inFinderZone(x, y);
      const random = next();
      let dark = random < 0.5;
      if (zone) {
        const inside = zone.x >= 0 && zone.x < FINDER && zone.y >= 0 && zone.y < FINDER;
        dark = inside && finderDark(zone.x, zone.y);
      }
      if (dark) path += `M${x + QUIET} ${y + QUIET}h1v1h-1z`;
    }
  }
  return path;
}

// A decorative stand-in, not a scannable code.
export function MockQr({ code, size = 168 }: { code: string; size?: number }) {
  const total = MODULES + QUIET * 2;
  return (
    <View accessible accessibilityLabel={`Sample QR code for reservation ${code}`}>
      <Svg width={size} height={size} viewBox={`0 0 ${total} ${total}`}>
        <Rect x={0} y={0} width={total} height={total} fill={colors.white} />
        <Path d={buildPath(code)} fill={colors.ink} />
      </Svg>
    </View>
  );
}
