'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAudioEngine, type AudioEngineState } from '@/lib/audio/audio-engine';
import { fetchVerseRangeWithWords, fetchAudioByRange } from '@/lib/quran/quran-foundation';
import type { VerseWithWords, Reciter } from '@/lib/quran/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { useHifzStore } from '@/stores/hifz-store';
import { useReciterStore } from '@/stores/reciter-store';
import { ReciterSelector } from './ReciterSelector';

interface Passage {
  surahNumber: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
}

interface SequentialPlayerProps {
  rakah1: Passage;
  rakah2: Passage;
  autoPlay?: boolean;
}

export function SequentialPlayer({ rakah1, rakah2, autoPlay = false }: SequentialPlayerProps) {
  const [activeRakah, setActiveRakah] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioState, setAudioState] = useState<AudioEngineState>({
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    currentAyahIndex: 0,
    currentTimeMs: 0,
    totalDurationMs: 0,
    error: null,
    hasWordTiming: false,
  });
  const [verses, setVerses] = useState<VerseWithWords[]>([]);
  const [userScrolling, setUserScrolling] = useState(false);
  const userScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const verseRefs = useRef<Map<number, HTMLElement>>(new Map());
  const engine = getAudioEngine();
  const { load: loadHifz, markMemorized, markReview, getStatus, removeRecord } = useHifzStore();
  const { selectedReciterId, getSelectedReciter } = useReciterStore();
  const currentReciter = getSelectedReciter();

  const currentPassage = activeRakah === 1 ? rakah1 : rakah2;
  const fromKey = `${currentPassage.surahNumber}:${currentPassage.ayahStart}`;
  const toKey = `${currentPassage.surahNumber}:${currentPassage.ayahEnd}`;
  const passageId = `${fromKey}-${toKey}`;
  const hifzStatus = getStatus(passageId);

  useEffect(() => { loadHifz(); }, [loadHifz]);

  // Load verses and audio for current rak'ah
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [versesData, audioData] = await Promise.all([
          fetchVerseRangeWithWords(fromKey, toKey),
          fetchAudioByRange(fromKey, toKey, currentReciter),
        ]);
        if (cancelled) return;
        setVerses(versesData);
        await engine.load(versesData, audioData.map(a => a.url));
      } catch (err) {
        if (!cancelled) setError('خطأ في تحميل المقطع');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [fromKey, toKey, currentReciter.id]);

  useEffect(() => {
    const unsub = engine.subscribe(setAudioState);
    return unsub;
  }, []);

  // Auto-play when requested
  useEffect(() => {
    if (autoPlay && !loading && verses.length > 0 && !audioState.isPlaying && !audioState.isPaused) {
      engine.play();
    }
  }, [autoPlay, loading, verses.length, activeRakah]);

  // When current rak'ah completes, auto-advance to next rak'ah
  useEffect(() => {
    if (audioState.isComplete && activeRakah === 1) {
      setActiveRakah(2);
      // Small delay to let state settle
      setTimeout(() => {
        engine.replay();
      }, 500);
    }
  }, [audioState.isComplete, activeRakah, engine]);

  // Auto-scroll to current verse (respects manual scrolling)
  useEffect(() => {
    if (userScrolling) return;
    if (audioState.currentAyahIndex >= 0 && audioState.currentAyahIndex < verses.length) {
      const verse = verses[audioState.currentAyahIndex];
      const el = verseRefs.current.get(verse.verseNumber);
      if (el) {
        const rect = el.getBoundingClientRect();
        const inView = rect.top >= 50 && rect.bottom <= window.innerHeight - 50;
        if (!inView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [audioState.currentAyahIndex, verses, userScrolling]);

  // Detect manual scrolling
  useEffect(() => {
    const handleScroll = () => {
      setUserScrolling(true);
      if (userScrollTimer.current) clearTimeout(userScrollTimer.current);
      userScrollTimer.current = setTimeout(() => setUserScrolling(false), 3000);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (userScrollTimer.current) clearTimeout(userScrollTimer.current);
    };
  }, []);

  const handlePlay = useCallback(async () => {
    if (audioState.isPaused) engine.resume();
    else if (audioState.isPlaying) engine.pause();
    else await engine.play();
  }, [audioState.isPlaying, audioState.isPaused]);

  const handleReplay = useCallback(() => { engine.replay(); }, []);
  const handleStop = useCallback(() => { engine.stop(); }, []);

  const handleVerseClick = useCallback((verseIndex: number) => {
    if (audioState.isPlaying || audioState.isPaused) {
      engine.seekToVerse(verseIndex);
    }
  }, [audioState.isPlaying, audioState.isPaused]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const progress = audioState.totalDurationMs > 0
    ? (audioState.currentTimeMs / audioState.totalDurationMs) * 100
    : 0;

  const reciterDisplayName = currentReciter.style
    ? `${currentReciter.nameArabic} (${currentReciter.style})`
    : currentReciter.nameArabic;

  if (loading) {
    return (
      <GlassCard strong className="p-8 text-center">
        <div className="text-3xl mb-3 animate-pulse">📖</div>
        <p className="text-quran-ivory-muted text-sm">جارٍ تحميل المقطع...</p>
      </GlassCard>
    );
  }

  if (error) {
    return (
      <GlassCard strong className="p-6 text-center">
        <p className="text-red-400 text-sm">{error}</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlassCard strong className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-amiri text-lg font-bold text-quran-gold">{currentPassage.surahName}</h3>
            <p className="text-xs text-quran-ivory-muted">
              الركعة {activeRakah === 1 ? 'الأولى' : 'الثانية'} • الآيات {currentPassage.ayahStart} — {currentPassage.ayahEnd} • {verses.length} آية
            </p>
          </div>
          <span className="text-xs bg-quran-emerald text-quran-gold px-2 py-1 rounded-full font-bold">
            ركعة {activeRakah}
          </span>
        </div>

        {/* Reciter Selector */}
        <div className="mb-3">
          <ReciterSelector showLabel={true} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handlePlay}
            aria-label={audioState.isPlaying ? 'إيقاف التلاوة مؤقتاً' : audioState.isComplete ? 'إعادة التلاوة' : 'تشغيل التلاوة'}
            className="min-h-[44px] flex items-center gap-2 bg-quran-emerald rounded-xl px-5 py-2.5 text-sm font-medium text-quran-gold hover:bg-quran-emerald-light active:scale-95 transition-all"
          >
            {audioState.isPlaying ? (
              <><span>⏸</span><span>إيقاف مؤقت</span></>
            ) : audioState.isComplete ? (
              <><span>↻</span><span>إعادة</span></>
            ) : (
              <><span>▶</span><span>تشغيل</span></>
            )}
          </button>
          {audioState.isPlaying && (
            <button
              onClick={handleStop}
              aria-label="إيقاف التلاوة"
              className="min-h-[44px] glass rounded-xl px-4 py-2.5 text-sm text-quran-ivory-muted hover:text-quran-ivory transition-colors"
            >
              ⏹ إيقاف
            </button>
          )}
          {audioState.isComplete && (
            <button
              onClick={handleReplay}
              aria-label="إعادة تشغيل المقطع من البداية"
              className="min-h-[44px] glass rounded-xl px-4 py-2.5 text-sm text-quran-ivory-muted hover:text-quran-ivory transition-colors"
            >
              ↻ إعادة من البداية
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-quran-olive tabular-nums w-12 text-left" aria-label="الوقت الحالي">
            {formatTime(audioState.currentTimeMs)}
          </span>
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="h-full bg-quran-gold/60 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-quran-olive tabular-nums w-12" aria-label="المدة الكلية">
            {formatTime(audioState.totalDurationMs)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-quran-olive/60">
            {audioState.hasWordTiming ? '✓ مزامنة كلمة بكلمة' : '● مزامنة على مستوى الآية'}
          </span>
          <span className="text-[10px] text-quran-gold/70 font-mono">
            القارئ: {reciterDisplayName}
          </span>
        </div>

        {/* Hifz Progress Buttons */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => hifzStatus === 'memorized' ? removeRecord(passageId) : markMemorized(passageId)}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-medium transition-all ${
              hifzStatus === 'memorized'
                ? 'bg-quran-gold/20 text-quran-gold border border-quran-gold/30'
                : 'glass text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5'
            }`}
          >
            {hifzStatus === 'memorized' ? '✓ حُفظ' : '📖 حفظت هذا المقطع'}
          </button>
          <button
            onClick={() => hifzStatus === 'review' ? removeRecord(passageId) : markReview(passageId)}
            className={`flex-1 min-h-[40px] rounded-lg text-xs font-medium transition-all ${
              hifzStatus === 'review'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                : 'glass text-quran-ivory-muted hover:text-quran-ivory hover:bg-white/5'
            }`}
          >
            {hifzStatus === 'review' ? '✓ مُراجعة' : '🔄 أريد مراجعته'}
          </button>
        </div>

        {audioState.isComplete && activeRakah === 2 && (
          <div className="mt-3 text-center">
            <span className="text-sm text-quran-gold font-amiri">✓ اكتملت الركعتان</span>
          </div>
        )}
        {audioState.isComplete && activeRakah === 1 && (
          <div className="mt-3 text-center">
            <span className="text-sm text-quran-gold font-amiri">✓ اكتملت الركعة الأولى — جاري تحضير الثانية...</span>
          </div>
        )}
      </GlassCard>

      <ReadingView
        verses={verses}
        currentAyahIndex={audioState.currentAyahIndex}
        isActive={audioState.isPlaying || audioState.isPaused}
        verseRefs={verseRefs}
        onVerseClick={handleVerseClick}
      />

      {userScrolling && (audioState.isPlaying || audioState.isPaused) && (
        <button
          onClick={() => {
            setUserScrolling(false);
            if (audioState.currentAyahIndex >= 0 && audioState.currentAyahIndex < verses.length) {
              const verse = verses[audioState.currentAyahIndex];
              const el = verseRefs.current.get(verse.verseNumber);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
          aria-label="العودة للآية الحالية"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass-strong rounded-full px-5 py-3 text-sm text-quran-gold font-medium shadow-lg hover:bg-white/10 active:scale-95 transition-all animate-fade-in"
        >
          ↓ العودة للآية الحالية
        </button>
      )}
    </div>
  );
}

// ── Reading View ─────────────────────────────────────────────────

interface ViewProps {
  verses: VerseWithWords[];
  currentAyahIndex: number;
  isActive: boolean;
  verseRefs: React.MutableRefObject<Map<number, HTMLElement>>;
  onVerseClick?: (index: number) => void;
}

function ReadingView({ verses, currentAyahIndex, isActive, verseRefs, onVerseClick }: ViewProps) {
  return (
    <div className="space-y-1">
      {verses.map((verse, vi) => {
        const isCurrentVerse = isActive && vi === currentAyahIndex;
        return (
          <div
            key={verse.verseKey}
            ref={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el); }}
            onClick={() => onVerseClick?.(vi)}
            className={`p-3 rounded-lg transition-all duration-300 ${
              isActive ? 'cursor-pointer' : ''
            } ${isCurrentVerse ? 'bg-quran-gold/10 border border-quran-gold/20' : ''}`}
          >
            <div className="flex items-start gap-2">
              <div className={`verse-number flex-shrink-0 mt-1 ${isCurrentVerse ? 'border-quran-gold bg-quran-gold/20' : ''}`}>
                {verse.verseNumber}
              </div>
              <p className="quran-text text-quran-ivory leading-relaxed" translate="no">
                {verse.textUthmani}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}