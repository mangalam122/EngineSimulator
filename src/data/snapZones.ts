/**
 * Snap-zone catalog.
 *
 * Each zone is the invisible target an appropriate part binds to on drop.
 * Position is in world space; radius (§5.3: 0.3 units default) is the
 * distance threshold for pointer-near detection during drag.
 *
 * The `partId` field links the zone back to the one part that can fill it —
 * compatibility check in §5.3: part.snapZoneId === zone.id.
 */
import {
  BLOCK,
  CAM_Y,
  CRANK_CENTER_Y,
  DECK_Y,
  HEAD_Y,
  OIL_PAN_Y,
  VALVE_COVER_Y,
} from './geometry';

export interface SnapZone {
  id: string;
  partId: string;
  position: [number, number, number];
  radius: number;
}

export const SNAP_ZONES: SnapZone[] = [
  { id: 'zone-block',         partId: 'engine-block',     position: [0, 0, 0],                                 radius: 0.6 },
  { id: 'zone-crankshaft',    partId: 'crankshaft',       position: [0, CRANK_CENTER_Y, 0],                     radius: 0.4 },
  { id: 'zone-conrods',       partId: 'connecting-rods',  position: [0, (CRANK_CENTER_Y + DECK_Y) / 2, 0],       radius: 0.4 },
  { id: 'zone-pistons',       partId: 'pistons',          position: [0, DECK_Y - 0.2, 0],                        radius: 0.4 },
  { id: 'zone-head-gasket',   partId: 'head-gasket',      position: [0, DECK_Y + 0.01, 0],                       radius: 0.45 },
  { id: 'zone-cylinder-head', partId: 'cylinder-head',    position: [0, HEAD_Y, 0],                              radius: 0.5 },
  { id: 'zone-camshaft',      partId: 'camshaft',         position: [0, CAM_Y, 0],                               radius: 0.4 },
  { id: 'zone-valves',        partId: 'valves',           position: [0, HEAD_Y + 0.15, 0],                       radius: 0.4 },
  { id: 'zone-timing-belt',   partId: 'timing-belt',      position: [0, (CRANK_CENTER_Y + CAM_Y) / 2, BLOCK.length / 2 + 0.2], radius: 0.45 },
  { id: 'zone-spark-plugs',   partId: 'spark-plugs',      position: [0, VALVE_COVER_Y - 0.1, 0],                 radius: 0.4 },
  { id: 'zone-oil-pan',       partId: 'oil-pan',          position: [0, OIL_PAN_Y, 0],                           radius: 0.45 },
  { id: 'zone-valve-cover',   partId: 'valve-cover',      position: [0, VALVE_COVER_Y + 0.1, 0],                 radius: 0.45 },
];

export const SNAP_ZONE_BY_ID: Record<string, SnapZone> = Object.fromEntries(
  SNAP_ZONES.map((z) => [z.id, z]),
);

/** §5.3 default snap radius for pointer-near detection. */
export const DEFAULT_SNAP_RADIUS = 0.3;

/** Compute effective snap threshold given held part + target zone. */
export function snapThreshold(zone: SnapZone): number {
  return Math.max(DEFAULT_SNAP_RADIUS, zone.radius);
}
