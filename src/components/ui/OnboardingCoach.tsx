/**
 * OnboardingCoach — first-visit welcome card + contextual mobile hints.
 *
 * Why: on a phone, new users see a 3D model, a top bar of cryptic icons and a
 * floating "Parts" pill and have no idea what to do. A one-shot welcome card
 * explains the 3-step flow in plain language. After dismissing, a small hint
 * chip appears above the collapsed Parts pill until they open the tray, and
 * again when all parts are placed pointing at ▶ Run.
 *
 * Dismiss state is persisted to localStorage (`ev_onboarded=1`) so returning
 * users aren't nagged.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function OnboardingCoach() {
  const mode = useEngineStore((s) => s.mode);
  const trayOpen = useEngineStore((s) => s.trayOpen);
  const assembled = useEngineStore((s) => s.assembledParts);
  const setTrayOpen = useEngineStore((s) => s.setTrayOpen);
  const spec = useActiveSpec();
  const total = spec.parts.length;

  // Welcome card shows on every page load so returning users always see the
  // "Just show me it running" shortcut (no persistence by design).
  const [showWelcome, setShowWelcome] = useState(true);
  const dismissWelcome = () => setShowWelcome(false);

  // "Just watch it run" — auto-assemble everything, flip to run mode at the
  // lowest RPM with X-Ray on so the user immediately sees the animation. Great
  // for people who landed here to see the engine move, not build it.
  const tryItNow = () => {
    const store = useEngineStore.getState();
    // Place every part in dependency-safe assembly order.
    const sorted = [...spec.parts].sort((a, b) => a.assemblyOrder - b.assemblyOrder);
    for (const p of sorted) store.placePart(p.id);
    store.setMode('run');
    store.setCutaway(true);
    store.setRpm(spec.rpm.min);
    // Clear the completion banner — the user didn't earn it, and it obscures
    // the scene they came to see.
    store.clearCelebration();
    dismissWelcome();
  };

  // Contextual hint chip: shown during assembly when tray is closed, OR on the
  // Run button once everything is placed.
  const showTapTrayHint = !showWelcome && mode === 'assembly' && !trayOpen && assembled.length < total;
  const showRunHint = !showWelcome && mode === 'assembly' && assembled.length >= total;

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            key="welcome-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissWelcome}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'auto',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              key="welcome-card"
              initial={{ y: 20, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 380,
                background: 'var(--bg-panel-solid)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                padding: 22,
                boxShadow: 'var(--shadow-1)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 2,
                  color: 'var(--accent)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                  fontWeight: 700,
                }}
              >
                Welcome
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2, marginBottom: 14 }}>
                Build an engine in 3 steps
              </div>

              <Step
                n={1}
                title="Tap parts to place them"
                body="Open the Parts panel (bottom-right) and tap any part — it snaps straight into position."
              />
              <Step
                n={2}
                title="Grey parts unlock as you go"
                body="Some pieces need others first (e.g. pistons before rods). They light up when ready."
              />
              <Step
                n={3}
                title="Hit ▶ Run to fire it up"
                body="Once all parts are placed, tap ▶ Run in the top bar. Use X-Ray to see inside while it runs."
              />

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  marginTop: 18,
                  flexDirection: 'column',
                }}
              >
                <button
                  onClick={tryItNow}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'var(--accent)',
                    color: '#0b0d10',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>▶ Just show me the engine running</span>
                </button>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', marginTop: -4 }}>
                  skips assembly · X-Ray on · idle RPM
                </div>
                <button
                  onClick={() => {
                    dismissWelcome();
                    setTrayOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Build it myself
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contextual hint: "Tap here to start" — points at the floating Parts pill. */}
      <AnimatePresence>
        {showTapTrayHint && (
          <motion.div
            key="tap-tray-hint"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              right: 16,
              bottom: 72, // sits above the floating Parts pill
              pointerEvents: 'none',
              zIndex: 8,
            }}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'rgba(255, 122, 26, 0.95)',
                color: '#0b0d10',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 12px',
                borderRadius: 10,
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              Tap here to start ↓
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ready-to-run hint: shown when all parts are placed but still in assembly mode. */}
      <AnimatePresence>
        {showRunHint && (
          <motion.div
            key="run-hint"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              // Sit just under the top-bar + progress bar area so the arrow
              // points up at the ▶ Run button without covering it.
              position: 'absolute',
              top: 160,
              right: 16,
              pointerEvents: 'none',
              zIndex: 8,
            }}
          >
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                background: 'rgba(255, 122, 26, 0.95)',
                color: '#0b0d10',
                fontSize: 12,
                fontWeight: 700,
                padding: '8px 12px',
                borderRadius: 10,
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
              }}
            >
              ↑ Tap ▶ Run to start the engine
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
      <div
        style={{
          flexShrink: 0,
          width: 26,
          height: 26,
          borderRadius: 999,
          background: 'rgba(255,122,26,0.15)',
          color: 'var(--accent)',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45 }}>{body}</div>
      </div>
    </div>
  );
}
