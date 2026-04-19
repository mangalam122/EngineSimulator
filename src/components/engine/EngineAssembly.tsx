/**
 * EngineAssembly — renders every part that has been placed into the engine.
 *
 * Phase 1 always renders the engine block by default so users see something
 * immediately. Later phases gate rendering on assembledParts[] from the store.
 *
 * Per design doc §5.4 this lives inside <Scene> under <Canvas>.
 */
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function EngineAssembly() {
  const spec = useActiveSpec();
  const assembled = useEngineStore((s) => s.assembledParts);
  const selected = useEngineStore((s) => s.selectedPart);
  const cutaway = useEngineStore((s) => s.cutawayEnabled);
  const heldPart = useEngineStore((s) => s.heldPart);
  const selectPart = useEngineStore((s) => s.selectPart);

  // Preview the structural "root" part (engine block / crankcase) before any
  // placement so the empty bay isn't truly empty.
  const rootPartId = spec.parts[0]?.id;
  const toRender =
    assembled.length === 0 && rootPartId ? [rootPartId] : assembled;
  const PART_MESHES = spec.partMeshes;

  return (
    <group name="engine-assembly">
      {toRender.map((id) => {
        const Mesh = PART_MESHES[id];
        if (!Mesh) return null;
        const isPreview = assembled.length === 0 && id === rootPartId;
        const isSelected = selected === id;
        const isDimmed = selected !== null && selected !== id;
        return (
          <group
            key={id}
            userData={{ partId: id }}
            onPointerDown={(e) => {
              // Only allow inspect clicks when not dragging a tray part.
              if (heldPart || isPreview) return;
              e.stopPropagation();
              selectPart(isSelected ? null : id);
            }}
          >
            <Mesh
              ghost={isPreview /* preview block appears ghosted until placed */}
              highlight={isSelected}
              dim={isDimmed && !cutaway}
            />
          </group>
        );
      })}
    </group>
  );
}
