# Engine Visualizer — Progress Log

Source of truth: `/Users/mangalamcby/Downloads/Engine_Visualizer_Design_Doc.docx`
Working dir: `/Users/mangalamcby/mach/EngineSimulator`

## Defaults chosen (override anytime)
- **Language**: TypeScript (doc references `parts.ts` and `tsc --noEmit`).
- **Audio**: synthesized via Web Audio oscillators (no external mp3s needed).
- **3D models**: Three.js primitives (per doc §8.2 — no internet-sourced GLBs).
- **Package manager**: npm.

## Phase status

| Phase | Name | Status |
|------:|------|--------|
| 1 | Scene Foundation | ✅ complete |
| 2 | Parts & Assembly | ✅ complete (QA-verified) |
| 3 | Run Mode | ✅ complete (QA-verified) |
| 4 | Inspect & Education | ✅ complete (QA-verified) |
| 5 | Polish | ⬜ pending |

## How to run

```
npm install            # already done
npm run dev            # vite on :5173
npm run build          # tsc --noEmit + vite build (passes ✅)
```

## Architecture notes (what's where)

- `src/data/parts.ts` — 12-part catalog (§3.1). Single source of tooltip copy.
- `src/data/geometry.ts` — shared coordinate constants; cylinder pitch, crank radius, rod length, deck Y, etc.
- `src/data/snapZones.ts` — 12 invisible target volumes and their world positions.
- `src/store/useEngineStore.ts` — Zustand: assembly / mode / engine / ui slices (§5.1). **Runtime per-frame values live in `engineRuntime` outside React** (§8.3 non-negotiable).
- `src/hooks/useEngineAnimation.ts` — useFrame loop (§5.2) — slider-crank piston Y, cam lobes, spark, audio pitch.
- `src/hooks/useAssemblyInteractions.ts` — event-driven raycast / snap detect (§5.3). Shared raycaster.
- `src/utils/audio.ts` — Web Audio synthesized engine + snap click.
- `src/components/scene/Scene.tsx` — lighting, environment, ground, OrbitControls, CameraRig.
- `src/components/engine/*` — EngineAssembly, SnapZones, HeldPart, RunModeDriver, CutawayClipping, CombustionGlow, AssemblyCompletionWatcher.
- `src/components/parts/EnginePartMeshes.tsx` — primitive geometries for all 12 parts. **REPLACE WITH GLTF MODEL IN PRODUCTION** tags in comments.
- `src/components/ui/*` — ModeToggle, PartsTray, PartThumbnail, ProgressBar, InspectPanel, CutawayToggle, RPMSlider, AudioToggle, CompletionBanner, FourStrokeLegend, FiringOrderBadge.

## Log

### 2026-04-18 — Session 1
- Read design doc; confirmed 12-part MVP, 4-cyl inline, 1-3-4-2 firing.
- Chose defaults above.
- **Phase 1 complete**: Vite+React+TS+R3F+Drei+Zustand+Framer scaffold. Lighting, Environment, OrbitControls, ContactShadows. Primitive engine block visible on load. Passes `tsc --noEmit` and `vite build`.
- **Phase 2 code landed**: 12-card PartsTray (grouped by category, order-sorted, deps gating), PartThumbnail mini-canvases, onPointerDown pickUp, pointermove raycast to drag plane, pointerup commit-or-reject, progress bar, snap-zone glow when near.
- **Phase 3 code landed**: useEngineAnimation (slider-crank formula §8.5, cam = crank/2, valve lift via sinusoidal lobe window, spark detection on zero-crossing of fire angle, plug pointLight intensity). RPM slider 800–6000. AudioToggle + Web-Audio engine synth.
- **Phase 4 code landed**: Inspect panel with framer-motion slide, 30% dim on non-selected parts, X-Ray toggle (ClippingPlane on head/valve cover/block), combustion pointLight glow, 4-stroke legend with active-stroke highlight, firing-order HUD.
- Known gaps / TODOs:
  - Cutaway clipping: ClippingPlane applied only to 3 part ids (head, block, cover). May need to expand to other meshes once user tests it.
  - No loading screen yet (Phase 5).
  - No particle burst on assembly-complete yet (Phase 5).
  - No mobile touch polish yet (pointer events used, so basic drag will work, but haven't QA'd).

### 2026-04-18 — Session 2 (bug fixes + QA pass)
- **Bug fix (drag-drop)**: `src/hooks/useAssemblyInteractions.ts` — removed stale `threshold` reference in `__snapDebug` (undefined after the XZ-distance refactor) that was throwing on every pointermove in DEV and killing drag. Also removed now-unused `snapThreshold` import.
- **Bug fix (CompletionBanner buttons)**: `src/components/engine/AssemblyCompletionWatcher.tsx` had a re-entrant subscribe bug. Zustand notifies subscribers synchronously, so the watcher's `setState({ assemblyCompleteCelebration: true })` re-entered the callback before `lastCount = n` executed — causing the guard to stay stale at `lastCount < 12` and loop infinitely on the 11→12 transition (and again whenever celebration was cleared). Fix: assign `lastCount = n` BEFORE the setState. This was the root cause of "Keep Looking" and "Start Engine" appearing dead — the infinite setState loop clobbered clearCelebration's effect.
- **Live QA passed** (via Claude Preview eval + simulated pointer events):
  - All 12 parts pick up from tray, drag, and snap in dependency order (engine-block → crankshaft → rods → pistons → gasket → head → cam → valves → belt → plugs → oil-pan → valve-cover).
  - CompletionBanner appears at 12/12; "Keep looking" clears celebration, "Start Engine" switches mode to 'run' and clears celebration.
  - Run mode animation confirmed: crankAngle advances, pistonY oscillates with correct inline-4 pairing (cyls 1&4 mirror 2&3), sparkFlash fires per cylinder, valveOpen toggles.
  - X-Ray (cutaway) toggle flips `cutawayEnabled` correctly both on and off.
  - Inspect panel renders tooltip title + body + fun-fact when `selectedPart` is set.
- Remaining for Phase 5: particle burst on 12/12, loading screen, touch-specific polish, perf instrumentation.

## Resume instructions (read me first when continuing)

1. Run `cat progress.md` — find the first "🟡" phase; that is where to pick up.
2. Start dev server: `npm run dev` (port 5173). Open browser.
3. Walk through: pick up engine-block from tray → drop it near the bay → verify snap. Then crankshaft → rods → pistons → gasket → head → cam → valves → belt → plugs → oil pan → valve cover. Watch for completion banner.
4. Click "▶ Run" → confirm crankshaft spins, pistons oscillate, sparks flash on cylinders 1,3,4,2 in order.
5. Toggle "◯ X-Ray" in Run mode → confirm head/block clip on near side, combustion flashes visible.
6. Log any visual bugs at the top of the Log with the date.
7. Phase 5 polish items are explicitly the remaining scope; don't restart earlier phases.
