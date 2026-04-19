/**
 * EngineSpec — polymorphic configuration that drives every part, mesh,
 * snap zone, firing calculation and UI label in the app.
 *
 * Two spec implementations ship today (inline-4 + Harley 45° V-twin); any
 * new engine type (flat-six, V8, etc.) plugs in here.
 */
import type { ComponentType, ReactNode } from 'react';

export type PartCategory =
  | 'Structure'
  | 'Motion'
  | 'ValveTrain'
  | 'Ignition'
  | 'Sealing'
  | 'Lubrication'
  | 'Sync';

export interface Tooltip {
  title: string;
  body: string;
  funFact: string;
}

export interface EnginePart {
  id: string;
  name: string;
  category: PartCategory;
  snapZoneId: string;
  assemblyOrder: number;
  tooltip: Tooltip;
  color: string;
  soundOnSnap: 'click';
  requiresParts: string[];
  instanceCount: number;
}

export interface SnapZone {
  id: string;
  partId: string;
  position: [number, number, number];
  radius: number;
}

export interface PartProps {
  ghost?: boolean;
  highlight?: boolean;
  dim?: boolean;
}

export type ValvetrainType = 'OHC' | 'OHV'; // Overhead Cam (belt-driven) vs Pushrod OHV

export interface EngineSpec {
  id: 'inline-4' | 'v-twin';
  displayName: string;
  shortLabel: string;            // "4-CYL INLINE" / "45° V-TWIN"
  description: string;           // one-liner shown in selector tooltip
  cylinderCount: number;
  bankAngleDeg: number;          // 0 for inline, 45 for Harley
  valvetrain: ValvetrainType;
  valvesPerCylinder: number;     // 2 for both specs (intake + exhaust)

  /** Firing event times, expressed as absolute crank angle (rad) within the 720° 4-stroke cycle.
   *  firingCycle[i] = { cylinderIndex (0-based), crankAngle (0..4π) } */
  firingCycle: { cyl: number; crankAngle: number }[];

  /** Display string like "1-3-4-2" or "1-2" (front then rear). */
  firingOrderLabel: string;

  /** Crank offset per cylinder (radians) — drives piston slider-crank phase. */
  crankOffsetForCyl: number[];   // index = cyl - 1

  /** Parts catalog (tray cards). */
  parts: EnginePart[];

  /** Snap zones (3D drop targets). */
  snapZones: SnapZone[];

  /** Mesh component map: part id → React component. */
  partMeshes: Record<string, ComponentType<PartProps>>;

  /** Audio preset tag — audio.ts branches on this for engine synth character. */
  audioPreset: 'smooth' | 'potato';

  /** Minimum/default/max RPM for the slider. */
  rpm: { min: number; default: number; max: number };

  /** Optional legend / tooltip block for the firing-order badge. */
  badgeHint?: ReactNode;
}
