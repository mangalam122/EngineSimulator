/**
 * Harley 45° V-twin part meshes.
 *
 * Coordinate system (same orientation as inline-4):
 *   +X: right (bike's left side, viewer's right)
 *   +Y: up
 *   +Z: towards viewer (the V "opens" upward in the X-Y plane)
 *
 * Both cylinders tilt around the Z axis — front (cyl 1) leans +X (+22.5°),
 * rear (cyl 2) leans -X (-22.5°). Crankshaft axis is along Z. Both rods
 * share a single crankpin.
 *
 * Named groups the animation driver looks up:
 *   crankshaft-root, camshaft-root, piston-1, piston-2, rod-1, rod-2,
 *   valve-intake-N, valve-exhaust-N, plug-light-N, pushrod-N.
 *
 * REPLACE WITH GLTF MODEL IN PRODUCTION.
 */
import { forwardRef } from 'react';
import { Group, Color } from 'three';
import {
  VTW_BANK_HALF_RAD,
  VTW_CASE,
  VTW_CAM_Y,
  VTW_CRANK_CENTER_Y,
  VTW_CRANK_RADIUS,
  VTW_CYLINDER_RADIUS,
  VTW_DECK_Y,
  VTW_HEAD_TOP_Y,
  VTW_PAN_Y,
  VTW_ROD_LENGTH,
  vtwBankRotation,
} from '../../data/engineSpecs/vtwinData';
import type { PartProps } from '../../data/engineSpecs/types';

type Cyl = 1 | 2;
const CYLS: Cyl[] = [1, 2];

function matProps(base: string, p: PartProps) {
  const opacity = p.ghost ? 0.45 : p.dim ? 0.28 : 1;
  const transparent = opacity < 1;
  const emissive = p.highlight ? '#ffffff' : '#000000';
  const emissiveIntensity = p.highlight ? 0.55 : 0;
  return { color: base, opacity, transparent, emissive, emissiveIntensity };
}

/** World position at distance `d` along the bank axis of `cyl`, measured from crank centre. */
function bankOffset(cyl: Cyl, d: number): [number, number, number] {
  const angle = vtwBankRotation(cyl);
  return [Math.sin(angle) * d, VTW_CRANK_CENTER_Y + Math.cos(angle) * d, 0];
}

/* ------------------------------ CRANKCASE ------------------------------ */
export const CrankcaseMesh = forwardRef<Group, PartProps>(function CrankcaseMesh(p, ref) {
  return (
    <group ref={ref}>
      {/* Main case body */}
      <mesh castShadow receiveShadow position={[0, VTW_CRANK_CENTER_Y, 0]}>
        <boxGeometry args={[VTW_CASE.width, VTW_CASE.height, VTW_CASE.length]} />
        <meshStandardMaterial {...matProps('#3a4552', p)} roughness={0.55} metalness={0.45} />
      </mesh>
      {/* Rounded bottom "belly" suggesting the cast case profile */}
      <mesh castShadow position={[0, VTW_PAN_Y + 0.05, 0]}>
        <cylinderGeometry args={[VTW_CASE.width / 2 - 0.05, VTW_CASE.width / 2 - 0.1, 0.25, 24]} />
        <meshStandardMaterial {...matProps('#2f3944', p)} roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Case bolt detail (two visible bolts on front face) */}
      {[-0.35, 0.35].map((x) => (
        <mesh key={x} position={[x, VTW_CRANK_CENTER_Y, VTW_CASE.length / 2 + 0.01]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 6]} />
          <meshStandardMaterial {...matProps('#8a8f98', p)} roughness={0.35} metalness={0.8} />
        </mesh>
      ))}
      {/* Mounting pads on top where cylinders will bolt — angled wedges */}
      {CYLS.map((cyl) => (
        <group key={cyl} position={[0, VTW_CRANK_CENTER_Y + 0.4, 0]} rotation={[0, 0, vtwBankRotation(cyl)]}>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.7, 0.15, VTW_CASE.length - 0.1]} />
            <meshStandardMaterial {...matProps('#2a333d', p)} roughness={0.5} metalness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/* ----------------------------- CRANKSHAFT ----------------------------- */
export const VtwCrankshaftMesh = forwardRef<Group, PartProps>(function VtwCrankshaftMesh(p, ref) {
  return (
    <group ref={ref} position={[0, VTW_CRANK_CENTER_Y, 0]} name="crankshaft-root">
      {/* Main shaft along Z */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, VTW_CASE.length + 0.1, 20]} />
        <meshStandardMaterial {...matProps('#d4d8de', p)} roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Two heavy flywheels flanking the crankpin */}
      {[-0.18, 0.18].map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow>
          <cylinderGeometry args={[0.32, 0.32, 0.16, 32]} />
          <meshStandardMaterial {...matProps('#b8bec7', p)} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      {/* Single crankpin (offset from centre; both rods share it) */}
      <mesh position={[VTW_CRANK_RADIUS, 0, 0]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.45, 18]} />
        <meshStandardMaterial {...matProps('#c0c5ce', p)} roughness={0.25} metalness={0.85} />
      </mesh>
    </group>
  );
});

