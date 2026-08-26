'use client';

import { useState, useEffect } from 'react';
import { getAudioEngine, type AudioEngineState } from '@/lib/audio/audio-engine';
import { useReciterStore } from '@/stores/reciter-store';

export function FloatingPlayer() {
  const [state, setState] = useState<AudioEngineState>({
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    currentAyahIndex: 0,
    currentTimeMs: 0,
    totalDurationMs: 0,
    error: null,
    hasWordTiming: false,
  });
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const engine = getAudioEngine();
  const { getSelectedReciter } = useReciterStore();
  const currentReciter = getSelectedReciter();

  useEffect(() => {
    const unsub = engine.subscribe((s) => {
      setState(s);
      setVisible(s.isPlaying || s.isPaused);
    });
    return unsub;
  }, []);

  if (!visible || state.isComplete) return null;

  const progress = state.totalDurationMs > 0
    ? (state.currentTimeMs / state.totalDurationMs) * 100
    : 0;

  const handlePlayPause = () => {
    if (state.isPlaying) engine.pause();
    else if (state.isPaused) engine.resume();
  };

  const reciterLabel = currentReciter.style
    ? `${currentReciter.nameArabic} (${currentReciter.style})`
    : currentReciter.nameArabic;

  if (minimized) {
    return (
      <div
        className="fixed left-4 right-4 z-50 lg:hidden"
        style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="glass-strong rounded-2xl p-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              aria-label={state.isPlaying ? 'إيقاف التلاوة مؤقتاً' : 'تشغيل التلاوة'}
              className="w-10 h-10 rounded-full bg-quran-emerald flex items-center justify-center text-quran-gold text-lg shrink-0 active:scale-95 transition-transform"
            >
              {state.isPlaying ? '⏸' : '▶'}
            </button>
            <div className="flex-1 min-w-0">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-quran-gold/60 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <button
              onClick={() => setMinimized(false)}
              aria-label="توسيع المشغل"
              className="text-quran-ivory-muted text-xs px-2"
            >
              ⤢
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed left-0 right-0 z-50 lg:hidden px-4"
      style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="glass-strong rounded-2xl p-4 max-w-lg mx-auto animate-slide-up">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-quran-gold font-bold truncate">{reciterLabel}</span>
          <button
            onClick={() => setMinimized(true)}
            aria-label="تصغير المشغل"
            className="text-quran-ivory-muted text-xs hover:text-quran-ivory"
          >
            ⬇ تصغير
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={handlePlayPause}
            aria-label={state.isPlaying ? 'إيقاف التلاوة مؤقتاً' : 'تشغيل التلاوة'}
            className="w-12 h-12 rounded-full bg-quran-emerald flex items-center justify-center text-quran-gold text-xl shrink-0 active:scale-95 transition-transform"
          >
            {state.isPlaying ? '⏸' : '▶'}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-quran-ivory truncate">
              آية {state.currentAyahIndex + 1}
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-quran-gold/60 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => engine.replay()}
            aria-label="إعادة تشغيل المقطع من البداية"
            className="flex-1 glass rounded-xl py-2 text-xs text-quran-ivory-muted hover:text-quran-ivory transition-colors"
          >
            ↻ إعادة
          </button>
          <button
            onClick={() => { engine.stop(); setVisible(false); }}
            aria-label="إيقاف التلاوة"
            className="flex-1 glass rounded-xl py-2 text-xs text-quran-ivory-muted hover:text-quran-ivory transition-colors"
          >
            ⏹ إيقاف
          </button>
        </div>
      </div>
    </div>
  );
}
