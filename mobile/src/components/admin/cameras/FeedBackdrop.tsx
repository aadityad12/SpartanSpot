import { memo } from 'react';
import { Circle, Defs, G, Line, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import {
  AISLE_MID_Y,
  dividerU,
  FAR_ROW,
  NEAR_ROW,
  STALLS_PER_ROW,
  VIEW_H,
  VIEW_W,
  xAt,
  type RowSpec,
} from './scene';

// Pre-computed film grain. A tiny seeded generator keeps it identical on every render.
const GRAIN = (() => {
  let seed = 7;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 90 }, () => ({
    x: next() * VIEW_W,
    y: 60 + next() * (VIEW_H - 60),
    r: 0.5 + next() * 0.9,
    light: next() > 0.5,
  }));
})();

const LIGHTS = [150, 320, 490];
const PILLARS = [2, 5];

function stallLines(row: RowSpec) {
  return Array.from({ length: STALLS_PER_ROW + 1 }, (_, index) => {
    const u = dividerU(index);
    return (
      <Line
        key={`${row.top}-${index}`}
        x1={xAt(u, row.top)}
        y1={row.top}
        x2={xAt(u, row.bottom)}
        y2={row.bottom}
        stroke="#e9edf1"
        strokeWidth={index === 0 || index === STALLS_PER_ROW ? 2.2 : 1.8}
        strokeOpacity={0.78}
      />
    );
  });
}

// The static part of the frame: garage ceiling, wall, floor, and painted stall lines.
function FeedBackdropBase() {
  return (
    <G>
      <Defs>
        <LinearGradient id="feed-floor" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#34383d" />
          <Stop offset="0.5" stopColor="#2a2d31" />
          <Stop offset="1" stopColor="#1c1e21" />
        </LinearGradient>
        <LinearGradient id="feed-wall" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#4a5057" />
          <Stop offset="1" stopColor="#31363b" />
        </LinearGradient>
        <LinearGradient id="feed-ceiling" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0d0f12" />
          <Stop offset="1" stopColor="#1a1d21" />
        </LinearGradient>
        <RadialGradient id="feed-glow" cx="0.5" cy="0.5" rx="0.5" ry="0.5">
          <Stop offset="0" stopColor="#dce8ff" stopOpacity={0.2} />
          <Stop offset="1" stopColor="#dce8ff" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="feed-vignette" cx="0.5" cy="0.52" rx="0.62" ry="0.7">
          <Stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </RadialGradient>
      </Defs>

      <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#feed-floor)" />
      <Rect x={0} y={0} width={VIEW_W} height={52} fill="url(#feed-ceiling)" />
      <Rect x={0} y={52} width={VIEW_W} height={FAR_ROW.top - 52} fill="url(#feed-wall)" />
      <Rect x={0} y={FAR_ROW.top - 22} width={VIEW_W} height={4} fill="#c9a227" fillOpacity={0.55} />
      <Rect x={0} y={FAR_ROW.top - 3} width={VIEW_W} height={3} fill="#15171a" fillOpacity={0.7} />

      {PILLARS.map(index => {
        const x = xAt(dividerU(index), FAR_ROW.top);
        return (
          <G key={`pillar-${index}`}>
            <Rect x={x - 6} y={34} width={12} height={FAR_ROW.top - 34} fill="#5d646b" />
            <Rect x={x - 6} y={34} width={4} height={FAR_ROW.top - 34} fill="#7b838b" fillOpacity={0.6} />
            <Rect x={x - 6} y={FAR_ROW.top - 12} width={12} height={12} fill="#d4b020" />
            <Rect x={x - 6} y={FAR_ROW.top - 8} width={12} height={4} fill="#1b1d20" />
          </G>
        );
      })}

      {LIGHTS.map(x => (
        <G key={`light-${x}`}>
          <Rect x={x - 46} y={14} width={92} height={5} rx={2} fill="#eaf2ff" />
          <Rect x={x - 70} y={AISLE_MID_Y - 34} width={140} height={68} fill="url(#feed-glow)" />
        </G>
      ))}

      <Line
        x1={70}
        y1={AISLE_MID_Y}
        x2={VIEW_W - 70}
        y2={AISLE_MID_Y}
        stroke="#d9b92e"
        strokeWidth={1.6}
        strokeDasharray="16 12"
        strokeOpacity={0.6}
      />
      <Path
        d={`M ${VIEW_W / 2 - 14} ${AISLE_MID_Y + 12} L ${VIEW_W / 2 + 14} ${AISLE_MID_Y + 12} L ${VIEW_W / 2} ${AISLE_MID_Y + 4} Z`}
        fill="#e9edf1"
        fillOpacity={0.35}
      />

      {stallLines(FAR_ROW)}
      {stallLines(NEAR_ROW)}
      <Line
        x1={xAt(dividerU(0), FAR_ROW.top)}
        y1={FAR_ROW.top}
        x2={xAt(dividerU(STALLS_PER_ROW), FAR_ROW.top)}
        y2={FAR_ROW.top}
        stroke="#e9edf1"
        strokeWidth={1.6}
        strokeOpacity={0.6}
      />

      {GRAIN.map((dot, index) => (
        <Circle
          key={`grain-${index}`}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill={dot.light ? '#ffffff' : '#000000'}
          fillOpacity={dot.light ? 0.06 : 0.12}
        />
      ))}
    </G>
  );
}

export const FeedBackdrop = memo(FeedBackdropBase);

export function FeedVignette() {
  return <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#feed-vignette)" />;
}
