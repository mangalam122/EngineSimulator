/**
 * useAssemblyInteractions — drag/drop state and raycast plumbing for held parts.
 *
 * Design doc §5.3 requirements:
 *   • Event-driven (not useFrame) snap detection to avoid jank.
 *   • Single shared raycaster (§8.3).
 *   • Drop commits if nearest zone is compatible AND requirements met.
 *   • Drop outside any zone → bounce back (part returns to tray).
 *
 * We raycast against a y-plane that sits just above the engine so the part
 * can hover over zones before committing.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Group, Plane, Raycaster, Vector2, Vector3 } from 'three';
// Vector3 retained for SHARED_HIT allocation below.
import { useEngineStore } from '../store/useEngineStore';
import { getActiveSpec } from '../data/engineSpecs';
import { playClick } from '../utils/audio';

const DRAG_PLANE_Y = 1.2; // world Y where the pointer ray is intersected
const SHARED_RAYCASTER = new Raycaster();
const SHARED_POINTER = new Vector2();
const SHARED_HIT = new Vector3();
const DRAG_PLANE = new Plane(new Vector3(0, 1, 0), -DRAG_PLANE_Y);

export function useAssemblyInteractions() {
  const groupRef = useRef<Group>(null);
  const { camera, gl } = useThree();
  const heldPart = useEngineStore((s) => s.heldPart);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      SHARED_POINTER.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      SHARED_POINTER.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      SHARED_RAYCASTER.setFromCamera(SHARED_POINTER, camera);
      const hit = SHARED_RAYCASTER.ray.intersectPlane(DRAG_PLANE, SHARED_HIT);
      if (!hit) return;

      const store = useEngineStore.getState();
      if (!store.heldPart) return;
      const spec = getActiveSpec();
      const part = spec.parts.find((q) => q.id === store.heldPart);
      if (!part) return;

      // Check X/Z distance to THE part's snap zone. We only use X/Z because the drag
      // plane is at a fixed world Y — the zone may live at a very different Y, and we
      // want the part to magnet down to it when the user hovers above.
      //
      // Since each part has exactly ONE valid target zone we keep the threshold
      // generous (whole-engine-bay) so the user doesn't have to aim pixel-perfect.
      const zone = spec.snapZones.find((z) => z.id === part.snapZoneId);
      if (!zone) return;
      const dx = hit.x - zone.position[0];
      const dz = hit.z - zone.position[2];
      const distXZ = Math.hypot(dx, dz);
      const FORGIVING_XZ = 5; // unit radius around the engine counts as "in the bay"
      const alreadyFilled = store.assembledParts.includes(part.id);
      const depsMet = part.requiresParts.every((r) => store.assembledParts.includes(r));
      const near = !alreadyFilled && depsMet && distXZ < FORGIVING_XZ;

      if (import.meta.env.DEV) {
        (window as any).__snapDebug = {
          hit: [hit.x.toFixed(2), hit.y.toFixed(2), hit.z.toFixed(2)],
          zoneId: zone.id,
          zonePos: zone.position,
          distXZ: distXZ.toFixed(3),
          threshold: FORGIVING_XZ,
          near,
          depsMet,
          alreadyFilled,
        };
      }

      if (near) {
        useEngineStore.getState().setNearestSnapZone(zone.id);
        // Smooth magnet to zone (at its true Y)
        groupRef.current?.position.set(zone.position[0], zone.position[1], zone.position[2]);
      } else {
        if (store.nearestSnapZone) useEngineStore.getState().setNearestSnapZone(null);
        groupRef.current?.position.copy(hit);
      }
    },
    [camera, gl.domElement],
  );

  const commitOrReject = useCallback(() => {
    const store = useEngineStore.getState();
    if (!store.heldPart) return;
    const spec = getActiveSpec();
    const part = spec.parts.find((q) => q.id === store.heldPart);
    if (!part) return;

    if (store.nearestSnapZone) {
      const zone = spec.snapZones.find((z) => z.id === store.nearestSnapZone);
      if (zone && zone.partId === part.id) {
        store.placePart(part.id);
        playClick();
        return;
      }
    }
    // outside valid zone — bounce back (simply release, tray card becomes available again)
    store.drop();
  }, []);

  useEffect(() => {
    if (!heldPart) return;
    // "Armed" guard — ignore the pointerup that fires immediately after the tray-card
    // click (same gesture as the pickup). Arm after the first pointermove, or after
    // 300ms, whichever is sooner. After arming, pointerup commits or rejects.
    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
    }, 300);
    const onMove = (e: PointerEvent) => {
      armed = true;
      updatePosition(e.clientX, e.clientY);
    };
    const onUp = (_e: PointerEvent) => {
      if (!armed) return;
      commitOrReject();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useEngineStore.getState().drop();
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(armTimer);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [heldPart, updatePosition, commitOrReject]);

  return { groupRef };
}
