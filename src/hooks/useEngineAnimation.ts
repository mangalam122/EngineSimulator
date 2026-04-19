/**
 * useEngineAnimation — the heartbeat of Run Mode (§5.2).
 *
 * Spec-aware: reads the active EngineSpec to decide cylinder count, crank
 * offsets per cyl, firing times, and valvetrain behaviour. Supports both
 * inline-4 (OHC, even 180° firing) and Harley V-twin (OHV, uneven 315°/405°
 * firing with shared crankpin + pushrod visual animation).
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MathUtils, Object3D, PointLight, Scene } from 'three';
import { useEngineStore, engineRuntime } from '../store/useEngineStore';
import {
  CRANK_CENTER_Y,
  CRANK_RADIUS,
  DECK_Y,
  ROD_LENGTH,
} from '../data/geometry';
import {
  VTW_CRANK_CENTER_Y,
  VTW_CRANK_RADIUS,
  VTW_ROD_LENGTH,
  vtwBankRotation,
} from '../data/engineSpecs/vtwinData';
import { getActiveSpec } from '../data/engineSpecs';
import type { EngineSpec } from '../data/engineSpecs';
import { setEngineAudioRpm } from '../utils/audio';

/** Compute a piston's vertical world Y given crank angle + cylinder index.
 *  Branches on spec.id because the inline-4 travels along +Y, but V-twin
 *  pistons travel along the bank axis (angled 22.5° from vertical). */
function pistonPosition(
  spec: EngineSpec,
  crankAngle: number,
  cylIndex0: number,
): { x: number; y: number; z: number; travel: number } {
  const offset = spec.crankOffsetForCyl[cylIndex0] ?? 0;
  const theta = crankAngle + offset;

  if (spec.id === 'inline-4') {
    const r = CRANK_RADIUS;
    const l = ROD_LENGTH;
    const travel =
      r * Math.cos(theta) + Math.sqrt(l * l - r * r * Math.sin(theta) * Math.sin(theta)) - l;
    return { x: 0, y: DECK_Y - 0.35 + travel, z: 0, travel };
  }

  // V-twin — single crankpin. Piston travel is the slider-crank distance,
  // then we rotate that onto the cylinder's bank axis.
  const r = VTW_CRANK_RADIUS;
  const l = VTW_ROD_LENGTH;
  // For V-twin both rods share the crankpin; the phase of the PIN relative
  // to a given cylinder's bank axis is (crank - bankAngle).
  const cyl = cylIndex0 + 1;
  const bank = vtwBankRotation(cyl as 1 | 2);
  const local = theta - bank; // angle in the cylinder's own frame
  const localTravel =
    r * Math.cos(local) + Math.sqrt(l * l - r * r * Math.sin(local) * Math.sin(local)) - l;
  // Base anchor is where piston sits at TDC minus travel range along bank.
  const alongBank = VTW_ROD_LENGTH + 0.08 + localTravel;
  const x = Math.sin(bank) * alongBank;
  const y = VTW_CRANK_CENTER_Y + Math.cos(bank) * alongBank;
  return { x, y, z: 0, travel: localTravel };
}

/** Valve lift (0..1) for given cam angle + cylinder + kind. Uses firing-cycle
 *  entry for that cylinder to phase each lobe. */
function valveLift(
  spec: EngineSpec,
  camAngle: number,
  cylIndex0: number,
  kind: 'intake' | 'exhaust',
): number {
  const fire = spec.firingCycle.find((f) => f.cyl === cylIndex0 + 1);
  if (!fire) return 0;
  const fireInCam = fire.crankAngle / 2;
  const phase = kind === 'intake' ? fireInCam - Math.PI * 0.25 : fireInCam + Math.PI * 1.15;
  const local = MathUtils.euclideanModulo(camAngle - phase, Math.PI * 2);
  const WINDOW = (80 * Math.PI) / 180;
  if (local > WINDOW) return 0;
  return Math.sin((local / WINDOW) * Math.PI);
}

/** Detect zero-crossing of "angle just passed the firing point" in the 720° cycle. */
function sparkFired(prev: number, next: number, fireAngle: number): boolean {
  const p = MathUtils.euclideanModulo(prev - fireAngle, Math.PI * 4);
  const n = MathUtils.euclideanModulo(next - fireAngle, Math.PI * 4);
  // we want to detect the 720° wrap — when normalised angle crosses 2π (since the cycle is 4π).
  const TARGET = Math.PI * 2;
  return (p < TARGET && n >= TARGET) || (p > n && (TARGET > p || TARGET <= n));
}

interface CachedRefs {
  crank?: Object3D;
  cam?: Object3D;
  belt?: Object3D;
  pistons: (Object3D | undefined)[];
  rods: (Object3D | undefined)[];
  intakeValves: (Object3D | undefined)[];
  exhaustValves: (Object3D | undefined)[];
  plugLights: (PointLight | undefined)[];
  pushrods: (Object3D | undefined)[];
}

function buildCache(scene: Scene, spec: EngineSpec): CachedRefs {
  const n = spec.cylinderCount;
  const idx = Array.from({ length: n }, (_, i) => i + 1);
  return {
    crank: scene.getObjectByName('crankshaft-root') ?? undefined,
    cam: scene.getObjectByName('camshaft-root') ?? undefined,
    belt: scene.getObjectByName('timing-belt-root') ?? undefined,
    pistons: idx.map((c) => scene.getObjectByName(`piston-${c}`) ?? undefined),
    rods: idx.map((c) => scene.getObjectByName(`rod-${c}`) ?? undefined),
    intakeValves: idx.map((c) => scene.getObjectByName(`valve-intake-${c}`) ?? undefined),
    exhaustValves: idx.map((c) => scene.getObjectByName(`valve-exhaust-${c}`) ?? undefined),
    plugLights: idx.map((c) => scene.getObjectByName(`plug-light-${c}`) as PointLight | undefined),
    // Pushrods are indexed by [cyl]-[intake|exhaust]; we don't cache individually
    // since we re-use rod pulse animation instead of per-tube motion for now.
    pushrods: [],
  };
}

