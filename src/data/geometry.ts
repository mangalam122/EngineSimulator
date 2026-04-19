/**
 * Engine geometry constants.
 *
 * Central home for every magic number that places meshes in world space —
 * cylinder pitch, crank radius, rod length, cam lobe offsets. Keeping these
 * here lets part meshes, snap zones, and the run-mode animator all agree
 * on one coordinate system.
 *
 * Coordinate convention:
 *   +X: front of engine (towards camera default)     │ negative X → rear
 *   +Y: up                                           │ ground at y = -0.85
 *   +Z: intake side                                  │ -Z → exhaust side
 *
 * Cylinders are numbered 1..4 front-to-back per design doc §4.2.1.
 * Firing order: 1 → 3 → 4 → 2.
 */
import { Vector3 } from 'three';

export const BLOCK = {
  width: 1.6,  // X extent
  height: 1.4, // Y extent (deck to pan flange)
  length: 4.2, // Z length — four cylinders spaced along Z
};

/** Distance between cylinder centres (Z axis). */
export const CYLINDER_PITCH = 0.9;

/** Z position of cylinder N (1-indexed). */
export function cylinderZ(cyl: 1 | 2 | 3 | 4): number {
  // cyl 1 at +Z (front), cyl 4 at -Z (back).
  const idx = cyl - 1; // 0..3
  const startZ = ((4 - 1) * CYLINDER_PITCH) / 2;
  return startZ - idx * CYLINDER_PITCH;
}

export const CRANK_CENTER_Y = -0.25;   // crankshaft main axis height
export const DECK_Y = 0.75;            // top of block (cylinder head mates here)
export const HEAD_Y = DECK_Y + 0.5;    // mid-height of cylinder head
export const CAM_Y = HEAD_Y + 0.35;    // camshaft centre on top of head
export const OIL_PAN_Y = -0.7;
export const VALVE_COVER_Y = CAM_Y + 0.3;

export const CRANK_RADIUS = 0.22;  // half of stroke — piston travel is 2·r
export const ROD_LENGTH = 0.65;    // c‑rod length, > crank radius so formula is stable
export const CYLINDER_RADIUS = 0.22;

/** Firing-order crank-angle offset (radians) — §8.5. */
export const CYL_FIRING_OFFSET: Record<1 | 2 | 3 | 4, number> = {
  1: 0,
  3: Math.PI,           // 180°
  4: 2 * Math.PI,       // 360° → 0, but kept distinct for clarity
  2: 3 * Math.PI,       // 540° → π
};

/** Crank throw offset per cylinder — used to compute piston Y. */
export function crankOffsetForCylinder(cyl: 1 | 2 | 3 | 4): number {
  // In a 4-cyl inline, cyl 1 & 4 rise together, 2 & 3 rise together (flat-plane).
  // Simulate this: 1 and 4 at 0°, 2 and 3 at 180°.
  if (cyl === 1 || cyl === 4) return 0;
  return Math.PI;
}

/** World position of the head snap zone (a single anchor — the head mates over all cylinders). */
export const HEAD_ANCHOR = new Vector3(0, HEAD_Y, 0);
export const BLOCK_ANCHOR = new Vector3(0, 0, 0);
export const CRANK_ANCHOR = new Vector3(0, CRANK_CENTER_Y, 0);
