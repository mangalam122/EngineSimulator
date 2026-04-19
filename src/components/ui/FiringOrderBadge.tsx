/**
 * FiringOrderBadge — small HUD showing the 1-3-4-2 firing order and which
 * cylinder is currently firing (§4.2.1).
 */
import { useEffect, useState } from 'react';
import { useEngineStore, engineRuntime } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function FiringOrderBadge() {
  const spec = useActiveSpec();
  const mode = useEngineStore((s) => s.mode);
  const [fired, setFired] = useState<number | null>(null);

  useEffect(() => {
    if (mode !== 'run') return;
    const id = window.setInterval(() => {
      // Which spark flashed most recently?
      const slice = engineRuntime.sparkFlash.slice(0, spec.cylinderCount);
      const max = Math.max(...slice);
      if (max < 0.25) { setFired(null); return; }
      const idx = slice.indexOf(max);
      setFired(idx + 1);
    }, 80);
    return () => window.clearInterval(id);
  }, [mode, spec.cylinderCount]);

  if (mode !== 'run') return null;
  const order: number[] = spec.firingCycle.map((f) => f.cyl);

  return (
    <div
      data-ui-panel="firing-badge"
      style={{
        position: 'absolute',
        left: 16,
        top: 80,
        pointerEvents: 'none',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '10px 12px',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-secondary)' }}>FIRING ORDER</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {order.map((cyl) => (
          <div
            key={cyl}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: fired === cyl ? 'rgba(255,122,26,0.3)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (fired === cyl ? 'var(--accent)' : 'var(--border-subtle)'),
              color: fired === cyl ? 'var(--accent)' : 'var(--text-primary)',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.1s ease',
            }}
          >
            {cyl}
          </div>
        ))}
      </div>
    </div>
  );
}
