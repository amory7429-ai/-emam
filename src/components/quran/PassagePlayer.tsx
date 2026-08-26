'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAudioEngine, type AudioEngineState } from '@/lib/audio/audio-engine';
import { fetchVerseRangeWithWords, fetchAudioByRange } from '@/lib/quran/quran-foundation';
import type { VerseWithWords, Reciter } from '@/lib/quran/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { useHifzStore } from '@/stores/hifz-store';
import { useReciterStore } from '@/stores/reciter-store';
import { ReciterSelector } from './ReciterSelector';

interface PassagePlayerProps {
  fromKey: string;
  toKey: string;
  surahName: string;
  label?: string;
  autoPlay?: boolean;
  /** Optional: override reciter ID (defaults to user's stored preference) */
  reciterId?: number;
  /** Disable auto-scroll to current verse (for browsing) */
  disableAutoScroll?: boolean;
}

type ViewMode = 'mushaf' | 'reading';

export function PassagePlayer({
  fromKey,
  toKey,
  surahName,
  label = 'تشغيل المقطع',
  autoPlay = false,
  reciterId: propReciterId,
  disableAutoScroll = false,
}: PassagePlayerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('reading');
  const [verses, setVerses] = useState<VerseWithWords[]>([]);
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
  const [zoom, setZoom] = useState(1);
  const [userScrolling, setUserScrolling] = useState(false);
  const userScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const verseRefs = useRef<Map<number, HTMLElement>>(new Map());
  const engine = getAudioEngine();
  const { load: loadHifz, markMemorized, markReview, getStatus, removeRecord } = useHifzStore();
  const { selectedReciterId, getSelectedReciter } = useReciterStore();

  // Use prop reciterId if provided, otherwise use stored preference
  const effectiveReciterId = propReciterId ?? selectedReciterId;
  const currentReciter = getSelectedReciter();

  useEffect(() => { loadHifz(); }, [loadHifz]);

  const passageId = `${fromKey}-${toKey}`;
  const hifzStatus = getStatus(passageId);

  const [, fromAyah] = fromKey.split(':').map(Number);
  const [, toAyah] = toKey.split(':').map(Number);

  // Reload audio when reciter changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
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
  }, [autoPlay, loading, verses.length]);

  // Auto-scroll to current verse (respects manual scrolling)
  useEffect(() => {
    if (disableAutoScroll) return;
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
  }, [audioState.currentAyahIndex, verses, userScrolling, disableAutoScroll]);

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

  const scrollToCurrentVerse = useCallback(() => {
    setUserScrolling(false);
    if (audioState.currentAyahIndex >= 0 && audioState.currentAyahIndex < verses.length) {
      const verse = verses[audioState.currentAyahIndex];
      const el = verseRefs.current.get(verse.verseNumber);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [audioState.currentAyahIndex, verses]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const progress = audioState.totalDurationMs > 0
    ? (audioState.currentTimeMs / audioState.totalDurationMs) * 100
    : 0;

  const uniquePages = Array.from(new Set(verses.map(v => v.page)));
  const hasMushafImages = verses.some(v => v.imageUrl);

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

  const reciterDisplayName = currentReciter.style
    ? `${currentReciter.nameArabic} (${currentReciter.style})`
    : currentReciter.nameArabic;

  return (
    <div className="space-y-4">
      <GlassCard strong className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-amiri text-lg font-bold text-quran-gold">{surahName}</h3>
            <p className="text-xs text-quran-ivory-muted">
              الآيات {fromAyah} — {toAyah} • {verses.length} آية • صفحات: {uniquePages.join(', ')}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setViewMode('reading')}
              aria-label="عرض القراءة"
              className={`min-h-[44px] min-w-[44px] text-xs px-3 py-2 rounded-lg transition-all ${
                viewMode === 'reading' ? 'bg-quran-gold/20 text-quran-gold' : 'glass text-quran-ivory-muted'
              }`}
            >
              القراءة
            </button>
            {hasMushafImages && (
              <button
                onClick={() => setViewMode('mushaf')}
                aria-label="عرض المصحف"
                className={`min-h-[44px] min-w-[44px] text-xs px-3 py-2 rounded-lg transition-all ${
                  viewMode === 'mushaf' ? 'bg-quran-gold/20 text-quran-gold' : 'glass text-quran-ivory-muted'
                }`}
              >
                المصحف
              </button>
            )}
          </div>
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
              <><span>▶</span><span>{label}</span></>
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

        {audioState.isComplete && (
          <div className="mt-3 text-center">
            <span className="text-sm text-quran-gold font-amiri">✓ اكتمل المقطع</span>
          </div>
        )}
      </GlassCard>

      {viewMode === 'reading' ? (
        <ReadingView
          verses={verses}
          currentAyahIndex={audioState.currentAyahIndex}
          isActive={audioState.isPlaying || audioState.isPaused}
          verseRefs={verseRefs}
          onVerseClick={handleVerseClick}
        />
      ) : (
        <MushafView
          verses={verses}
          currentAyahIndex={audioState.currentAyahIndex}
          isActive={audioState.isPlaying || audioState.isPaused}
          zoom={zoom}
          onZoomChange={setZoom}
          verseRefs={verseRefs}
          onVerseClick={handleVerseClick}
        />
      )}

      {userScrolling && (audioState.isPlaying || audioState.isPaused) && (
        <button
          onClick={scrollToCurrentVerse}
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

// ── Mushaf View ──────────────────────────────────────────────────

interface MushafViewProps {
  verses: VerseWithWords[];
  currentAyahIndex: number;
  isActive: boolean;
  zoom: number;
  onZoomChange: (z: number) => void;
  verseRefs: React.MutableRefObject<Map<number, HTMLElement>>;
  onVerseClick?: (index: number) => void;
}

interface PageGroup {
  page: number;
  verses: VerseWithWords[];
  imageUrl?: string;
  imageWidth?: number;
}

function MushafView({ verses, currentAyahIndex, isActive, zoom, onZoomChange, verseRefs, onVerseClick }: MushafViewProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pageGroups: PageGroup[] = verses.reduce<PageGroup[]>((acc, v) => {
    const last = acc[acc.length - 1];
    if (last && last.page === v.page) {
      last.verses.push(v);
      if (v.imageUrl && !last.imageUrl) {
        last.imageUrl = v.imageUrl;
        last.imageWidth = v.imageWidth;
      }
    } else {
      acc.push({
        page: v.page,
        verses: [v],
        imageUrl: v.imageUrl,
        imageWidth: v.imageWidth,
      });
    }
    return acc;
  }, []);

  const totalPages = pageGroups.length;
  const currentPage = pageGroups[currentPageIndex];

  // Auto-track page when audio is playing
  useEffect(() => {
    if (!isActive || currentAyahIndex < 0 || currentAyahIndex >= verses.length) return;
    const currentVerse = verses[currentAyahIndex];
    const pageIndex = pageGroups.findIndex(pg => pg.verses.some(v => v.verseKey === currentVerse.verseKey));
    if (pageIndex >= 0 && pageIndex !== currentPageIndex) {
      setCurrentPageIndex(pageIndex);
    }
  }, [currentAyahIndex, verses, isActive]);

  const goToPrevPage = useCallback(() => {
    setCurrentPageIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  const resetZoom = useCallback(() => {
    onZoomChange(1);
  }, [onZoomChange]);

  if (!currentPage) return null;

  const currentVerseInPage = currentPage.verses.some(
    (v) => {
      const globalIndex = verses.indexOf(v);
      return isActive && globalIndex === currentAyahIndex;
    }
  );

  return (
    <div className="space-y-3">
      {/* Page Navigation Bar */}
      <GlassCard strong className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPageIndex === 0}
            aria-label="الصفحة السابقة"
            className="min-h-[44px] min-w-[44px] glass rounded-lg flex items-center justify-center text-sm text-quran-ivory-muted hover:text-quran-ivory disabled:opacity-30"
          >
            →
          </button>
          <div className="text-center">
            <span className="text-xs text-quran-gold font-bold">
              الصفحة {currentPage.page}
            </span>
            <span className="text-[10px] text-quran-olive block">
              {currentPageIndex + 1} / {totalPages}
            </span>
          </div>
          <button
            onClick={goToNextPage}
            disabled={currentPageIndex >= totalPages - 1}
            aria-label="الصفحة التالية"
            className="min-h-[44px] min-w-[44px] glass rounded-lg flex items-center justify-center text-sm text-quran-ivory-muted hover:text-quran-ivory disabled:opacity-30"
          >
            ←
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
              aria-label="تصغير"
              className="min-h-[44px] min-w-[44px] glass rounded-lg flex items-center justify-center text-sm text-quran-ivory-muted hover:text-quran-ivory"
            >
              −
            </button>
            <span className="text-[10px] text-quran-olive tabular-nums w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => onZoomChange(Math.min(2, zoom + 0.1))}
              aria-label="تكبير"
              className="min-h-[44px] min-w-[44px] glass rounded-lg flex items-center justify-center text-sm text-quran-ivory-muted hover:text-quran-ivory"
            >
              +
            </button>
          </div>
          <button
            onClick={resetZoom}
            className="min-h-[44px] glass rounded-lg px-3 text-[10px] text-quran-ivory-muted hover:text-quran-ivory"
          >
            عرض الصفحة
          </button>
          <span className="text-[10px] text-quran-olive">
            {currentPage.verses[0].verseKey} — {currentPage.verses[currentPage.verses.length - 1].verseKey}
          </span>
        </div>
      </GlassCard>

      {/* Page Content */}
      <div
        ref={(el) => {
          if (el && currentPage.verses.length > 0) {
            verseRefs.current.set(currentPage.verses[0].verseNumber, el);
          }
        }}
        className={`rounded-2xl overflow-hidden transition-all duration-300 ${
          currentVerseInPage ? 'ring-2 ring-quran-gold/40' : ''
        }`}
      >
        {currentPage.imageUrl ? (
          <div
            className="bg-white/5 flex justify-center overflow-hidden"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            <img
              src={currentPage.imageUrl}
              alt={`صفحة المصحف ${currentPage.page}`}
              className="w-full h-auto"
              loading="lazy"
              style={{ objectFit: 'contain', maxWidth: '100%' }}
            />
          </div>
        ) : (
          <div
            className="p-6 bg-quran-bg/50"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          >
            <div className="quran-text-lg text-center leading-loose" dir="rtl" translate="no">
              {currentPage.verses.map((verse) => {
                const globalIndex = verses.indexOf(verse);
                const isCurrentVerse = isActive && globalIndex === currentAyahIndex;
                return (
                  <span key={verse.verseKey}>
                    {verse.textUthmani}
                    <span
                      onClick={(e) => { e.stopPropagation(); onVerseClick?.(globalIndex); }}
                      className={`inline-flex items-center justify-center w-10 h-10 mx-1 text-sm font-bold align-middle rounded-full transition-all ${
                        isActive ? 'cursor-pointer' : ''
                      } ${isCurrentVerse ? 'bg-quran-gold/20 text-quran-gold border border-quran-gold/40' : 'text-quran-gold'}`}
                    >
                      {verse.verseNumber}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="flex gap-2">
        <button
          onClick={goToPrevPage}
          disabled={currentPageIndex === 0}
          className="flex-1 min-h-[44px] glass rounded-xl py-3 text-sm text-quran-ivory-muted hover:text-quran-ivory transition-colors disabled:opacity-30"
        >
          → الصفحة السابقة
        </button>
        <button
          onClick={goToNextPage}
          disabled={currentPageIndex >= totalPages - 1}
          className="flex-1 min-h-[44px] bg-quran-emerald rounded-xl py-3 text-sm text-quran-gold font-medium hover:bg-quran-emerald-light transition-colors disabled:opacity-30"
        >
          الصفحة التالية ←
        </button>
      </div>
    </div>
  );
}