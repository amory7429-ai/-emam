'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { SURAH_META } from '@/lib/data/surahs';
import { fetchVersesBySurah, fetchAudioForVerse, fetchAudioByRange } from '@/lib/quran/quran-foundation';
import { getAudioEngine, type AudioEngineState } from '@/lib/audio/audio-engine';
import { getOfflineVerses } from '@/lib/db/quran-bootstrap';
import { getCachedAudio, isAudioDownloaded } from '@/lib/db/audio-cache';
import type { Verse } from '@/lib/quran/types';
import { useReciterStore } from '@/stores/reciter-store';
import { ReciterSelector } from '@/components/quran/ReciterSelector';

const BISMILLAH_EXCLUDED = [1, 9];

export default function SurahReaderPage() {
  const params = useParams();
  const surahId = Number(params.surah);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [audioState, setAudioState] = useState<AudioEngineState>({
    isPlaying: false, isPaused: false, isComplete: false,
    currentAyahIndex: 0, currentTimeMs: 0, totalDurationMs: 0,
    error: null, hasWordTiming: false,
  });
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [activeAyah, setActiveAyah] = useState<number | null>(null);
  const [playingFullSurah, setPlayingFullSurah] = useState(false);

  const surahMeta = SURAH_META.find(s => s.id === surahId);
  const verseRefs = useRef<Map<number, HTMLElement>>(new Map());
  const engine = getAudioEngine();
  const { getSelectedReciter } = useReciterStore();
  const currentReciter = getSelectedReciter();

  const hasBismillahHeader = useMemo(() => {
    if (!surahMeta) return false;
    return !BISMILLAH_EXCLUDED.includes(surahId);
  }, [surahId, surahMeta]);

  // Load verses — offline first, then API fallback
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);

        // Try offline first
        const offlineVerses = await getOfflineVerses(surahId);
        if (!cancelled && offlineVerses && offlineVerses.length > 0) {
          setVerses(offlineVerses);
          setLoading(false);
          return;
        }

        // Fallback to API
        try {
          const data = await fetchVersesBySurah(surahId);
          if (!cancelled) setVerses(data);
        } catch {
          if (!cancelled) setVerses([]);
        }
      } catch {
        // Silent catch
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [surahId]);

  // Subscribe to audio state
  useEffect(() => {
    const unsub = engine.subscribe(setAudioState);
    return unsub;
  }, []);

  // Auto-scroll to current verse
  useEffect(() => {
    if (audioState.currentAyahIndex >= 0 && audioState.currentAyahIndex < verses.length) {
      const verse = verses[audioState.currentAyahIndex];
      const el = verseRefs.current.get(verse.verseNumber);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveAyah(verse.verseNumber);
    }
  }, [audioState.currentAyahIndex, verses]);

  // Reset playingFullSurah when playback ends
  useEffect(() => {
    if (audioState.isComplete) setPlayingFullSurah(false);
  }, [audioState.isComplete]);

  // Play single ayah — offline audio first, then online
  const handleAyahClick = useCallback(async (verseNumber: number) => {
    engine.stop();
    setPlayingFullSurah(false);

    try {
      setAudioLoading(true);
      setActiveAyah(verseNumber);

      const verseKey = `${surahId}:${verseNumber}`;
      let audioUrl = engine.getCachedUrl(verseKey);

      if (!audioUrl) {
        // Check locally downloaded audio first
        const localBlob = await getCachedAudio(verseKey, currentReciter.id);
        if (localBlob) {
          audioUrl = localBlob;
          engine.setCachedUrl(verseKey, audioUrl);
        } else {
          // Fallback to online
          if (!navigator.onLine) {
            setAudioLoading(false);
            return;
          }
          const result = await fetchAudioForVerse(verseKey, currentReciter);
          if (!result) {
            setAudioLoading(false);
            return;
          }
          audioUrl = result.url;
          engine.setCachedUrl(verseKey, audioUrl);
        }
      }

      const verseWithWords = {
        id: verseNumber, verseKey, surahNumber: surahId, verseNumber,
        textUthmani: '', juz: 0, hizb: 0, rubElHizb: 0, page: 0,
        ruku: 0, manzil: 0, sajdahNumber: null, words: [],
      };

      await engine.load([verseWithWords], [audioUrl]);
      await engine.play();
      setAudioLoading(false);
    } catch {
      setAudioLoading(false);
    }
  }, [surahId, currentReciter]);

  // Play full surah
  const handlePlayFullSurah = useCallback(async () => {
    engine.stop();

    try {
      setAudioLoading(true);
      setPlayingFullSurah(true);
      setActiveAyah(1);

      const startKey = `${surahId}:1`;
      const endKey = `${surahId}:${surahMeta?.ayahs || verses.length}`;

      const audioFiles = await fetchAudioByRange(startKey, endKey, currentReciter);
      if (audioFiles.length === 0) {
        setAudioLoading(false);
        setPlayingFullSurah(false);
        return;
      }

      // Cache all fetched URLs
      audioFiles.forEach(af => engine.setCachedUrl(af.verseKey, af.url));

      const rangeVerses = audioFiles.map((af, i) => ({
        id: i + 1, verseKey: af.verseKey, surahNumber: surahId,
        verseNumber: i + 1, textUthmani: '', juz: 0, hizb: 0,
        rubElHizb: 0, page: 0, ruku: 0, manzil: 0,
        sajdahNumber: null, words: [],
      }));

      await engine.load(rangeVerses, audioFiles.map(a => a.url));
      await engine.play();
      setAudioLoading(false);
    } catch {
      setAudioLoading(false);
      setPlayingFullSurah(false);
    }
  }, [surahId, surahMeta, verses, currentReciter]);

  // Controls
  const handlePlayPause = useCallback(async () => {
    if (audioState.isPaused) {
      engine.resume();
    } else if (audioState.isPlaying) {
      engine.pause();
    } else if (activeAyah) {
      await handleAyahClick(activeAyah);
    }
  }, [audioState.isPlaying, audioState.isPaused, activeAyah, handleAyahClick]);

  const handleStop = useCallback(() => {
    engine.stop();
    setActiveAyah(null);
    setPlayingFullSurah(false);
  }, []);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const progress = audioState.totalDurationMs > 0
    ? (audioState.currentTimeMs / audioState.totalDurationMs) * 100 : 0;

  if (!surahMeta) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-quran-ivory-muted">سورة غير موجودة</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-strong border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/quran" className="text-quran-ivory-muted hover:text-quran-ivory text-sm">
              ← القرآن
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-amiri text-2xl font-bold text-quran-ivory">
                سورة {surahMeta.nameArabic}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  surahMeta.revelation === 'مكي'
                    ? 'text-quran-gold bg-quran-gold/10'
                    : 'text-quran-emerald-light bg-quran-emerald/20'
                }`}>
                  {surahMeta.revelation}
                </span>
                <span className="text-xs text-quran-ivory-muted">
                  {surahMeta.ayahs} آية
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Reciter Selector */}
        <div className="mb-4">
          <ReciterSelector showLabel={true} />
        </div>

        {/* Audio Controls Card */}
        <GlassCard strong className="p-4 mb-4">
          {/* Top Row: Full Surah + Play/Pause + Stop */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handlePlayFullSurah}
              disabled={audioLoading}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-gradient-to-l from-quran-gold to-quran-gold/80 text-quran-bg hover:from-quran-gold/90 hover:to-quran-gold/70 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-quran-gold/20"
            >
              {audioLoading && playingFullSurah ? (
                <><span className="animate-pulse">⏳</span><span>جارٍ التحميل...</span></>
              ) : (
                <><span>📖</span><span>استماع السورة كاملة</span></>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={handlePlayPause}
              disabled={audioLoading}
              aria-label={audioState.isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-quran-emerald rounded-xl px-5 py-2.5 text-sm font-medium text-quran-gold hover:bg-quran-emerald-light active:scale-95 transition-all disabled:opacity-50"
            >
              {audioLoading && !playingFullSurah ? (
                <><span className="animate-pulse">⏳</span><span>جارٍ التحميل...</span></>
              ) : audioState.isPlaying ? (
                <><span>⏸</span><span>إيقاف مؤقت</span></>
              ) : audioState.isComplete ? (
                <><span>↻</span><span>إعادة</span></>
              ) : (
                <><span>▶</span><span>تشغيل</span></>
              )}
            </button>
            {(audioState.isPlaying || audioState.isPaused) && (
              <button
                onClick={handleStop}
                aria-label="إيقاف"
                className="min-h-[44px] glass rounded-xl px-4 py-2.5 text-sm text-quran-ivory-muted hover:text-quran-ivory transition-colors"
              >
                ⏹ إيقاف
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {(audioState.isPlaying || audioState.isPaused) && (
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-quran-olive tabular-nums w-12 text-left">
                {formatTime(audioState.currentTimeMs)}
              </span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-quran-gold/60 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-quran-olive tabular-nums w-12">
                {formatTime(audioState.totalDurationMs)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-quran-olive/60">
              {audioLoading && 'جارٍ تحميل الصوت...'}
              {!audioLoading && audioState.isPlaying && '✓ يعمل'}
              {!audioLoading && !audioState.isPlaying && 'جاهز'}
            </span>
            <span className="text-[10px] text-quran-gold/70">
              القارئ: {currentReciter.style
                ? `${currentReciter.nameArabic} (${currentReciter.style})`
                : currentReciter.nameArabic}
            </span>
          </div>

          <div className="text-center text-xs text-quran-ivory-muted mt-3">
            اضغط على أي آية للاستماع إليها مباشرة
          </div>
        </GlassCard>

        {/* Verses */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">📖</div>
            <p className="text-quran-ivory-muted">جارٍ تحميل الآيات...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {hasBismillahHeader && (
              <div className="text-center py-6 mb-4">
                <p className="quran-text text-quran-ivory text-2xl leading-relaxed" translate="no">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {verses.map(verse => {
              const isCurrentVerse = (audioState.isPlaying || audioState.isPaused) && activeAyah === verse.verseNumber;

              return (
                <div
                  key={verse.verseKey}
                  ref={(el) => { if (el) verseRefs.current.set(verse.verseNumber, el); }}
                  onClick={() => handleAyahClick(verse.verseNumber)}
                  className={`p-4 rounded-lg transition-all cursor-pointer ${
                    isCurrentVerse
                      ? 'bg-quran-gold/10 border border-quran-gold/20'
                      : 'hover:bg-white/3'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`verse-number flex-shrink-0 mt-1 ${
                      isCurrentVerse ? 'border-quran-gold bg-quran-gold/20' : ''
                    }`}>
                      {verse.verseNumber}
                    </div>
                    <p className="quran-text text-quran-ivory leading-relaxed text-lg flex-1" translate="no">
                      {verse.textUthmani}
                    </p>
                    <div className="flex-shrink-0 mt-1">
                      {isCurrentVerse && audioState.isPlaying ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); engine.pause(); }}
                          className="w-10 h-10 rounded-full bg-quran-gold/20 flex items-center justify-center text-quran-gold hover:bg-quran-gold/30 transition-colors"
                          aria-label="إيقاف مؤقت"
                        >
                          ⏸
                        </button>
                      ) : isCurrentVerse && audioState.isPaused ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); engine.resume(); }}
                          className="w-10 h-10 rounded-full bg-quran-gold/20 flex items-center justify-center text-quran-gold hover:bg-quran-gold/30 transition-colors"
                          aria-label="استئناف"
                        >
                          ▶
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAyahClick(verse.verseNumber); }}
                          className="w-10 h-10 rounded-full glass flex items-center justify-center text-quran-ivory-muted hover:text-quran-gold hover:bg-quran-gold/10 transition-colors"
                          aria-label="تشغيل الآية"
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
