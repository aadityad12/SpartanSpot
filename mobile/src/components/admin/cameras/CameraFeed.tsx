import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { detectionConfidence, hashUnit, type Camera } from '../../../mock/cameras';
import type { Spot, SpotStatus } from '../../../mock/garages';
import { FeedBackdrop, FeedVignette } from './FeedBackdrop';
import { Car, DetectionBox, MONO } from './FeedOverlay';
import { layoutStalls, VIEW_H, VIEW_W } from './scene';
import { ageLabel, frameTimestamp } from './time';

// Seeded static for the "signal lost" state.
const STATIC = (() => {
  let seed = 42;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  return Array.from({ length: 260 }, () => ({
    x: Math.floor(next() * (VIEW_W / 8)) * 8,
    y: Math.floor(next() * (VIEW_H / 4)) * 4,
    width: 8 + Math.floor(next() * 3) * 8,
    shade: Math.floor(40 + next() * 90),
  }));
})();

const BRACKETS = [
  'M 12 30 L 12 12 L 30 12',
  'M 628 30 L 628 12 L 610 12',
  'M 12 330 L 12 348 L 30 348',
  'M 628 330 L 628 348 L 610 348',
];

function Hud({ camera, now, label }: { camera: Camera; now: number; label: string }) {
  const offline = camera.status === 'offline';
  const blink = Math.floor(now / 1000) % 2 === 0;
  const dotColor = offline ? '#8b939b' : '#ff3b30';
  const pillWidth = 64 + camera.id.length * 6.2 + (offline ? 14 : 0);

  return (
    <G>
      {BRACKETS.map(path => (
        <Path key={path} d={path} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={1.4} fill="none" />
      ))}
      <Rect x={22} y={20} width={pillWidth} height={19} rx={4} fill="#000" fillOpacity={0.55} />
      <Circle cx={33} cy={29.5} r={3.6} fill={dotColor} fillOpacity={offline || blink ? 1 : 0.3} />
      <SvgText x={42} y={33} fontSize={10} fontWeight="bold" fontFamily={MONO} fill={offline ? '#c3c9cf' : '#ff6a60'}>
        {offline ? 'OFFLINE' : 'LIVE'}
      </SvgText>
      <SvgText x={offline ? 90 : 76} y={33} fontSize={10} fontFamily={MONO} fill="#f1f4f7">
        {camera.id}
      </SvgText>

      <Rect x={VIEW_W - 22 - 148} y={20} width={148} height={19} rx={4} fill="#000" fillOpacity={0.55} />
      <SvgText x={VIEW_W - 30} y={33} fontSize={9.5} fontFamily={MONO} fill="#f1f4f7" textAnchor="end">
        {label}
      </SvgText>

      <Rect x={22} y={VIEW_H - 39} width={camera.status === 'offline' ? 120 : 82} height={19} rx={4} fill="#000" fillOpacity={0.55} />
      <SvgText x={30} y={VIEW_H - 26} fontSize={10} fontFamily={MONO} fill={camera.status === 'degraded' ? '#ffc857' : '#f1f4f7'}>
        {offline ? 'fps 0.0 · no input' : `fps ${camera.fps.toFixed(1)}`}
      </SvgText>
    </G>
  );
}

function SignalLost({ camera }: { camera: Camera }) {
  return (
    <G>
      <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#16191c" />
      {STATIC.map((cell, index) => (
        <Rect
          key={`static-${index}`}
          x={cell.x}
          y={cell.y}
          width={cell.width}
          height={4}
          fill={`rgb(${cell.shade},${cell.shade},${cell.shade})`}
          fillOpacity={0.5}
        />
      ))}
      <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#0c0e10" fillOpacity={0.45} />
      <Rect x={VIEW_W / 2 - 112} y={VIEW_H / 2 - 36} width={224} height={72} rx={8} fill="#0c0e10" fillOpacity={0.82} />
      <SvgText x={VIEW_W / 2} y={VIEW_H / 2 - 8} fontSize={19} fontWeight="bold" fontFamily={MONO} fill="#f1f4f7" textAnchor="middle">
        Signal lost
      </SvgText>
      <SvgText x={VIEW_W / 2} y={VIEW_H / 2 + 14} fontSize={10} fontFamily={MONO} fill="#aab2bb" textAnchor="middle">
        {`Last frame ${ageLabel(camera.lastFrameSecondsAgo)}`}
      </SvgText>
    </G>
  );
}

type Props = {
  camera: Camera;
  spots: Spot[];
  statusOf: (spot: Spot) => SpotStatus;
  showBoxes: boolean;
  now: number;
  garageLabel: string;
};

// A parking-camera frame drawn from the same spot data as the level map, so the boxes
// always agree with what students see.
export function CameraFeed({ camera, spots, statusOf, showBoxes, now, garageLabel }: Props) {
  const offline = camera.status === 'offline';
  const degraded = camera.status === 'degraded';
  const stalls = offline ? [] : layoutStalls(spots);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={
        offline
          ? `Camera ${camera.id} signal lost`
          : `Live view of camera ${camera.id}${showBoxes ? ' with detection boxes' : ''}`
      }
      style={styles.frame}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice">
        {offline ? (
          <SignalLost camera={camera} />
        ) : (
          <>
            <FeedBackdrop />
            {stalls.map(stall => {
              const status = statusOf(stall.spot);
              // Reserved stalls without a car in them are shown empty under a gold box.
              const hasCar = status === 'occupied';
              return hasCar ? (
                <Car key={`car-${stall.spot.id}`} stall={stall} variant={Math.floor(hashUnit(stall.spot.id) * 8)} />
              ) : null;
            })}
            {showBoxes
              ? stalls.map(stall => (
                  <DetectionBox
                    key={`box-${stall.spot.id}`}
                    stall={stall}
                    status={statusOf(stall.spot)}
                    confidence={detectionConfidence(camera, stall.spot.id)}
                  />
                ))
              : null}
            {degraded ? (
              <G>
                <Rect x={0} y={118} width={VIEW_W} height={3} fill="#fff" fillOpacity={0.1} />
                <Rect x={0} y={246} width={VIEW_W} height={5} fill="#fff" fillOpacity={0.08} />
                <Rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#2a2108" fillOpacity={0.14} />
              </G>
            ) : null}
            <FeedVignette />
          </>
        )}
        <Hud camera={camera} now={now} label={offline ? `Last frame ${ageLabel(camera.lastFrameSecondsAgo)}` : frameTimestamp(now)} />
        <SvgText x={VIEW_W - 30} y={VIEW_H - 26} fontSize={9.5} fontFamily={MONO} fill="#f1f4f7" fillOpacity={0.8} textAnchor="end">
          {garageLabel}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0c0e10',
  },
});
