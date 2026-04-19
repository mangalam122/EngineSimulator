/**
 * AudioToggle — mute/unmute global engine audio (§4.2.3).
 */
import { useEngineStore } from '../../store/useEngineStore';
import { setEngineAudioRpm, stopEngineAudio } from '../../utils/audio';

export default function AudioToggle() {
  const audioEnabled = useEngineStore((s) => s.audioEnabled);
  const setAudio = useEngineStore((s) => s.setAudioEnabled);
  const mode = useEngineStore((s) => s.mode);
  const rpm = useEngineStore((s) => s.rpm);

  return (
    <button
      onClick={() => {
        const next = !audioEnabled;
        setAudio(next);
        if (!next) stopEngineAudio();
        else if (mode === 'run') setEngineAudioRpm(rpm);
      }}
      title={audioEnabled ? 'Mute' : 'Unmute'}
      style={{
        padding: '10px 12px',
        borderRadius: 10,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--border-subtle)',
        color: audioEnabled ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 13,
      }}
    >
      {audioEnabled ? '🔊' : '🔇'}
    </button>
  );
}
