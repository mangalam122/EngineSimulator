/**
 * Scene — root of the 3D world.
 *
 * Owns:
 *   • Lighting rig (ambient + key + fill + rim)
 *   • Environment preset for PBR reflections (Drei <Environment>)
 *   • Ground plane with subtle shadow catcher
 *   • OrbitControls (camera)
 *   • <EngineAssembly> + <HeldPart> (populated in later phases)
 *
 * Design doc §6.1 acceptance criteria: ambient + directional lighting,
 * orbit/zoom/pan, environment reflections, 3/4 front-top start angle, 60fps.
 */
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { useEngineStore } from '../../store/useEngineStore';
import EngineAssembly from '../engine/EngineAssembly';
import HeldPart from '../engine/HeldPart';
import SnapZones from '../engine/SnapZones';
import RunModeDriver from '../engine/RunModeDriver';
import CutawayClipping from '../engine/CutawayClipping';
import CombustionGlow from '../engine/CombustionGlow';
import CameraRig from './CameraRig';

export default function Scene() {
  const heldPart = useEngineStore((s) => s.heldPart);

  return (
    <>
      {/* --- Lighting --- */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-5, 4, -3]} intensity={0.4} color="#b8d4ff" />
      <pointLight position={[0, 5, -6]} intensity={0.3} color="#ff9b55" />

      {/* --- HDR-ish environment (preset; no asset download at runtime) --- */}
      <Environment preset="warehouse" background={false} />

      {/* --- Ground + subtle contact shadow --- */}
      <ContactShadows
        position={[0, -0.85, 0]}
        opacity={0.55}
        scale={12}
        blur={2.2}
        far={3}
        color="#000000"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.86, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#14181d" roughness={1} metalness={0} />
      </mesh>

      {/* --- Engine scene graph --- */}
      <EngineAssembly />
      <SnapZones />
      <HeldPart />
      <CombustionGlow />

      {/* --- Systems (render nothing, drive side-effects) --- */}
      <RunModeDriver />
      <CutawayClipping />
      <CameraRig />

      {/* Click on empty space dismisses inspect panel */}
      <mesh
        position={[0, 0, 0]}
        visible={false}
        onPointerDown={() => useEngineStore.getState().selectPart(null)}
      >
        <boxGeometry args={[0.001, 0.001, 0.001]} />
      </mesh>

      {/* --- Camera controls --- */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate={!heldPart /* §8.3 — disable orbit while dragging a part */}
        minDistance={4}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0.4, 0]}
      />
    </>
  );
}
