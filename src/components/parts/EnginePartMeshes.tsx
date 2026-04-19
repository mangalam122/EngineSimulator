/**
 * Primitive part meshes — one React component per part id.
 *
 * Per design doc §8.2 we build every part from Three.js primitive geometries.
 * Shapes are stylised but recognisable. Each mesh takes three props:
 *   - placed: render the "committed" look (full opacity, cast shadows)
 *   - ghost:  render the dragging preview (semi-transparent, no shadows)
 *   - highlight: inspect-mode outline colour (undefined = none)
 *
 * REPLACE WITH GLTF MODEL IN PRODUCTION
 */
import { forwardRef, useMemo } from 'react';
import { Group, Color } from 'three';
import {
  BLOCK,
  CRANK_CENTER_Y,
  CRANK_RADIUS,
  CYLINDER_RADIUS,
  DECK_Y,
  HEAD_Y,
  OIL_PAN_Y,
  VALVE_COVER_Y,
  CAM_Y,
  cylinderZ,
} from '../../data/geometry';

type Cyl = 1 | 2 | 3 | 4;
const CYLS: Cyl[] = [1, 2, 3, 4];

interface PartProps {
  ghost?: boolean;
  highlight?: boolean;
  dim?: boolean; // inspect-mode dimming
}

/** Convert opacity + flags into a standard material input set. */
function matProps(base: string, p: PartProps) {
  const opacity = p.ghost ? 0.45 : p.dim ? 0.28 : 1;
  const transparent = opacity < 1;
  const emissive = p.highlight ? '#ffffff' : '#000000';
  const emissiveIntensity = p.highlight ? 0.55 : 0;
  return { color: base, opacity, transparent, emissive, emissiveIntensity };
}

/* --------------------------------- BLOCK --------------------------------- */
export const EngineBlockMesh = forwardRef<Group, PartProps>(function EngineBlockMesh(p, ref) {
  return (
    <group ref={ref}>
      {/* Main block */}
      <mesh castShadow receiveShadow position={[0, (DECK_Y + OIL_PAN_Y) / 2, 0]}>
        <boxGeometry args={[BLOCK.width, DECK_Y - OIL_PAN_Y, BLOCK.length]} />
        <meshStandardMaterial {...matProps('#3a4552', p)} roughness={0.6} metalness={0.35} />
      </mesh>
      {/* Cylinder bores — dark holes poking through the deck */}
      {CYLS.map((cyl) => (
        <mesh key={cyl} position={[0, DECK_Y - 0.05, cylinderZ(cyl)]}>
          <cylinderGeometry args={[CYLINDER_RADIUS, CYLINDER_RADIUS, 0.08, 28]} />
          <meshStandardMaterial {...matProps('#0d1116', p)} roughness={0.9} metalness={0.1} />
        </mesh>
      ))}
      {/* Side ribs for visual interest */}
      {[-BLOCK.width / 2 - 0.01, BLOCK.width / 2 + 0.01].map((x, i) => (
        <mesh key={i} position={[x, (DECK_Y + OIL_PAN_Y) / 2, 0]} castShadow>
          <boxGeometry args={[0.05, DECK_Y - OIL_PAN_Y - 0.1, BLOCK.length - 0.2]} />
          <meshStandardMaterial {...matProps('#2a333d', p)} roughness={0.5} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
});

/* ------------------------------ CRANKSHAFT ------------------------------- */
export const CrankshaftMesh = forwardRef<Group, PartProps>(function CrankshaftMesh(p, ref) {
  return (
    <group ref={ref} position={[0, CRANK_CENTER_Y, 0]} name="crankshaft-root">
      {/* Main journal (runs length-wise along Z) */}
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, BLOCK.length - 0.15, 20]} />
        <meshStandardMaterial {...matProps('#d4d8de', p)} roughness={0.25} metalness={0.85} />
      </mesh>
      {/* Counter-weights + throws (one per cylinder) */}
      {CYLS.map((cyl) => {
        const z = cylinderZ(cyl);
        const throwAngle = cyl === 1 || cyl === 4 ? 0 : Math.PI;
        return (
          <group key={cyl} position={[0, 0, z]} rotation={[0, 0, throwAngle]}>
            {/* counterweight disc */}
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.12, 28]} />
              <meshStandardMaterial {...matProps('#b8bec7', p)} roughness={0.3} metalness={0.8} />
            </mesh>
            {/* crank pin (offset from centre) */}
            <mesh position={[CRANK_RADIUS, 0, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 0.22, 18]} />
              <meshStandardMaterial {...matProps('#c0c5ce', p)} roughness={0.25} metalness={0.85} />
            </mesh>
          </group>
        );
      })}
      {/* Front pulley for timing belt */}
      <mesh position={[0, 0, BLOCK.length / 2 + 0.05]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.06, 24]} />
        <meshStandardMaterial {...matProps('#888f9a', p)} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
});

/* ----------------------------- CONNECTING RODS --------------------------- */
/** Render 4 rods — when running, each rod should rotate/translate to track piston Y,
 * but in Phase 1 (static) we just place them vertically. Run-mode animator will
 * override rotation via refs. */
