/**
 * UIOverlay — the 2D chrome that sits on top of the R3F canvas.
 *
 * Per design doc §5.4 the UI is a sibling of <Canvas>, not a descendant.
 * Everything here uses regular DOM and framer-motion for panel animation.
 */
import ModeToggle from './ModeToggle';
import PartsTray from './PartsTray';
import ProgressBar from './ProgressBar';
import InspectPanel from './InspectPanel';
import CutawayToggle from './CutawayToggle';
import RPMSlider from './RPMSlider';
import AudioToggle from './AudioToggle';
import CompletionBanner from './CompletionBanner';
import FourStrokeLegend from './FourStrokeLegend';
import FiringOrderBadge from './FiringOrderBadge';
import EngineSelector from './EngineSelector';
import OnboardingCoach from './OnboardingCoach';
import { useActiveSpec } from '../../data/engineSpecs';

export default function UIOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      {/* Top bar — title on left, controls on right; progress bar sits below on narrow viewports */}
      <div
        data-ui-panel="top-bar"
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'none',
        }}
      >
        <TitleBlock />
        <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto', flexShrink: 0, flexWrap: 'wrap' }}>
          <EngineSelector />
          <AudioToggle />
          <CutawayToggle />
          <ModeToggle />
        </div>
        <div style={{ flexBasis: '100%', display: 'flex', pointerEvents: 'none' }}>
          <ProgressBar />
        </div>
      </div>

      {/* Right: tray */}
      <PartsTray />

      {/* Right: inspect */}
      <InspectPanel />

      {/* Bottom center: RPM slider (run mode) */}
      <RPMSlider />

      {/* Bottom left: 4-stroke legend (cutaway) */}
      <FourStrokeLegend />

      {/* Overlay: firing order badge (run mode) */}
      <FiringOrderBadge />

      {/* Completion celebration */}
      <CompletionBanner />

      {/* First-visit welcome + contextual hints for new users */}
      <OnboardingCoach />
    </div>
  );
}

function TitleBlock() {
  const spec = useActiveSpec();
  return (
    <div data-ui-panel="title" style={{ pointerEvents: 'none', minWidth: 0, whiteSpace: 'nowrap' }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: 'var(--text-secondary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {spec.shortLabel} · ASSEMBLE &amp; RUN
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>Engine Visualizer</div>
    </div>
  );
}
