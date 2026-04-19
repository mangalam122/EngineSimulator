/**
 * AssemblyCompletionWatcher — fires the celebration banner when the 12th part
 * lands (§4.1.3). Rendered outside <Canvas> so it plays nicely with React DOM.
 */
import { useEffect } from 'react';
import { useEngineStore } from '../../store/useEngineStore';
import { getActiveSpec } from '../../data/engineSpecs';

export default function AssemblyCompletionWatcher() {
  useEffect(() => {
    let lastCount = useEngineStore.getState().assembledParts.length;
    const unsub = useEngineStore.subscribe((s) => {
      const n = s.assembledParts.length;
      const total = getActiveSpec().parts.length;
      const crossed = n === total && lastCount < total;
      // Update lastCount FIRST to avoid re-entrant infinite loop — Zustand
      // notifies subscribers synchronously, and the setState below would
      // re-enter this callback with lastCount still stale otherwise.
      lastCount = n;
      if (crossed) {
        useEngineStore.setState({ assemblyCompleteCelebration: true });
      }
    });
    return unsub;
  }, []);
  return null;
}
