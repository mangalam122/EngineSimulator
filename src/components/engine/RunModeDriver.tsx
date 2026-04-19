/**
 * RunModeDriver — mounts the engine animation hook.
 *
 * Lives inside <Canvas> so useFrame is available, but renders nothing itself.
 */
import { useEngineAnimation } from '../../hooks/useEngineAnimation';

export default function RunModeDriver() {
  useEngineAnimation();
  return null;
}
