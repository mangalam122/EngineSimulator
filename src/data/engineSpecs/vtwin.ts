/**
 * Harley 45° V-twin engine spec.
 */
import { VTWIN_PART_MESHES } from '../../components/parts/VTwinMeshes';
import {
  VTW_CRANK_OFFSETS,
  VTW_FIRING_CYCLE,
  VTW_PARTS,
  VTW_SNAP_ZONES,
} from './vtwinData';
import type { EngineSpec } from './types';

export const V_TWIN_SPEC: EngineSpec = {
  id: 'v-twin',
  displayName: 'Harley 45° V-Twin',
  shortLabel: '45° V-TWIN',
  description:
    'Two cylinders in a 45° V, sharing a single crankpin, pushrod OHV valvetrain. Uneven 315°/405° firing — the iconic "potato-potato" idle.',
  cylinderCount: 2,
  bankAngleDeg: 45,
  valvetrain: 'OHV',
  valvesPerCylinder: 2,
  firingCycle: VTW_FIRING_CYCLE,
  firingOrderLabel: '1-2',
  crankOffsetForCyl: VTW_CRANK_OFFSETS,
  parts: VTW_PARTS,
  snapZones: VTW_SNAP_ZONES,
  partMeshes: VTWIN_PART_MESHES,
  audioPreset: 'potato',
  // Min dropped well below real idle so learners can step through the cycle
  // almost frame-by-frame — makes the 315°/405° uneven fire easy to spot.
  rpm: { min: 60, default: 900, max: 5500 },
};
