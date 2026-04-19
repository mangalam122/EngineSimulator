/**
 * CombustionGlow — orange point-light flashes inside each cylinder during
 * the power stroke, visible only in cutaway mode (§4.2.2).
 *
 * Driven by engineRuntime.sparkFlash (already decayed by animation hook).
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointLight } from 'three';
import { useEngineStore, engineRuntime } from '../../store/useEngineStore';
import { DECK_Y, cylinderZ } from '../../data/geometry';
import { useActiveSpec } from '../../data/engineSpecs';

const CYLS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

export default function CombustionGlow() {
  const spec = useActiveSpec();
  const cutaway = useEngineStore((s) => s.cutawayEnabled);
  const mode = useEngineStore((s) => s.mode);
  const lightRefs = [useRef<PointLight>(null), useRef<PointLight>(null), useRef<PointLight>(null), useRef<PointLight>(null)];

  useFrame(() => {
    if (!cutaway || mode !== 'run') {
      lightRefs.forEach((r) => { if (r.current) r.current.intensity = 0; });
      return;
    }
    CYLS.forEach((_c, i) => {
      const ref = lightRefs[i].current;
      if (!ref) return;
      ref.intensity = engineRuntime.sparkFlash[i] * 5;
    });
  });

  // The cutaway glow lights are positioned for the inline-4 deck layout.
  // V-twin already has in-plug lights (plug-light-N) driven by the animation
  // hook, so we simply skip the extra cutaway glow group for non-inline-4.
  if (!(cutaway && mode === 'run')) return null;
  if (spec.id !== 'inline-4') return null;

  return (
    <group>
      {CYLS.map((cyl, i) => (
        <pointLight
          key={cyl}
          ref={lightRefs[i]}
          position={[0, DECK_Y - 0.15, cylinderZ(cyl)]}
          color="#ff6a1a"
          distance={1.4}
          decay={2}
          intensity={0}
        />
      ))}
    </group>
  );
}
