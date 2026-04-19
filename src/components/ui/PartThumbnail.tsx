/**
 * PartThumbnail — tiny 3D preview rendered per tray card (§4.1.1).
 *
 * Each thumbnail is its own miniature <Canvas> because R3F's Canvas is the
 * WebGL boundary. 12 thumbnails × 12 tiny canvases is fine (<200 draw calls
 * each, and r3f lazy-renders only when the card is visible).
 */
import { Canvas } from '@react-three/fiber';
import { useActiveSpec } from '../../data/engineSpecs';
import { useMemo } from 'react';
import { Vector3 } from 'three';

export default function PartThumbnail({ partId }: { partId: string }) {
  const spec = useActiveSpec();
  const Mesh = spec.partMeshes[partId];
  if (!Mesh) return null;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [2.2, 1.6, 2.6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 2]} intensity={0.9} />
      <directionalLight position={[-2, 1, -2]} intensity={0.35} color="#8eb8ff" />
      <FittedThumbnail partId={partId} />
    </Canvas>
  );
}

function FittedThumbnail({ partId }: { partId: string }) {
  const spec = useActiveSpec();
  const Mesh = spec.partMeshes[partId];
  // Center + scale mesh to fit the thumbnail's viewing volume.
  const { position, scale } = useMemo(() => {
    // Very rough bounding approximations per part. Tuned empirically.
    const largeInline = ['engine-block', 'cylinder-head', 'oil-pan', 'valve-cover', 'head-gasket'];
    const mediumInline = ['crankshaft', 'camshaft', 'pistons', 'connecting-rods', 'valves', 'timing-belt'];
    // V-twin parts are generally smaller/taller, so use different scales.
    const largeVtw = ['vtw-crankcase', 'vtw-cylinder-heads', 'vtw-cylinders', 'vtw-rocker-boxes'];
    const mediumVtw = ['vtw-crankshaft', 'vtw-pistons', 'vtw-connecting-rods', 'vtw-camshaft', 'vtw-valves', 'vtw-pushrods'];
    let s: number;
    if (spec.id === 'v-twin') {
      s = largeVtw.includes(partId) ? 0.65 : mediumVtw.includes(partId) ? 0.9 : 1.1;
    } else {
      s = largeInline.includes(partId) ? 0.7 : mediumInline.includes(partId) ? 1.1 : 1.4;
    }
    return { position: new Vector3(0, 0, 0), scale: s };
  }, [partId, spec.id]);

  return (
    <group position={position} scale={scale}>
      {Mesh ? <Mesh /> : null}
    </group>
  );
}
