import type { Spot } from '../../../mock/garages';

// All drawing happens in a 16:9 viewBox. Both stall rows are projected toward a vanishing
// point above the frame, so the far row comes out narrower than the near row.
export const VIEW_W = 640;
export const VIEW_H = 360;

const CENTER_X = VIEW_W / 2;
const VANISH_Y = -200;
const REF_SPAN = 540;
const HALF_WIDTH = 275;
export const STALLS_PER_ROW = 7;
const STALL_U = (HALF_WIDTH * 2) / STALLS_PER_ROW;

export const FAR_ROW = { top: 104, bottom: 170, aisleAtBottom: true } as const;
export const NEAR_ROW = { top: 236, bottom: 352, aisleAtBottom: false } as const;
export const AISLE_MID_Y = (FAR_ROW.bottom + NEAR_ROW.top) / 2;

export type RowSpec = typeof FAR_ROW | typeof NEAR_ROW;

function scaleAt(y: number): number {
  return (y - VANISH_Y) / REF_SPAN;
}

export function xAt(u: number, y: number): number {
  return CENTER_X + u * scaleAt(y);
}

export type Stall = {
  spot: Spot;
  row: RowSpec;
  // Trapezoid corners, clockwise from the top left.
  corners: [number, number][];
  // Axis-aligned bounds, like a detector would report.
  box: { x: number; y: number; width: number; height: number };
  // Horizontal extent of the stall at its vertical middle, for sizing the car.
  mid: { x: number; width: number };
};

export function dividerU(index: number): number {
  return -HALF_WIDTH + index * STALL_U;
}

function buildStall(spot: Spot, row: RowSpec, index: number): Stall {
  const u0 = dividerU(index);
  const u1 = u0 + STALL_U;
  const corners: [number, number][] = [
    [xAt(u0, row.top), row.top],
    [xAt(u1, row.top), row.top],
    [xAt(u1, row.bottom), row.bottom],
    [xAt(u0, row.bottom), row.bottom],
  ];
  const xs = corners.map(point => point[0]);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const midY = (row.top + row.bottom) / 2;
  return {
    spot,
    row,
    corners,
    box: { x: left, y: row.top, width: right - left, height: row.bottom - row.top },
    mid: { x: (xAt(u0, midY) + xAt(u1, midY)) / 2, width: xAt(u1, midY) - xAt(u0, midY) },
  };
}

// The first row letter is the far row and the second is the near row. Stall order follows
// the spot number, left to right.
export function layoutStalls(spots: Spot[]): Stall[] {
  const rowLetters = [...new Set(spots.map(spot => spot.row))].sort();
  const stalls: Stall[] = [];
  rowLetters.slice(0, 2).forEach((letter, rowIndex) => {
    const row = rowIndex === 0 ? FAR_ROW : NEAR_ROW;
    spots
      .filter(spot => spot.row === letter)
      .sort((first, second) => first.number - second.number)
      .slice(0, STALLS_PER_ROW)
      .forEach((spot, index) => stalls.push(buildStall(spot, row, index)));
  });
  return stalls;
}