export function useEngineAnimation() {
  const { scene } = useThree();
  const prevAngleRef = useRef(0);
  const cacheRef = useRef<CachedRefs | null>(null);
  const cacheVersionRef = useRef(-1);

  useEffect(() => {
    // Invalidate cache whenever assembled set OR engine spec changes.
    const unsub = useEngineStore.subscribe((s) => {
      const specKey = s.engineSpecId === 'v-twin' ? 2 : 1;
      const v = s.assembledParts.length * 10 + (s.mode === 'run' ? 1000 : 0) + specKey * 100000;
      if (v !== cacheVersionRef.current) {
        cacheRef.current = null;
        cacheVersionRef.current = v;
      }
      if (s.mode === 'run') setEngineAudioRpm(s.rpm);
    });
    return unsub;
  }, []);

  useFrame((_state, dt) => {
    const store = useEngineStore.getState();
    if (store.mode !== 'run') {
      prevAngleRef.current = 0;
      return;
    }

    const spec = getActiveSpec();
    // Rebuild cache while any critical ref is missing. This matters for the
    // "Just show me it running" shortcut: we batch-place all parts and flip to
    // run mode in a single tick, so the first useFrame fires BEFORE React has
    // committed the piston/rod meshes. Without this retry, the cache would
    // lock in empty refs forever and nothing would animate.
    const existing = cacheRef.current;
    const needsRebuild = !existing || !existing.crank || !existing.pistons[0];
    const cache = needsRebuild ? buildCache(scene, spec) : (existing as CachedRefs);
    cacheRef.current = cache;

    const clampedDt = Math.min(dt, 1 / 30);
    const omega = (store.rpm / 60) * Math.PI * 2;
    const prev = prevAngleRef.current;
    const next = prev + omega * clampedDt;
    prevAngleRef.current = next;
    engineRuntime.crankAngle = MathUtils.euclideanModulo(next, Math.PI * 2);

    if (cache.crank) cache.crank.rotation.z = next;
    if (cache.cam) cache.cam.rotation.z = next * 0.5;
    if (cache.belt) cache.belt.rotation.z = next * 0.5;

    const camAngle = next * 0.5;

    // Reset per-cyl runtime arrays up to cylinderCount (keep slots beyond to 0).
    for (let i = spec.cylinderCount; i < 4; i++) {
      engineRuntime.pistonY[i] = 0;
      engineRuntime.sparkFlash[i] = 0;
    }
    for (let i = spec.cylinderCount * 2; i < 8; i++) engineRuntime.valveOpen[i] = false;

    for (let i = 0; i < spec.cylinderCount; i++) {
      const cyl = i + 1;
      const pos = pistonPosition(spec, next, i);
      engineRuntime.pistonY[i] = pos.y;
      const pObj = cache.pistons[i];
      if (pObj) {
        pObj.position.x = pos.x;
        pObj.position.y = pos.y;
      }

      const rObj = cache.rods[i];
      if (rObj) {
        if (spec.id === 'inline-4') {
          const theta = next + (spec.crankOffsetForCyl[i] ?? 0);
          const xPin = CRANK_RADIUS * Math.sin(theta);
          const rodTilt = Math.atan2(xPin, ROD_LENGTH);
          rObj.rotation.z = -rodTilt;
          rObj.position.y = (CRANK_CENTER_Y + pos.y) / 2;
        } else {
          // V-twin rod: midpoint between shared crankpin and current piston position.
          const pinX = VTW_CRANK_RADIUS * Math.cos(next);
          const pinY = VTW_CRANK_CENTER_Y + VTW_CRANK_RADIUS * Math.sin(next);
          rObj.position.x = (pinX + pos.x) / 2;
          rObj.position.y = (pinY + pos.y) / 2;
          const dx = pos.x - pinX;
          const dy = pos.y - pinY;
          rObj.rotation.z = Math.atan2(dx, dy) - Math.PI / 2 + Math.PI / 2;
          // Keep rod upright by resetting to its bank angle; fine-grain orientation
          // would need per-rod mesh rotation anchoring which we skip for MVP.
          rObj.rotation.z = vtwBankRotation(cyl as 1 | 2);
        }
      }

      const intakeLift = valveLift(spec, camAngle, i, 'intake');
      const exhaustLift = valveLift(spec, camAngle, i, 'exhaust');
      engineRuntime.valveOpen[i] = intakeLift > 0.2;
      engineRuntime.valveOpen[i + spec.cylinderCount] = exhaustLift > 0.2;
      const iObj = cache.intakeValves[i];
      const eObj = cache.exhaustValves[i];
      if (iObj) iObj.position.y = -intakeLift * 0.08;
      if (eObj) eObj.position.y = -exhaustLift * 0.08;

      const firing = spec.firingCycle.find((f) => f.cyl === cyl);
      if (firing && sparkFired(prev, next, firing.crankAngle)) {
        engineRuntime.sparkFlash[i] = 1;
      } else {
        engineRuntime.sparkFlash[i] = Math.max(0, engineRuntime.sparkFlash[i] - clampedDt * 6);
      }
      const l = cache.plugLights[i];
      if (l) l.intensity = engineRuntime.sparkFlash[i] * 3;
    }
  });
}
