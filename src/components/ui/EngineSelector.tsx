/**
 * EngineSelector — top-bar dropdown to switch between engine specs.
 *
 * Switching engines resets the assembly (see store.setEngineSpec). Shown in
 * the top-right controls cluster next to Audio/Cutaway/Mode toggles.
 */
import { useEngineStore } from '../../store/useEngineStore';
import { ENGINE_SPEC_LIST } from '../../data/engineSpecs';
import type { EngineSpecId } from '../../store/useEngineStore';

export default function EngineSelector() {
  const specId = useEngineStore((s) => s.engineSpecId);
  const setEngineSpec = useEngineStore((s) => s.setEngineSpec);

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 10px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        fontSize: 12,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      title="Choose which engine to assemble and run"
    >
      <span
        data-mobile-hide
        style={{ color: 'var(--text-secondary)', letterSpacing: 1, fontSize: 10 }}
      >
        ENGINE
      </span>
      <select
        value={specId}
        onChange={(e) => setEngineSpec(e.target.value as EngineSpecId)}
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          border: 'none',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          paddingRight: 4,
        }}
      >
        {ENGINE_SPEC_LIST.map((s) => (
          <option key={s.id} value={s.id} style={{ background: '#1a1d22', color: '#fff' }}>
            {s.displayName}
          </option>
        ))}
      </select>
      <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>▾</span>
    </label>
  );
}
