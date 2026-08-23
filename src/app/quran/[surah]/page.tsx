'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { GlassCard } from '@/components/ui/GlassCard';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { SURAH_META } from '@/lib/data/surahs';
import { fetchVersesBySurah, getAlafasyAudioUrl } from '@/lib/quran/quran-foundation';
import type { Verse } from '@/lib/quran/types';

export default function SurahReaderPage() {
  const params = useParams();
  const surahId = Number(params.surah);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTajweed, setShowTajweed] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: number; end: number } | null>(null);

  const surahMeta = SURAH_META.find((s) => s.id === surahId);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchVersesBySurah(surahId);
        setVerses(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [surahId]);

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
            <a href="/quran" className="text-quran-ivory-muted hover:text-quran-ivory text-sm">
              → القرآن
            </a>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-amiri text-2xl font-bold text-quran-ivory">
                سورة {surahMeta.nameArabic}
              </h1>
              <p className="text-sm text-quran-ivory-muted">
                {surahMeta.nameEnglish} — {surahMeta.ayahs} آية — {surahMeta.revelation}
              </p>
            </div>
            <button
              onClick={() => setShowTajweed(!showTajweed)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                showTajweed
                  ? 'bg-quran-gold/20 text-quran-gold'
                  : 'glass text-quran-ivory-muted'
              }`}
            >
              التجويد
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4 animate-pulse">📖</div>
            <p className="text-quran-ivory-muted">جارٍ التحميل...</p>
          </div>
        ) : (
          <>
            <GlassCard strong className="p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-quran-gold font-bold">اختر مشهدين للصلاة</span>
              </div>
              <p className="text-xs text-quran-ivory-muted">
                اضغط على رقم أول آية ثم آخر آية لاختيار مشهد
              </p>
            </GlassCard>

            <div className="space-y-1">
              {verses.map((verse) => (
                <div
                  key={verse.verseKey}
                  className={`p-3 rounded-lg transition-all hover:bg-white/3 ${
                    selectedRange &&
                    verse.verseNumber >= selectedRange.start &&
                    verse.verseNumber <= selectedRange.end
                      ? 'bg-quran-emerald/20 border border-quran-gold/20'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => {
                        if (!selectedRange) {
                          setSelectedRange({ start: verse.verseNumber, end: verse.verseNumber });
                        } else if (verse.verseNumber > selectedRange.start) {
                          setSelectedRange({ ...selectedRange, end: verse.verseNumber });
                        } else {
                          setSelectedRange({ start: verse.verseNumber, end: selectedRange.end });
                        }
                      }}
                      className="verse-number flex-shrink-0 mt-1"
                    >
                      {verse.verseNumber}
                    </button>
                    <p className="quran-text text-quran-ivory leading-relaxed">
                      {verse.textUthmani}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedRange && (
              <div className="fixed bottom-20 left-0 right-0 z-50 px-4">
                <GlassCard strong className="p-4 max-w-lg mx-auto">
                  <div className="text-center mb-3">
                    <span className="text-sm text-quran-gold font-bold">
                      المشهد: الآية {toArabicNumber(selectedRange.start)} — {toArabicNumber(selectedRange.end)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <AudioPlayer
                      url={getAlafasyAudioUrl(`${surahId}:${selectedRange.start}`)}
                      label="تشغيل"
                      className="flex-1 justify-center"
                    />
                    <button
                      onClick={() => setSelectedRange(null)}
                      className="glass rounded-xl px-4 py-2 text-sm text-quran-ivory-muted"
                    >
                      إلغاء
                    </button>
                  </div>
                </GlassCard>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}

function toArabicNumber(num: number): string {
  const arabicNums = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num
    .toString()
    .split('')
    .map((d) => arabicNums[parseInt(d)])
    .join('');
}