export const ConnectingRodsMesh = forwardRef<Group, PartProps>(function ConnectingRodsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => (
        <group key={cyl} position={[0, (CRANK_CENTER_Y + DECK_Y) / 2, cylinderZ(cyl)]} name={`rod-${cyl}`}>
          {/* rod shaft */}
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.55, 0.1]} />
            <meshStandardMaterial {...matProps('#b0b6bf', p)} roughness={0.35} metalness={0.75} />
          </mesh>
          {/* big end */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.12, 20]} />
            <meshStandardMaterial {...matProps('#a0a6b0', p)} roughness={0.35} metalness={0.75} />
          </mesh>
          {/* small end */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.1, 18]} />
            <meshStandardMaterial {...matProps('#a0a6b0', p)} roughness={0.35} metalness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/* ------------------------------- PISTONS -------------------------------- */
export const PistonsMesh = forwardRef<Group, PartProps>(function PistonsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => (
        <group key={cyl} position={[0, DECK_Y - 0.2, cylinderZ(cyl)]} name={`piston-${cyl}`}>
          <mesh castShadow>
            <cylinderGeometry args={[CYLINDER_RADIUS - 0.01, CYLINDER_RADIUS - 0.01, 0.22, 28]} />
            <meshStandardMaterial {...matProps('#e3e6eb', p)} roughness={0.35} metalness={0.75} />
          </mesh>
          {/* piston ring detail */}
          <mesh position={[0, 0.06, 0]}>
            <torusGeometry args={[CYLINDER_RADIUS - 0.015, 0.008, 6, 28]} />
            <meshStandardMaterial {...matProps('#8a8f98', p)} roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <torusGeometry args={[CYLINDER_RADIUS - 0.015, 0.008, 6, 28]} />
            <meshStandardMaterial {...matProps('#8a8f98', p)} roughness={0.3} metalness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

/* ------------------------------ HEAD GASKET ----------------------------- */
export const HeadGasketMesh = forwardRef<Group, PartProps>(function HeadGasketMesh(p, ref) {
  return (
    <group ref={ref} position={[0, DECK_Y + 0.01, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BLOCK.width + 0.04, 0.04, BLOCK.length + 0.04]} />
        <meshStandardMaterial {...matProps('#b78bff', p)} roughness={0.7} metalness={0.2} />
      </mesh>
    </group>
  );
});

/* ----------------------------- CYLINDER HEAD ---------------------------- */
export const CylinderHeadMesh = forwardRef<Group, PartProps>(function CylinderHeadMesh(p, ref) {
  return (
    <group ref={ref} position={[0, HEAD_Y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BLOCK.width, 0.5, BLOCK.length]} />
        <meshStandardMaterial {...matProps('#425263', p)} roughness={0.55} metalness={0.35} />
      </mesh>
      {/* spark plug wells (holes on top) */}
      {CYLS.map((cyl) => (
        <mesh key={cyl} position={[0, 0.26, cylinderZ(cyl)]}>
          <cylinderGeometry args={[0.05, 0.05, 0.04, 16]} />
          <meshStandardMaterial {...matProps('#0d1116', p)} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
});

/* -------------------------------- CAMSHAFT ------------------------------ */
export const CamshaftMesh = forwardRef<Group, PartProps>(function CamshaftMesh(p, ref) {
  return (
    <group ref={ref} position={[0, CAM_Y, 0]} name="camshaft-root">
      <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, BLOCK.length - 0.2, 18]} />
        <meshStandardMaterial {...matProps('#d4c148', p)} roughness={0.3} metalness={0.75} />
      </mesh>
      {/* cam lobes — 2 per cylinder (intake + exhaust) */}
      {CYLS.map((cyl) => {
        const z = cylinderZ(cyl);
        return (
          <group key={cyl} position={[0, 0, z]}>
            {[-0.12, 0.12].map((zOffset, i) => (
              <mesh key={i} position={[0, 0, zOffset]} rotation={[0, 0, i === 0 ? 0 : Math.PI / 3]}>
                <cylinderGeometry args={[0.11, 0.11, 0.05, 16]} />
                <meshStandardMaterial {...matProps('#c4b040', p)} roughness={0.3} metalness={0.75} />
              </mesh>
            ))}
          </group>
        );
      })}
      {/* rear pulley for timing belt */}
      <mesh position={[0, 0, BLOCK.length / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 24]} />
        <meshStandardMaterial {...matProps('#8f7f2f', p)} roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
});

/* --------------------------------- VALVES ------------------------------- */
export const ValvesMesh = forwardRef<Group, PartProps>(function ValvesMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => {
        const z = cylinderZ(cyl);
        return (
          <group key={cyl} position={[0, HEAD_Y + 0.15, z]} name={`valves-${cyl}`}>
            {/* intake (+X side) */}
            <mesh position={[0.09, 0, 0]} name={`valve-intake-${cyl}`}>
              <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
              <meshStandardMaterial {...matProps('#e8c048', p)} roughness={0.3} metalness={0.7} />
            </mesh>
            {/* exhaust (-X side) */}
            <mesh position={[-0.09, 0, 0]} name={`valve-exhaust-${cyl}`}>
              <cylinderGeometry args={[0.04, 0.04, 0.18, 12]} />
              <meshStandardMaterial {...matProps('#c86020', p)} roughness={0.3} metalness={0.7} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});

/* ------------------------------- TIMING BELT ---------------------------- */
export const TimingBeltMesh = forwardRef<Group, PartProps>(function TimingBeltMesh(p, ref) {
  // A closed loop running over the crank pulley (y=CRANK_CENTER_Y) and cam pulley (y=CAM_Y).
  // Approximated as two arcs joined by two straight sides — built from a thin torus + rectangle hint.
  const mid = useMemo(() => (CRANK_CENTER_Y + CAM_Y) / 2, []);
  const height = CAM_Y - CRANK_CENTER_Y;
  return (
    <group ref={ref} position={[0, mid, BLOCK.length / 2 + 0.15]} name="timing-belt-root">
      {/* top cap */}
      <mesh position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.02, 8, 32, Math.PI]} />
        <meshStandardMaterial {...matProps('#1e1e22', p)} roughness={0.95} metalness={0.1} />
      </mesh>
      {/* bottom cap */}
      <mesh position={[0, -height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.02, 8, 32, Math.PI]} />
        <meshStandardMaterial {...matProps('#1e1e22', p)} roughness={0.95} metalness={0.1} />
      </mesh>
      {/* sides */}
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.02, height, 0.04]} />
          <meshStandardMaterial {...matProps('#1e1e22', p)} roughness={0.95} metalness={0.1} />
        </mesh>
      ))}
    </group>
  );
});

