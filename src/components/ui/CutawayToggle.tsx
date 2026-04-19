/**
 * CutawayToggle — enables X-ray view of the engine (§4.2.2).
 *
 * Only usable in Run Mode (per doc).
 */
import { useEngineStore } from '../../store/useEngineStore';

export default function CutawayToggle() {
  const mode = useEngineStore((s) => s.mode);
  const cutaway = useEngineStore((s) => s.cutawayEnabled);
  const setCutaway = useEngineStore((s) => s.setCutaway);
  const disabled = mode !== 'run';

  return (
    <button
      onClick={() => !disabled && setCutaway(!cutaway)}
      disabled={disabled}
      title={disabled ? 'Enter Run Mode to use cutaway' : cutaway ? 'Disable cutaway' : 'Enable cutaway (X-ray)'}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: cutaway ? 'rgba(255,122,26,0.18)' : 'rgba(255,255,255,0.05)',
        border: '1px solid ' + (cutaway ? 'rgba(255,122,26,0.5)' : 'var(--border-subtle)'),
        color: cutaway ? 'var(--accent)' : 'var(--text-primary)',
        fontSize: 13,
        opacity: disabled ? 0.35 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {cutaway ? '◐ X-Ray on' : '◯ X-Ray'}
    </button>
  );
}
