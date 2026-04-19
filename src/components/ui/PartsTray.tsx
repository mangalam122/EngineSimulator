/**
 * PartsTray — collapsible right-side panel listing all 12 parts.
 *
 * Design doc §4.1.1:
 *   • Parts grouped by category, in suggested assembly order.
 *   • Each card shows a thumbnail, name, category badge.
 *   • Clicking picks up the part.
 *   • Cards with unmet dependencies are greyed out with a "needs X" tooltip.
 *   • Panel is collapsible (for tablet / focus mode).
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import {
  CATEGORY_COLOR,
  CATEGORY_ORDER,
} from '../../data/parts';
import { useActiveSpec } from '../../data/engineSpecs';
import type { EnginePart } from '../../data/engineSpecs';
import { useEngineStore } from '../../store/useEngineStore';
import PartThumbnail from './PartThumbnail';

export default function PartsTray() {
  const spec = useActiveSpec();
  const PARTS = spec.parts;
  const PART_BY_ID = useMemo(
    () => Object.fromEntries(PARTS.map((p) => [p.id, p])) as Record<string, EnginePart>,
    [PARTS],
  );
  const mode = useEngineStore((s) => s.mode);
  const trayOpen = useEngineStore((s) => s.trayOpen);
  const setTrayOpen = useEngineStore((s) => s.setTrayOpen);
  const assembled = useEngineStore((s) => s.assembledParts);
  const heldPart = useEngineStore((s) => s.heldPart);
  const pickUp = useEngineStore((s) => s.pickUp);

  const grouped = useMemo(() => {
    const byCat = new Map<string, EnginePart[]>();
    for (const cat of CATEGORY_ORDER) byCat.set(cat, []);
    const sorted = [...PARTS].sort((a, b) => a.assemblyOrder - b.assemblyOrder);
    for (const p of sorted) byCat.get(p.category)?.push(p);
    return Array.from(byCat.entries()).filter(([, list]) => list.length > 0);
  }, [PARTS]);

  if (mode !== 'assembly') return null;

  return (
    <>
      {/* Collapsed handle */}
      {!trayOpen && (
        <button
          onClick={() => setTrayOpen(true)}
          style={{
            position: 'absolute',
            right: 16,
            top: 80,
            pointerEvents: 'auto',
            padding: '10px 14px',
            borderRadius: 10,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
            fontSize: 13,
            backdropFilter: 'blur(12px)',
          }}
        >
          ⟨ Parts
        </button>
      )}

      <AnimatePresence>
        {trayOpen && (
          <motion.aside
            key="tray"
            data-ui-panel="tray"
            initial={{ x: 360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 360, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            style={{
              position: 'absolute',
              right: 16,
              top: 80,
              bottom: 16,
              width: 320,
              pointerEvents: 'auto',
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              backdropFilter: 'blur(14px)',
              boxShadow: 'var(--shadow-1)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Parts Tray</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                  {assembled.length} of {PARTS.length} placed
                </div>
              </div>
              <button
                onClick={() => setTrayOpen(false)}
                style={{
                  padding: '4px 8px',
                  color: 'var(--text-secondary)',
                  fontSize: 16,
                }}
                title="Collapse tray"
              >
                ⟩
              </button>
            </header>
            <div style={{ overflowY: 'auto', padding: 10, flex: 1 }}>
              {grouped.map(([cat, parts]) => (
                <section key={cat} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: 2,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      padding: '4px 6px 6px',
                    }}
                  >
                    {cat}
                  </div>
                  {parts.map((part) => (
                    <TrayCard
                      key={part.id}
                      part={part}
                      placed={assembled.includes(part.id)}
                      held={heldPart === part.id}
                      depsMet={part.requiresParts.every((r) => assembled.includes(r))}
                      onPick={() => pickUp(part.id)}
                      partById={PART_BY_ID}
                    />
                  ))}
                </section>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

function TrayCard({
  part,
  placed,
  held,
  depsMet,
  onPick,
  partById,
}: {
  part: EnginePart;
  placed: boolean;
  held: boolean;
  depsMet: boolean;
  onPick: () => void;
  partById: Record<string, EnginePart>;
}) {
  const disabled = placed || !depsMet || held;
  const missing = part.requiresParts.filter((r) => !useEngineStore.getState().assembledParts.includes(r));
  const missingNames = missing.map((id) => partById[id]?.name ?? id).join(', ');
  const catColor = CATEGORY_COLOR[part.category];

  return (
    <button
      onClick={() => !disabled && onPick()}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: 8,
        borderRadius: 10,
        marginBottom: 6,
        background: placed
          ? 'rgba(111, 210, 122, 0.10)'
          : held
          ? 'rgba(255, 122, 26, 0.12)'
          : 'rgba(255,255,255,0.03)',
        border: '1px solid ' + (placed ? 'rgba(111,210,122,0.35)' : 'var(--border-subtle)'),
        opacity: disabled && !placed ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'grab',
        textAlign: 'left',
        transition: 'background 0.15s ease',
      }}
      title={
        placed
          ? 'Already placed ✓'
          : !depsMet
          ? `Needs: ${missingNames}`
          : held
          ? 'Release to place'
          : 'Click to pick up'
      }
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid var(--border-subtle)',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <PartThumbnail partId={part.id} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{part.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: 3,
              background: catColor,
            }}
          />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', letterSpacing: 0.5 }}>
            {part.category}
          </span>
          {placed && <span style={{ fontSize: 10, color: 'var(--success)', marginLeft: 'auto' }}>✓ placed</span>}
          {!placed && !depsMet && (
            <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              locked
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
