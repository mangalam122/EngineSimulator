/**
 * Central Zustand store.
 *
 * Per design doc §5.1 we model four slices: assembly, mode, engine, ui.
 * Everything lives in a single store so components can subscribe to the
 * slices they care about and keep re-renders narrow.
 *
 * Runtime engine values (crankAngle, piston positions, valve states) are
 * intentionally stored as refs-in-store — writes happen inside useFrame
 * every tick, so we expose them via a getState() path (see useEngineAnimation)
 * rather than relying on hook subscriptions, which would force a re-render
 * every frame (§8.3 non-negotiable).
 */
import { create } from 'zustand';

export type AppMode = 'assembly' | 'run';
export type EngineSpecId = 'inline-4' | 'v-twin';

export interface EngineState {
  /* ---- assembly slice ---- */
  assembledParts: string[];
  heldPart: string | null;
  nearestSnapZone: string | null;

  /* ---- mode slice ---- */
  mode: AppMode;
  selectedPart: string | null; // drives Inspect overlay
  cutawayEnabled: boolean;

  /* ---- engine-type slice ---- */
  engineSpecId: EngineSpecId;

  /* ---- engine slice (driven by useFrame, read by UI) ---- */
  rpm: number;

  /* ---- ui slice ---- */
  trayOpen: boolean;
  audioEnabled: boolean;
  assemblyCompleteCelebration: boolean;

  /* ---- actions ---- */
  pickUp: (partId: string) => void;
  drop: () => void;
  setNearestSnapZone: (zoneId: string | null) => void;
  placePart: (partId: string) => void;
  resetAssembly: () => void;
  setMode: (mode: AppMode) => void;
  selectPart: (id: string | null) => void;
  setCutaway: (on: boolean) => void;
  setRpm: (rpm: number) => void;
  setTrayOpen: (open: boolean) => void;
  setAudioEnabled: (on: boolean) => void;
  clearCelebration: () => void;
  setEngineSpec: (id: EngineSpecId) => void;
}

export const useEngineStore = create<EngineState>((set) => ({
  assembledParts: [],
  heldPart: null,
  nearestSnapZone: null,

  mode: 'assembly',
  selectedPart: null,
  cutawayEnabled: false,

  engineSpecId: 'inline-4',

  rpm: 900,

  trayOpen: true,
  audioEnabled: true,
  assemblyCompleteCelebration: false,

  pickUp: (partId) => set({ heldPart: partId, selectedPart: null }),
  drop: () => set({ heldPart: null, nearestSnapZone: null }),
  setNearestSnapZone: (zoneId) => set({ nearestSnapZone: zoneId }),
  placePart: (partId) =>
    set((s) => {
      if (s.assembledParts.includes(partId)) return s;
      const next = [...s.assembledParts, partId];
      return {
        assembledParts: next,
        heldPart: null,
        nearestSnapZone: null,
      };
    }),
  resetAssembly: () =>
    set({
      assembledParts: [],
      heldPart: null,
      nearestSnapZone: null,
      mode: 'assembly',
      selectedPart: null,
      cutawayEnabled: false,
      assemblyCompleteCelebration: false,
    }),
  setMode: (mode) => set({ mode, selectedPart: null }),
  selectPart: (id) => set({ selectedPart: id }),
  setCutaway: (on) => set({ cutawayEnabled: on }),
  setRpm: (rpm) => set({ rpm }),
  setTrayOpen: (open) => set({ trayOpen: open }),
  setAudioEnabled: (on) => set({ audioEnabled: on }),
  clearCelebration: () => set({ assemblyCompleteCelebration: false }),
  setEngineSpec: (id) =>
    set({
      engineSpecId: id,
      // Switching engines invalidates the current assembly — everything resets.
      assembledParts: [],
      heldPart: null,
      nearestSnapZone: null,
      mode: 'assembly',
      selectedPart: null,
      cutawayEnabled: false,
      assemblyCompleteCelebration: false,
      // Reset to a sensible idle RPM that both specs support (700–900 covers both).
      rpm: 900,
    }),
}));

/**
 * Runtime-only animation values. Kept OUTSIDE the React store on purpose —
 * useFrame writes 60× per second; any subscriber would thrash.
 * Components that need to *read* this (e.g. the cutaway combustion glow)
 * should do so inside their own useFrame.
 */
export const engineRuntime = {
  crankAngle: 0, // radians, 0..2π
  pistonY: [0, 0, 0, 0] as number[],
  valveOpen: [false, false, false, false, false, false, false, false] as boolean[], // intake x4, exhaust x4
  sparkFlash: [0, 0, 0, 0] as number[], // decay 1→0 on fire
  lastFrameTime: 0,
};
