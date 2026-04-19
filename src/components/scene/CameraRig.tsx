/**
 * CameraRig — smooth transitions between assembly and run camera angles (§6.5).
 *
 * Also applies a tiny screen shake at high RPM (§4.2.3).
 */
import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Vector3 } from 'three';
import { useEngineStore } from '../../store/useEngineStore';

const ASSEMBLY_POS = new Vector3(5.5, 4, 7);
const RUN_POS = new Vector3(6.2, 3.2, 6.5);

export default function CameraRig() {
  const { camera } = useThree();
  const target = useRef(new Vector3());

  useFrame((_state, dt) => {
    const store = useEngineStore.getState();
    target.current.copy(store.mode === 'run' ? RUN_POS : ASSEMBLY_POS);

    // Tiny shake at high RPM
    if (store.mode === 'run' && store.rpm > 4500) {
      const mag = ((store.rpm - 4500) / 1500) * 0.015;
      target.current.x += (Math.random() - 0.5) * mag;
      target.current.y += (Math.random() - 0.5) * mag;
    }

    // Smooth ease
    camera.position.x += (target.current.x - camera.position.x) * Math.min(1, dt * 3);
    camera.position.y += (target.current.y - camera.position.y) * Math.min(1, dt * 3);
    camera.position.z += (target.current.z - camera.position.z) * Math.min(1, dt * 3);
  });

  return null;
}
