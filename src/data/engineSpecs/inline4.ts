/**
 * Inline-4 engine spec — adapts the existing parts/meshes/firing into the
 * EngineSpec contract. No behaviour change vs pre-spec version; this just
 * wraps current data so the app has a default spec to load.
 */
import { PARTS as INLINE4_PARTS } from '../parts';
import { SNAP_ZONES as INLINE4_SNAP_ZONES } from '../snapZones';
import { PART_MESHES as INLINE4_MESHES } from '../../components/parts/EnginePartMeshes';
import type { EngineSpec } from './types';

// Crank offsets: cyls 1 & 4 rise together (θ=0), cyls 2 & 3 together (θ=π).
const CRANK_OFFSETS = [0, Math.PI, Math.PI, 0];

// 1 → 3 → 4 → 2 firing, evenly 180° apart across one 720° cycle.
const FIRING_CYCLE = [
  { cyl: 1, crankAngle: 0 },
  { cyl: 3, crankAngle: Math.PI },
  { cyl: 4, crankAngle: 2 * Math.PI },
  { cyl: 2, crankAngle: 3 * Math.PI },
];

export const INLINE_4_SPEC: EngineSpec = {
  id: 'inline-4',
  displayName: 'Inline-4',
  shortLabel: '4-CYL INLINE',
  description: 'Four cylinders in a row, single overhead cam via timing belt. The default modern small-car engine.',
  cylinderCount: 4,
  bankAngleDeg: 0,
  valvetrain: 'OHC',
  valvesPerCylinder: 2,
  firingCycle: FIRING_CYCLE,
  firingOrderLabel: '1-3-4-2',
  crankOffsetForCyl: CRANK_OFFSETS,
  parts: INLINE4_PARTS,
  snapZones: INLINE4_SNAP_ZONES,
  partMeshes: INLINE4_MESHES,
  audioPreset: 'smooth',
  // Min is intentionally well below real idle (800) so learners can slow the
  // animation down to almost-frame-by-frame pace to study each stroke.
  // 60 rpm = 1 crank rotation / second — slow enough to watch each valve move.
  rpm: { min: 60, default: 900, max: 6000 },
};
