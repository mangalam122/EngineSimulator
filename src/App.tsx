/**
 * Root App component.
 *
 * Per design doc §5.4, this composes the R3F <Canvas> (3D world) and
 * a separate React <UI> overlay (2D chrome). They intentionally do not
 * share a DOM subtree — UI must never be nested inside <Canvas>.
 */
import { Canvas } from '@react-three/fiber';
import Scene from './components/scene/Scene';
import UIOverlay from './components/ui/UIOverlay';
import AssemblyCompletionWatcher from './components/engine/AssemblyCompletionWatcher';

export default function App() {
  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [5.5, 4, 7], fov: 45, near: 0.1, far: 100 }}
      >
        <Scene />
      </Canvas>
      <UIOverlay />
      <AssemblyCompletionWatcher />
    </>
  );
}
