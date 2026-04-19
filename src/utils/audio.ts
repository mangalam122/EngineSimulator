/**
 * Audio — synthesized via Web Audio API (no external assets).
 *
 * Per design doc §2.2 the spec calls for a snap click, an engine idle loop,
 * and a rev sound. We generate all three procedurally:
 *   • click      — short tight noise burst with a pitched click
 *   • engine     — summed sawtooth oscillators → lowpass filter → gain
 *                  frequency pegged to (rpm / 60) × cyl count / 2
 *   • shutdown   — quick fade-out when switching back to assembly
 *
 * We don't start AudioContext until first interaction (browser policy).
 */
import { useEngineStore } from '../store/useEngineStore';
import { getActiveSpec } from '../data/engineSpecs';

let ctx: AudioContext | null = null;
let engineNodes: {
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
} | null = null;
// Potato-potato modulation state (V-twin). We re-schedule a repeating 2-pulse
// envelope on the gain node; the uneven 315°/405° gap gives that signature
// Harley idle rhythm.
let potatoTimer: number | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext || (window as any).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function playClick() {
  const store = useEngineStore.getState();
  if (!store.audioEnabled) return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(840, t);
  osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.exponentialRampToValueAtTime(0.18, t + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.14);
}

/** Start (or ensure running) the idle engine loop. Call every time RPM changes. */
export function setEngineAudioRpm(rpm: number) {
  const store = useEngineStore.getState();
  if (!store.audioEnabled) {
    stopEngineAudio();
    return;
  }
  const c = getCtx();
  if (!c) return;

  const spec = getActiveSpec();
  const preset = spec.audioPreset;

  // Firings per second.  4-stroke: rpm/60 × cylinders / 2.
  const firePerSec = (rpm / 60) * (spec.cylinderCount / 2);
  // Inline-4: smooth braap — perceived pitch ~ fireHz × 2.
  // V-twin potato: fundamental should be low & lumpy; pitch tracks the
  // crankshaft rev rate (rpm/60), not the firing rate, because the uneven
  // spacing creates the signature timbre.
  const fundamental =
    preset === 'potato'
      ? Math.max(28, Math.min(140, (rpm / 60) * 2))
      : Math.max(40, Math.min(360, firePerSec * 2));

  if (!engineNodes) {
    const osc1 = c.createOscillator();
    const osc2 = c.createOscillator();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    filter.type = 'lowpass';
    filter.Q.value = 3;
    gain.gain.value = 0;
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain).connect(c.destination);
    osc1.start();
    osc2.start();
    engineNodes = { osc1, osc2, filter, gain };
  }

  const { osc1, osc2, filter, gain } = engineNodes;
  const t = c.currentTime;
  osc1.frequency.cancelScheduledValues(t);
  osc2.frequency.cancelScheduledValues(t);
  filter.frequency.cancelScheduledValues(t);
  gain.gain.cancelScheduledValues(t);

  if (preset === 'potato') {
    // Slightly detuned pair — gives V-twin its throaty two-voice texture.
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.linearRampToValueAtTime(fundamental, t + 0.12);
    osc2.frequency.linearRampToValueAtTime(fundamental * 1.02, t + 0.12);
    filter.frequency.linearRampToValueAtTime(480 + (rpm / 5500) * 1400, t + 0.12);
    // The potato envelope (below) drives gain directly; set a baseline only.
    gain.gain.linearRampToValueAtTime(0.02, t + 0.15);
    startPotatoEnvelope(rpm);
  } else {
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    stopPotatoEnvelope();
    osc1.frequency.linearRampToValueAtTime(fundamental, t + 0.12);
    osc2.frequency.linearRampToValueAtTime(fundamental * 0.5, t + 0.12);
    filter.frequency.linearRampToValueAtTime(800 + (rpm / 6000) * 2400, t + 0.12);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.2);
  }
}

/** Schedule the "potato-potato" amplitude envelope — two pulses per crank
 *  revolution (720° cycle = one pulse at 0°, one at 315°, then a 405° gap),
 *  re-scheduled every window so pulses stay locked to the current RPM. */
function startPotatoEnvelope(rpm: number) {
  stopPotatoEnvelope();
  const c = getCtx();
  if (!c || !engineNodes) return;
  const cyclesPerSec = rpm / 60 / 2; // a 4-stroke cycle is 2 crank revs = 720°
  const cycleSec = 1 / cyclesPerSec;
  // Pulse at start of cycle (cyl 1), then at 315/720 of the way through (cyl 2).
  const gap1 = cycleSec * (315 / 720);
  const pulseDur = Math.min(0.11, cycleSec * 0.18);
  const peak = 0.18;
  const base = 0.02;

  const schedule = () => {
    if (!engineNodes) return;
    const t = c.currentTime + 0.02;
    const g = engineNodes.gain.gain;
    // Pulse 1
    g.setValueAtTime(base, t);
    g.linearRampToValueAtTime(peak, t + pulseDur * 0.25);
    g.exponentialRampToValueAtTime(base, t + pulseDur);
    // Pulse 2 at 315° offset
    const t2 = t + gap1;
    g.setValueAtTime(base, t2);
    g.linearRampToValueAtTime(peak * 0.9, t2 + pulseDur * 0.25);
    g.exponentialRampToValueAtTime(base, t2 + pulseDur);
  };
  schedule();
  // Reschedule slightly before the cycle ends so pulses stay continuous.
  potatoTimer = window.setInterval(schedule, Math.max(60, cycleSec * 1000 - 20));
}

function stopPotatoEnvelope() {
  if (potatoTimer !== null) {
    window.clearInterval(potatoTimer);
    potatoTimer = null;
  }
}

export function stopEngineAudio() {
  stopPotatoEnvelope();
  const c = getCtx();
  if (!c || !engineNodes) return;
  const t = c.currentTime;
  engineNodes.gain.gain.cancelScheduledValues(t);
  engineNodes.gain.gain.linearRampToValueAtTime(0, t + 0.25);
}
