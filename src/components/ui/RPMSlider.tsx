/**
 * RPMSlider — bottom-center RPM control (§4.2.3).
 *
 * Range: 800 idle → 6000 redline. Controls animation speed AND audio pitch.
 */
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function RPMSlider() {
  const spec = useActiveSpec();
  const mode = useEngineStore((s) => s.mode);
  const rpm = useEngineStore((s) => s.rpm);
  const setRpm = useEngineStore((s) => s.setRpm);

  if (mode !== 'run') return null;

  const MIN = spec.rpm.min;
  const MAX = spec.rpm.max;
  const pct = ((rpm - MIN) / (MAX - MIN)) * 100;
  const redlineWarning = rpm > MAX * 0.88;

  return (
    <div
      data-ui-panel="rpm"
      style={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        padding: '14px 18px',
        backdropFilter: 'blur(12px)',
        minWidth: 340,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', gap: 8 }}>
        <span>IDLE {MIN.toLocaleString()}</span>
        <span style={{ color: redlineWarning ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 700, fontSize: 18 }}>
          {rpm.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>RPM</span>
        </span>
        <span style={{ color: redlineWarning ? 'var(--danger)' : 'var(--text-secondary)' }}>REDLINE {MAX.toLocaleString()}</span>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        step={50}
        value={rpm}
        onChange={(e) => setRpm(Number(e.target.value))}
        style={{
          width: '100%',
          marginTop: 8,
          accentColor: redlineWarning ? 'var(--danger)' : 'var(--accent)',
        }}
      />
      <div
        style={{
          position: 'relative',
          height: 3,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 2,
          marginTop: -6,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: redlineWarning
              ? 'linear-gradient(to right, var(--accent), var(--danger))'
              : 'var(--accent)',
            transition: 'width 0.1s ease',
          }}
        />
      </div>
    </div>
  );
}
