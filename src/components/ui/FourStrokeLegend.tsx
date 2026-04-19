/**
 * FourStrokeLegend — cutaway-mode overlay explaining the 4 strokes (§7.3).
 *
 * Highlights the active stroke for cylinder 1 based on crankAngle. Subscribes
 * to engineRuntime on a slow 10hz timer so the UI doesn't re-render at 60fps.
 *
 * On mobile the full panel overlaps the RPM slider, so we collapse to a tiny
 * "current stroke" pill that the user can tap to expand the full legend.
 */
import { useEffect, useState } from 'react';
import { useEngineStore, engineRuntime } from '../../store/useEngineStore';

const STROKES: { name: string; body: string; range: [number, number] }[] = [
  { name: 'Intake',       body: 'Piston moves down. Intake valve opens. Air and fuel are drawn into the cylinder.', range: [0, 180] },
  { name: 'Compression',  body: 'Both valves closed. Piston moves up, compressing the mixture to ~1/10 its volume.', range: [180, 360] },
  { name: 'Power',        body: 'Spark plug fires. Burning mixture expands violently, pushing the piston down. The only stroke that generates power.', range: [360, 540] },
  { name: 'Exhaust',      body: 'Exhaust valve opens. Piston moves up, pushing burnt gases out. Cycle repeats.', range: [540, 720] },
];

export default function FourStrokeLegend() {
  const mode = useEngineStore((s) => s.mode);
  const cutaway = useEngineStore((s) => s.cutawayEnabled);
  const [active, setActive] = useState(0);
  // Default collapsed on narrow viewports so the firing badge and RPM slider
  // stay visible; the user can expand on demand. Desktop defaults to expanded.
  const [expanded, setExpanded] = useState(
    typeof window !== 'undefined' ? window.innerWidth > 640 : true,
  );

  useEffect(() => {
    if (!(mode === 'run' && cutaway)) return;
    const id = window.setInterval(() => {
      // Four-stroke cycle spans 720° (2 full crank revolutions).
      // engineRuntime.crankAngle is 0..2π (one rev). Track full cycle via our own counter.
      const deg = (engineRuntime.crankAngle * 180) / Math.PI;
      const cyl1Cycle = ((deg % 720) + 720) % 720;
      const idx = STROKES.findIndex(
        (s) => cyl1Cycle >= s.range[0] && cyl1Cycle < s.range[1],
      );
      setActive(idx < 0 ? 0 : idx);
    }, 100);
    return () => window.clearInterval(id);
  }, [mode, cutaway]);

  if (!(mode === 'run' && cutaway)) return null;

  if (!expanded) {
    // Collapsed pill — tap to expand. Takes almost no space so the RPM
    // slider and firing badge have room on small screens.
    return (
      <button
        data-ui-panel="legend"
        onClick={() => setExpanded(true)}
        style={{
          position: 'absolute',
          left: 16,
          bottom: 20,
          pointerEvents: 'auto',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 999,
          padding: '8px 14px',
          backdropFilter: 'blur(12px)',
          color: 'var(--accent)',
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 0.5,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        title="Tap to see the 4-stroke explanation"
      >
        <span style={{ color: 'var(--text-secondary)', fontSize: 10, letterSpacing: 2 }}>STROKE</span>
        {active + 1}/4 · {STROKES[active].name}
      </button>
    );
  }

  return (
    <div
      data-ui-panel="legend"
      style={{
        position: 'absolute',
        left: 16,
        bottom: 20,
        pointerEvents: 'auto',
        background: 'var(--bg-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        padding: '12px 14px',
        maxWidth: 300,
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-secondary)' }}>
          4-STROKE CYCLE · CYLINDER 1
        </span>
        <button
          onClick={() => setExpanded(false)}
          style={{
            color: 'var(--text-secondary)',
            fontSize: 14,
            padding: '2px 8px',
            marginLeft: 8,
          }}
          title="Collapse"
        >
          ✕
        </button>
      </div>
      {STROKES.map((s, i) => (
        <div
          key={s.name}
          style={{
            display: 'flex',
            gap: 8,
            padding: '6px 8px',
            borderRadius: 8,
            background: i === active ? 'rgba(255,122,26,0.14)' : 'transparent',
            border: '1px solid ' + (i === active ? 'rgba(255,122,26,0.35)' : 'transparent'),
            transition: 'background 0.2s ease',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: i === active ? 'var(--accent)' : 'var(--text-secondary)',
              width: 16,
            }}
          >
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
            {i === active && (
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, lineHeight: 1.4 }}>{s.body}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
