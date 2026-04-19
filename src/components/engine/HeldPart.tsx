/**
 * HeldPart — the semi-transparent part that follows the cursor while dragging.
 *
 * Implementation:
 *   • onPointerMove on the document fires a raycast against a horizontal plane
 *     at y = 1 (above the engine) and positions the held mesh there.
 *   • When the pointer is near a valid snap zone the held mesh smooth-snaps to
 *     the zone's position (nicer than popping).
 *   • onPointerUp commits or rejects placement and updates the store.
 *
 * This component is a placeholder in Phase 1 — it renders nothing until a
 * part is picked up. The drag interaction is fully wired in Phase 2 via
 * useAssemblyInteractions.
 */
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';
import { useAssemblyInteractions } from '../../hooks/useAssemblyInteractions';

export default function HeldPart() {
  const spec = useActiveSpec();
  const heldPart = useEngineStore((s) => s.heldPart);
  const { groupRef } = useAssemblyInteractions();

  if (!heldPart) return null;
  const Mesh = spec.partMeshes[heldPart];
  if (!Mesh) return null;

  return (
    <group ref={groupRef} name="held-part">
      <Mesh ghost />
    </group>
  );
}