/* ------------------------------ SPARK PLUGS ----------------------------- */
export const SparkPlugsMesh = forwardRef<Group, PartProps>(function SparkPlugsMesh(p, ref) {
  return (
    <group ref={ref}>
      {CYLS.map((cyl) => (
        <group key={cyl} position={[0, VALVE_COVER_Y - 0.1, cylinderZ(cyl)]} name={`plug-${cyl}`}>
          {/* ceramic body */}
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.22, 14]} />
            <meshStandardMaterial {...matProps('#f0e9dc', p)} roughness={0.7} metalness={0.1} />
          </mesh>
          {/* hex collar */}
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 6]} />
            <meshStandardMaterial {...matProps('#8a8f98', p)} roughness={0.4} metalness={0.7} />
          </mesh>
          {/* spark tip (point light socket filled at runtime) */}
          <mesh position={[0, -0.14, 0]} name={`plug-tip-${cyl}`}>
            <sphereGeometry args={[0.02, 10, 10]} />
            <meshStandardMaterial {...matProps('#1a1a1a', p)} emissive={new Color('#000')} />
          </mesh>
          {/* flash light driven by the animation hook (intensity 0 by default) */}
          <pointLight name={`plug-light-${cyl}`} position={[0, -0.14, 0]} intensity={0} color="#ffaa33" distance={1.2} decay={2} />
        </group>
      ))}
    </group>
  );
});

/* -------------------------------- OIL PAN ------------------------------- */
export const OilPanMesh = forwardRef<Group, PartProps>(function OilPanMesh(p, ref) {
  return (
    <group ref={ref} position={[0, OIL_PAN_Y - 0.08, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BLOCK.width - 0.1, 0.2, BLOCK.length - 0.2]} />
        <meshStandardMaterial {...matProps('#2c3a2e', p)} roughness={0.65} metalness={0.35} />
      </mesh>
      {/* drain plug */}
      <mesh position={[0, -0.1, BLOCK.length / 4]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.03, 6]} />
        <meshStandardMaterial {...matProps('#1a2a1c', p)} roughness={0.7} />
      </mesh>
    </group>
  );
});

/* ------------------------------ VALVE COVER ----------------------------- */
export const ValveCoverMesh = forwardRef<Group, PartProps>(function ValveCoverMesh(p, ref) {
  return (
    <group ref={ref} position={[0, VALVE_COVER_Y + 0.1, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[BLOCK.width - 0.05, 0.25, BLOCK.length - 0.1]} />
        <meshStandardMaterial {...matProps('#6b4ed1', p)} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* raised crest on top */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.3, 0.04, BLOCK.length - 0.4]} />
        <meshStandardMaterial {...matProps('#826cd8', p)} roughness={0.45} metalness={0.4} />
      </mesh>
    </group>
  );
});

/** Registry — render the right mesh for a given part id. */
export const PART_MESHES: Record<string, React.ComponentType<PartProps>> = {
  'engine-block': EngineBlockMesh,
  'crankshaft': CrankshaftMesh,
  'connecting-rods': ConnectingRodsMesh,
  'pistons': PistonsMesh,
  'head-gasket': HeadGasketMesh,
  'cylinder-head': CylinderHeadMesh,
  'camshaft': CamshaftMesh,
  'valves': ValvesMesh,
  'timing-belt': TimingBeltMesh,
  'spark-plugs': SparkPlugsMesh,
  'oil-pan': OilPanMesh,
  'valve-cover': ValveCoverMesh,
};
