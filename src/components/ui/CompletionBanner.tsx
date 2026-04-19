/**
 * CompletionBanner — full-screen "Engine Complete" moment (§4.1.3).
 *
 * Fires when assemblyCompleteCelebration is set in the store (triggered by
 * the assembly logic when the 12th part lands). Offers a big Run button.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useEngineStore } from '../../store/useEngineStore';
import { useActiveSpec } from '../../data/engineSpecs';

export default function CompletionBanner() {
  const spec = useActiveSpec();
  const on = useEngineStore((s) => s.assemblyCompleteCelebration);
  const clear = useEngineStore((s) => s.clearCelebration);
  const setMode = useEngineStore((s) => s.setMode);

  return (
    <AnimatePresence>
      {on && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(11, 13, 16, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 20,
          }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 22 }}
            style={{
              textAlign: 'center',
              padding: '40px 48px',
              background: 'var(--bg-panel-solid)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: 4, color: 'var(--accent)', marginBottom: 8 }}>
              ASSEMBLY COMPLETE
            </div>
            <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -1 }}>Engine Ready</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 10, maxWidth: 420, lineHeight: 1.5 }}>
              All {spec.parts.length} parts are in. Click Run to see your engine fire with correct
              {' '}{spec.firingOrderLabel} timing — pistons, valves, crankshaft and spark plugs all moving in sync.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 24 }}>
              <button
                onClick={() => {
                  clear();
                }}
                style={{
                  padding: '12px 18px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                }}
              >
                Keep looking
              </button>
              <button
                onClick={() => {
                  clear();
                  setMode('run');
                }}
                style={{
                  padding: '12px 22px',
                  borderRadius: 10,
                  background: 'var(--accent)',
                  color: '#0b0d10',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 4px 20px rgba(255,122,26,0.5)',
                }}
              >
                ▶ Start Engine
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
