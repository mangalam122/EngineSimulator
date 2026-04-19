/**
 * ModeToggle — switches between Assembly and Run mode.
 *
 * Per design doc §4.2 Run mode is unlocked once all 12 parts are placed,
 * OR via a skip button. We expose the skip as a secondary affordance:
 * the toggle always lets you jump to Run mode (auto-assembles on click).
 */
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function ModeToggle() {
  const spec = useActiveSpec();
  const PARTS = spec.parts;
  const TOTAL = PARTS.length;
  const mode = useEngineStore((s) => s.mode);
  const assembled = useEngineStore((s) => s.assembledParts);
  const setMode = useEngineStore((s) => s.setMode);
  const resetAssembly = useEngineStore((s) => s.resetAssembly);

  const canRun = assembled.length === TOTAL;

  const onToggle = () => {
    if (mode === 'run') {
      setMode('assembly');
      return;
    }
    if (canRun) {
      setMode('run');
    } else {
      // Skip-to-run: auto-assemble everything and enter run mode (§4.2 "skip button").
      const store = useEngineStore.getState();
      PARTS.forEach((p) => store.placePart(p.id));
      setMode('run');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {mode === 'run' && (
        <button
          onClick={() => resetAssembly()}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: 12,
          }}
          title="Reset and start a new assembly"
        >
          ↺ Reset
        </button>
      )}
      <button
        onClick={onToggle}
        style={{
          padding: '10px 16px',
          borderRadius: 10,
          background: mode === 'run' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
          border: '1px solid ' + (mode === 'run' ? 'transparent' : 'var(--border-subtle)'),
          color: mode === 'run' ? '#0b0d10' : 'var(--text-primary)',
          fontSize: 13,
          fontWeight: 600,
          boxShadow: mode === 'run' ? '0 4px 20px rgba(255,122,26,0.45)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          whiteSpace: 'nowrap',
        }}
        title={canRun ? 'Toggle Run / Assembly' : 'Skip assembly and run'}
      >
        {mode === 'run' ? '■ Assembly' : canRun ? '▶ Run' : '▶ Skip to Run'}
      </button>
    </div>
  );
}
