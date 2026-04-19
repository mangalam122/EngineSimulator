/**
 * SnapZones — invisible target volumes for drag-to-snap assembly (§5.3).
 *
 * Each zone is a small sphere. Phase 1 renders them all (very subtle) so we
 * can eyeball their positions during dev. Phase 2 switches behaviour:
 *   - Hidden unless a part is held
 *   - The *nearest* zone (from the store) glows accent-orange
 *   - Filled zones disappear entirely
 */
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function SnapZones() {
  const spec = useActiveSpec();
  const SNAP_ZONES = spec.snapZones;
  const PART_BY_ID = Object.fromEntries(spec.parts.map((p) => [p.id, p]));
  const heldPart = useEngineStore((s) => s.heldPart);
  const assembled = useEngineStore((s) => s.assembledParts);
  const nearest = useEngineStore((s) => s.nearestSnapZone);

  return (
    <group name="snap-zones">
      {SNAP_ZONES.map((zone) => {
        const isFilled = assembled.includes(zone.partId);
        if (isFilled) return null;

        // Show only zones relevant to the held part. If nothing held, hide.
        const held = heldPart ? PART_BY_ID[heldPart] : null;
        const relevant = held && held.snapZoneId === zone.id;

        // Subtle "breathing" only when relevant (§4.1.2)
        const isNearest = nearest === zone.id;
        const opacity = relevant ? (isNearest ? 0.55 : 0.18) : 0;
        const color = isNearest ? '#ff7a1a' : '#ffffff';

        if (opacity === 0) return null;
        return (
          <mesh
            key={zone.id}
            position={zone.position}
            name={`snapzone-${zone.id}`}
            userData={{ snapZoneId: zone.id }}
          >
            <sphereGeometry args={[zone.radius, 24, 16]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
}
