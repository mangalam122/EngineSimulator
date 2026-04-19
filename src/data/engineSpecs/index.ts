/**
 * Engine spec registry + active-spec accessor.
 *
 * Every consumer that needs parts/zones/meshes/firing goes through this
 * module — never import inline4/vtwin directly from a component.
 */
import { useEngineStore } from '../../store/useEngineStore';
import { INLINE_4_SPEC } from './inline4';
import { V_TWIN_SPEC } from './vtwin';
import type { EngineSpec } from './types';

export const ENGINE_SPECS: Record<EngineSpec['id'], EngineSpec> = {
  'inline-4': INLINE_4_SPEC,
  'v-twin': V_TWIN_SPEC,
};

export const ENGINE_SPEC_LIST: EngineSpec[] = [INLINE_4_SPEC, V_TWIN_SPEC];

export const DEFAULT_SPEC_ID: EngineSpec['id'] = 'inline-4';

/** Imperative getter — safe to call from non-React code (animation driver, audio). */
export function getActiveSpec(): EngineSpec {
  const id = useEngineStore.getState().engineSpecId;
  return ENGINE_SPECS[id] ?? INLINE_4_SPEC;
}

/** Hook form — re-renders the caller when the spec changes. */
export function useActiveSpec(): EngineSpec {
  const id = useEngineStore((s) => s.engineSpecId);
  return ENGINE_SPECS[id] ?? INLINE_4_SPEC;
}

export type { EngineSpec, PartCategory, EnginePart, SnapZone, PartProps } from './types';