/* ------------------------ CONNECTING RODS (fork & blade) ------------------------ */
/** Each rod is a tall rectangle connecting the shared crankpin at the bottom
 *  to a wrist-pin at the top of its piston. We render both rods as a single
 *  group; the animation driver tracks rod-1 and rod-2 by name. */
export const VtwConnectingRodsMesh = forwardRef<Group, PartProps>(function VtwConnectingRodsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        // Rod midpoint between crankpin and small end.
        const smallEndAlongBank = VTW_ROD_LENGTH;
        const [sx, sy] = bankOffset(cyl, smallEndAlongBank);
        const midX = (VTW_CRANK_RADIUS * 0 + sx) / 2;
        const midY = (VTW_CRANK_CENTER_Y + sy) / 2;
        return (
          <group key={cyl} position={[midX, midY, 0]} name={`rod-${cyl}`}>
            <mesh castShadow rotation={[0, 0, vtwBankRotation(cyl)]}>
              <boxGeometry args={[cyl === 1 ? 0.08 : 0.06, VTW_ROD_LENGTH, 0.15]} />
              <meshStandardMaterial {...matProps(cyl === 1 ? '#a0a6b0' : '#b0b6bf', p)} roughness={0.35} metalness={0.75} />
            </mesh>
            {/* big end (shared crankpin eye) */}
            <mesh position={[-(sx - 0) / 2 * 0.25, -(sy - VTW_CRANK_CENTER_Y) / 2 * 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.14, 0.14, cyl === 1 ? 0.18 : 0.1, 20]} />
              <meshStandardMaterial {...matProps('#a0a6b0', p)} roughness={0.35} metalness={0.75} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

/* -------------------------------- PISTONS ------------------------------- */
export const VtwPistonsMesh = forwardRef<Group, PartProps>(function VtwPistonsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const [x, y, z] = bankOffset(cyl, VTW_ROD_LENGTH + 0.08);
        return (
          <group key={cyl} position={[x, y, z]} name={`piston-${cyl}`} rotation={[0, 0, vtwBankRotation(cyl)]}>
            <mesh castShadow>
              <cylinderGeometry args={[VTW_CYLINDER_RADIUS - 0.02, VTW_CYLINDER_RADIUS - 0.02, 0.26, 28]} />
              <meshStandardMaterial {...matProps('#e3e6eb', p)} roughness={0.35} metalness={0.75} />
            </mesh>
            {[0.08, -0.08].map((yOff) => (
              <mesh key={yOff} position={[0, yOff, 0]}>
                <torusGeometry args={[VTW_CYLINDER_RADIUS - 0.025, 0.009, 6, 28]} />
                <meshStandardMaterial {...matProps('#8a8f98', p)} roughness={0.3} metalness={0.8} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
});

/* -------------------------------- CYLINDERS (JUGS) ------------------------------- */
export const VtwCylindersMesh = forwardRef<Group, PartProps>(function VtwCylindersMesh(p, ref) {
  // Each jug is a finned cylinder leaning at the bank angle, mounted to the case.
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const mid = VTW_ROD_LENGTH + 0.08;
        const [x, y, z] = bankOffset(cyl, mid);
        return (
          <group key={cyl} position={[x, y, z]} rotation={[0, 0, vtwBankRotation(cyl)]}>
            {/* barrel */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[VTW_CYLINDER_RADIUS + 0.02, VTW_CYLINDER_RADIUS + 0.02, 0.56, 28]} />
              <meshStandardMaterial {...matProps('#4a5260', p)} roughness={0.65} metalness={0.35} />
            </mesh>
            {/* cooling fins: stacked thin discs */}
            {[...Array(7)].map((_, i) => {
              const yOff = -0.23 + i * 0.08;
              return (
                <mesh key={i} position={[0, yOff, 0]} castShadow>
                  <cylinderGeometry args={[VTW_CYLINDER_RADIUS + 0.12, VTW_CYLINDER_RADIUS + 0.12, 0.02, 28]} />
                  <meshStandardMaterial {...matProps('#5a6472', p)} roughness={0.7} metalness={0.3} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
});

/* ------------------------------ HEAD GASKETS ----------------------------- */
export const VtwHeadGasketsMesh = forwardRef<Group, PartProps>(function VtwHeadGasketsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const [x, y, z] = bankOffset(cyl, VTW_ROD_LENGTH + 0.42);
        return (
          <group key={cyl} position={[x, y, z]} rotation={[0, 0, vtwBankRotation(cyl)]}>
            <mesh castShadow>
              <cylinderGeometry args={[VTW_CYLINDER_RADIUS + 0.14, VTW_CYLINDER_RADIUS + 0.14, 0.04, 28]} />
              <meshStandardMaterial {...matProps('#b78bff', p)} roughness={0.7} metalness={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

/* ------------------------------ CYLINDER HEADS --------------------------- */
export const VtwCylinderHeadsMesh = forwardRef<Group, PartProps>(function VtwCylinderHeadsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const [x, y, z] = bankOffset(cyl, VTW_ROD_LENGTH + 0.58);
        return (
          <group key={cyl} position={[x, y, z]} rotation={[0, 0, vtwBankRotation(cyl)]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.75, 0.25, 0.9]} />
              <meshStandardMaterial {...matProps('#425263', p)} roughness={0.55} metalness={0.35} />
            </mesh>
            {/* fins on head */}
            {[-0.08, 0, 0.08].map((yOff, i) => (
              <mesh key={i} position={[0, yOff, 0]}>
                <boxGeometry args={[0.82, 0.015, 0.95]} />
                <meshStandardMaterial {...matProps('#526075', p)} roughness={0.6} metalness={0.3} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
});

/* ------------------------------ CAMSHAFT (IN CASE) --------------------- */
export const VtwCamshaftMesh = forwardRef<Group, PartProps>(function VtwCamshaftMesh(p, ref) {
  return (
    <group ref={ref} position={[0, VTW_CAM_Y, 0]} name="camshaft-root">
      {/* Short cam in crankcase, runs along Z */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, VTW_CASE.length - 0.1, 18]} />
        <meshStandardMaterial {...matProps('#d4c148', p)} roughness={0.3} metalness={0.75} />
      </mesh>
      {/* Four lobes — one per valve. We clock them roughly for visual variety. */}
      {[-0.3, -0.1, 0.1, 0.3].map((z, i) => (
        <mesh key={i} position={[0, 0, z]} rotation={[0, 0, i * 0.9]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
          <meshStandardMaterial {...matProps('#c4b040', p)} roughness={0.3} metalness={0.75} />
        </mesh>
      ))}
      {/* Gear on end (cam-to-crank drive) */}
      <mesh position={[0, 0, VTW_CASE.length / 2 - 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 24]} />
        <meshStandardMaterial {...matProps('#9a8928', p)} roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
});

/* -------------------------------- PUSHRODS ----------------------------- */
/** Four chrome tubes running from cam (bottom) to rocker arms (top of head),
 *  one per valve. They sit slightly to the +Z side of each cylinder. */
export const VtwPushrodsMesh = forwardRef<Group, PartProps>(function VtwPushrodsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) =>
        (['intake', 'exhaust'] as const).map((kind) => {
          // Start point: near the cam, offset in Z
          const zOff = kind === 'intake' ? 0.18 : -0.18;
          const angle = vtwBankRotation(cyl);
          // End point: at the side of the head
          const topD = VTW_ROD_LENGTH + 0.65;
          const endX = Math.sin(angle) * topD;
          const endY = VTW_CRANK_CENTER_Y + Math.cos(angle) * topD;
          const startX = 0;
          const startY = VTW_CAM_Y;
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const dx = endX - startX;
          const dy = endY - startY;
          const len = Math.hypot(dx, dy);
          // Tilt angle in XY plane (rotation around Z).
          const tilt = Math.atan2(dx, dy); // 0 = straight up
          const name = `pushrod-${cyl}-${kind}`;
          return (
            <group key={name} position={[midX, midY, zOff]} rotation={[0, 0, -tilt]}>
              <mesh castShadow name={name}>
                <cylinderGeometry args={[0.025, 0.025, len, 10]} />
                <meshStandardMaterial {...matProps('#d8dde5', p)} roughness={0.25} metalness={0.9} />
              </mesh>
            </group>
          );
        })
      )}
    </group>
  );
});

/* ---------------------------------- VALVES ----------------------------- */
export const VtwValvesMesh = forwardRef<Group, PartProps>(function VtwValvesMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const [x, y, z] = bankOffset(cyl, VTW_ROD_LENGTH + 0.72);
        const angle = vtwBankRotation(cyl);
        return (
          <group key={cyl} position={[x, y, z]} rotation={[0, 0, angle]}>
            {/* intake (+Z side) */}
            <mesh position={[0, 0, 0.15]} name={`valve-intake-${cyl}`}>
              <cylinderGeometry args={[0.05, 0.05, 0.22, 12]} />
              <meshStandardMaterial {...matProps('#e8c048', p)} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* exhaust (-Z side) */}
            <mesh position={[0, 0, -0.15]} name={`valve-exhaust-${cyl}`}>
              <cylinderGeometry args={[0.045, 0.045, 0.22, 12]} />
              <meshStandardMaterial {...matProps('#c86020', p)} roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

/* ------------------------------ SPARK PLUGS ---------------------------- */
export const VtwSparkPlugsMesh = forwardRef<Group, PartProps>(function VtwSparkPlugsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const [x, y, z] = bankOffset(cyl, VTW_ROD_LENGTH + 0.82);
        const angle = vtwBankRotation(cyl);
        return (
          <group key={cyl} position={[x, y, z]} rotation={[0, 0, angle]} name={`plug-${cyl}`}>
            {/* ceramic body */}
            <mesh castShadow>
              <cylinderGeometry args={[0.04, 0.04, 0.28, 14]} />
              <meshStandardMaterial {...matProps('#f0e9dc', p)} roughness={0.7} metalness={0.1} />
            </mesh>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.055, 0.055, 0.06, 6]} />
              <meshStandardMaterial {...matProps('#8a8f98', p)} roughness={0.4} metalness={0.7} />
            </mesh>
            <mesh position={[0, -0.25, 0]} name={`plug-tip-${cyl}`}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial {...matProps('#1a1a1a', p)} emissive={new Color('#000')} />
            </mesh>
            <pointLight name={`plug-light-${cyl}`} position={[0, -0.25, 0]} intensity={0} color="#ffaa33" distance={1.2} decay={2} />
          </group>
        );
      })}
    </group>
  );
});

/* ----------------------------- ROCKER BOXES ---------------------------- */
export const VtwRockerBoxesMesh = forwardRef<Group, PartProps>(function VtwRockerBoxesMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const [x, y, z] = bankOffset(cyl, VTW_ROD_LENGTH + 0.78);
        const angle = vtwBankRotation(cyl);
        return (
          <group key={cyl} position={[x, y, z]} rotation={[0, 0, angle]}>
            {/* sculpted cover */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.6, 0.18, 0.82]} />
              <meshStandardMaterial {...matProps('#6b4ed1', p)} roughness={0.5} metalness={0.4} />
            </mesh>
            {/* raised crest */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[0.25, 0.05, 0.7]} />
              <meshStandardMaterial {...matProps('#826cd8', p)} roughness={0.45} metalness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

/* ------------------------------ REGISTRY ------------------------------ */
export const VTWIN_PART_MESHES = {
  'vtw-crankcase': CrankcaseMesh,
  'vtw-crankshaft': VtwCrankshaftMesh,
  'vtw-connecting-rods': VtwConnectingRodsMesh,
  'vtw-pistons': VtwPistonsMesh,
  'vtw-cylinders': VtwCylindersMesh,
  'vtw-head-gaskets': VtwHeadGasketsMesh,
  'vtw-cylinder-heads': VtwCylinderHeadsMesh,
  'vtw-camshaft': VtwCamshaftMesh,
  'vtw-pushrods': VtwPushrodsMesh,
  'vtw-valves': VtwValvesMesh,
  'vtw-spark-plugs': VtwSparkPlugsMesh,
  'vtw-rocker-boxes': VtwRockerBoxesMesh,
} satisfies Record<string, React.ComponentType<PartProps>>;

// Silence unused-import warning — the helper is kept for callers that need it later.
export const _VTW_HALF = VTW_BANK_HALF_RAD;
export const _VTW_HEAD_TOP = VTW_HEAD_TOP_Y;
export const _VTW_DECK = VTW_DECK_Y;
