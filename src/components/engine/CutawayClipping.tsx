/**
 * CutawayClipping — applies a Three.js ClippingPlane (§4.2.2) so the cylinder
 * head and valve cover become invisible on the near side, revealing the
 * internals during Run Mode.
 *
 * Implementation: when cutawayEnabled, we enable renderer localClippingEnabled
 * and walk any Mesh named with "cutaway" in its parent's userData. To keep the
 * implementation simple here we tag the head + valve-cover meshes by name and
 * apply the plane to their materials.
 */
import { useEffect } from 'react';
import { Plane, Vector3, Mesh } from 'three';
import { useThree } from '@react-three/fiber';
import { useEngineStore } from '../../store/useEngineStore';

const PLANE = new Plane(new Vector3(-1, 0, 0), 0);
// Parts whose materials should respect the clipping plane when cutaway is on.
const CUTAWAY_PART_IDS = new Set([
  // Inline-4
  'cylinder-head',
  'valve-cover',
  'engine-block',
  // V-twin
  'vtw-cylinder-heads',
  'vtw-rocker-boxes',
  'vtw-cylinders',
  'vtw-crankcase',
]);

export default function CutawayClipping() {
  const cutaway = useEngineStore((s) => s.cutawayEnabled);
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.localClippingEnabled = cutaway;
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      // Walk up ancestors to find a partId tag
      let cur: any = obj;
      let partId: string | undefined;
      while (cur) {
        if (cur.userData?.partId) { partId = cur.userData.partId; break; }
        cur = cur.parent;
      }
      if (!partId || !CUTAWAY_PART_IDS.has(partId)) return;
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m: any) => {
        if (!m) return;
        m.clippingPlanes = cutaway ? [PLANE] : [];
        m.clipShadows = true;
        m.needsUpdate = true;
      });
    });
  }, [cutaway, gl, scene]);

  return null;
}
