/**
 * InspectPanel — slides in from the right when a part is selected (§4.3).
 *
 * Content: title, category badge, body (2-3 sentences), fun fact, and a
 * "How this works in Run Mode" mini diagram (a textual summary for now;
 * mini-animated-diagram is Phase 4 polish).
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useEngineStore } from '../../store/useEngineStore';
import { CATEGORY_COLOR } from '../../data/parts';
import { useActiveSpec } from '../../data/engineSpecs';
import PartThumbnail from './PartThumbnail';

const RUN_MODE_NOTES: Record<string, string> = {
  // Inline-4
  'engine-block': 'Stays still — all the drama happens inside it.',
  'crankshaft': 'Spins continuously. Its rotation drives every other motion in the engine.',
  'connecting-rods': 'Each rod swings as its piston rises and falls — a stretched-S motion.',
  'pistons': 'Rise and fall on a cosine curve. Cylinders 1 & 4 move together; 2 & 3 move opposite.',
  'head-gasket': 'Invisibly seals pressure between block and head — no motion.',
  'cylinder-head': 'Stationary roof of the combustion chambers.',
  'camshaft': 'Rotates at exactly half crank speed; lobes push valves open in turn.',
  'valves': 'Intake and exhaust valves open and close in a precise dance with the pistons.',
  'timing-belt': 'Runs around the crank and cam pulleys in a loop — visible spinning.',
  'spark-plugs': 'Flash in 1-3-4-2 order, igniting the compressed mixture.',
  'oil-pan': 'Static — but every bearing in the engine is fed from here.',
  'valve-cover': 'Seals the valve train. No motion.',
  // V-twin
  'vtw-crankcase': 'Stationary — the central hub the entire engine lives around.',
  'vtw-crankshaft': 'Spins continuously. Flywheels smooth out the V-twin\'s uneven power pulses.',
  'vtw-connecting-rods': 'Both rods pivot around the single shared crankpin — the fork rod swings one way, the blade rod swings the other.',
  'vtw-pistons': 'Both pistons reach TDC 45° apart because they share a single crankpin; the V angle does the rest.',
  'vtw-cylinders': 'Static barrels. Heat radiates out through the cooling fins — air-cooled.',
  'vtw-head-gaskets': 'Static — each gasket just seals its cylinder.',
  'vtw-cylinder-heads': 'Static. Each head hosts one intake and one exhaust valve per cylinder.',
  'vtw-camshaft': 'Spins at half crank speed. Four lobes — one per valve — pushing up into the pushrods.',
  'vtw-pushrods': 'Move up and down rhythmically, following cam lobes below and lifting rocker arms above.',
  'vtw-valves': 'Open at precise moments driven all the way from the cam via the pushrods.',
  'vtw-spark-plugs': 'Fire 315° apart — that is the "potato-potato" interval you hear at idle.',
  'vtw-rocker-boxes': 'Seal the rocker arms and oil. No motion visible from outside.',
};

export default function InspectPanel() {
  const spec = useActiveSpec();
  const PART_BY_ID = Object.fromEntries(spec.parts.map((p) => [p.id, p]));
  const selectedId = useEngineStore((s) => s.selectedPart);
  const selectPart = useEngineStore((s) => s.selectPart);
  const part = selectedId ? PART_BY_ID[selectedId] : null;

  return (
    <AnimatePresence>
      {part && (
        <motion.aside
          key={part.id}
          data-ui-panel="inspect"
          initial={{ x: 420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          style={{
            position: 'absolute',
            right: 16,
            top: 80,
            bottom: 16,
            width: 380,
            pointerEvents: 'auto',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            backdropFilter: 'blur(14px)',
            boxShadow: 'var(--shadow-1)',
            padding: '18px 18px 14px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 5,
          }}
        >
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    background: CATEGORY_COLOR[part.category],
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                  }}
                >
                  {part.category}
                </span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{part.tooltip.title}</h2>
            </div>
            <button
              onClick={() => selectPart(null)}
              style={{ color: 'var(--text-secondary)', fontSize: 18, padding: 4 }}
              title="Close"
            >
              ✕
            </button>
          </header>

          <div
            style={{
              width: '100%',
              height: 160,
              borderRadius: 10,
              marginTop: 14,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
            }}
          >
            <PartThumbnail partId={part.id} />
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.55, marginTop: 16, color: 'var(--text-primary)' }}>
            {part.tooltip.body}
          </p>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              background: 'rgba(255,122,26,0.08)',
              border: '1px solid rgba(255,122,26,0.25)',
              borderRadius: 8,
              padding: '8px 10px',
              marginTop: 6,
            }}
          >
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Fun fact · </span>
            {part.tooltip.funFact}
          </div>

          <section style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              In Run Mode
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--text-primary)', marginTop: 6 }}>
              {RUN_MODE_NOTES[part.id]}
            </p>
          </section>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
