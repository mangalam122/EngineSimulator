/**
 * ProgressBar — segmented progress (§4.1.3).
 *
 * One segment per part. Fills orange on placement. When full, shows the
 * "Engine Complete" sparkle (handled by CompletionBanner via store flag).
 */
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function ProgressBar() {
  const spec = useActiveSpec();
  const PARTS = spec.parts;
  const assembled = useEngineStore((s) => s.assembledParts);
  const mode = useEngineStore((s) => s.mode);

  if (mode !== 'assembly') return null;

  const pct = Math.round((assembled.length / PARTS.length) * 100);

  return (
    <div
      style={{
        flex: 1,
        maxWidth: 520,
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '10px 14px',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, whiteSpace: 'nowrap', gap: 12 }}>
        <span style={{ fontWeight: 600 }}>Assembly Progress</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          {assembled.length} / {PARTS.length} · {pct}%
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {PARTS.map((p, i) => {
          const placed = assembled.includes(p.id);
          return (
            <div
              key={p.id}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                background: placed ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                boxShadow: placed ? '0 0 8px rgba(255,122,26,0.5)' : 'none',
                transition: `background 0.25s ease ${i * 0.02}s`,
              }}
              title={`${i + 1}. ${p.name}${placed ? ' ✓' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
}
